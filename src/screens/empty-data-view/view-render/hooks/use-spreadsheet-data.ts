import { useCallback, useRef, useMemo, useState, useEffect, useContext, startTransition } from 'react';
import { CellBase, Matrix } from 'react-spreadsheet';
import { useDraftData, useToaster } from '@hooks';
import { useTranslation } from 'react-i18next';
import { EmptyDataContext } from '../../context';
import { mainWorker } from '@workers/worker';
import { Database } from '@utils';
import { EXCEL } from '@constants';

// Convert ExcelSpreadsheet data format to Matrix<CellBase>
// OPTIMIZED: Uses efficient iteration for large datasets
export const convertExcelDataToMatrix = (excelData: any[]): Matrix<CellBase> => {
  if (!Array.isArray(excelData)) return [];

  // For very large datasets, use more efficient iteration
  const result: Matrix<CellBase> = [];
  const rowCount = excelData.length;

  for (let i = 0; i < rowCount; i++) {
    const row = excelData[i];
    if (!Array.isArray(row)) {
      result.push([]);
      continue;
    }

    const convertedRow: CellBase[] = [];
    const colCount = row.length;

    for (let j = 0; j < colCount; j++) {
      const cellValue = row[j];
      let value: string | number = '';

      if (cellValue === null || cellValue === undefined) {
        value = '';
      } else if (typeof cellValue === 'object') {
        // Smart property detection for various spreadsheet formats
        if ('value' in cellValue) {
          value = cellValue.value ?? '';
        } else if ('v' in cellValue) {
          // common in Luckysheet/handsontable
          value = cellValue.v ?? '';
        } else if ('m' in cellValue) {
          // formatted value
          value = cellValue.m ?? '';
        } else if ('text' in cellValue) {
          value = cellValue.text ?? '';
        } else {
          // Fallback: search for any non-object property or stringify
          const entries = Object.entries(cellValue).find(([_, v]) => typeof v !== 'object' && v !== null);
          value = entries ? String(entries[1]) : '';
        }
      } else {
        // Plain value (string, number, boolean)
        value = cellValue;
      }

      // CRITICAL: Try to convert numeric strings to numbers
      // This fixes the "Number stored as text" error in Excel logic
      if (typeof value === 'string' && value.trim() !== '') {
        const trimmed = value.trim();
        const num = Number(trimmed);
        if (!isNaN(num)) {
          value = num;
        }
      }

      // Always return CellBase format
      convertedRow.push({ value: String(value) === String(Number(value)) ? Number(value) : value } as CellBase);
    }

    result.push(convertedRow);
  }

  return result;
};

export const useSpreadsheetData = (
  INIT_DATA_KEY: string,
  storageKey: string | undefined,
  workspacePath?: string, // CRITICAL: workspacePath from props (tabName) to load data from DB
  nodeId?: string, // CRITICAL: Pass nodeId from context for robust save identification
  nodeConfig?: any // CRITICAL: Pass nodeConfig from context for reference
) => {
  const { data, columns, setData, setDataState, dataState, projectId, setProjectId } = useContext(EmptyDataContext);
  const { generateCSVDataAndSaveCSV } = useDraftData(projectId, setProjectId, nodeId, nodeConfig);
  const toaster = useToaster();
  const { t } = useTranslation('emptyDataView');

  // REMOVED: saveCount state - no longer needed since we don't force remounts after saves
  // The spreadsheet manages its own state internally and doesn't need remounts

  // CRITICAL: Track edits in a ref to avoid triggering re-renders that reset the spreadsheet
  const pendingEditsRef = useRef<Map<string, { row: number; col: number; value: string }>>(new Map());

  // CRITICAL: Prevent duplicate/concurrent saves that cause resets
  const isSavingRef = useRef<boolean>(false);

  // CRITICAL: Store latest data in ref to avoid stale closure issues in auto-save
  const latestDataRef = useRef<Matrix<CellBase>>(data || []);

  // CRITICAL: Store full grid data from spreadsheet events to ensure Modal Save 
  // has access to the SAME data as the toolbar button.
  const fullGridDataRef = useRef<any[] | undefined>(undefined);

  useEffect(() => {
    latestDataRef.current = data || [];
  }, [data]);

  // Auto-save: Debounce timer to save after user stops editing
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // CRITICAL: Debounce timer for large paste operations to prevent multiple rapid state updates
  const pasteDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPasteDataRef = useRef<any>(null);

  // Convert context data to ExcelSpreadsheet format for initialData prop
  const initialSpreadsheetDataRef = useRef<any>(undefined);
  const hasSetInitialDataRef = useRef<boolean>(false);

  // CRITICAL: Track which storageKey we've initialized for to prevent re-initialization
  const initializedStorageKeyRef = useRef<string | null>(null);

  // CRITICAL: Use state for initialData so it can update when data loads from database
  // This ensures data is visible when opening from explorer
  const [initialData, setInitialDataState] = useState<any>(undefined);

  // CRITICAL: Wrapper for setInitialData that also updates fullGridDataRef
  // This ensures that when data is imported, it's immediately available to the save logic
  const setInitialData = useCallback((newData: any) => {
    setInitialDataState(newData);
    if (newData && Array.isArray(newData)) {
      fullGridDataRef.current = newData;
    }
  }, []);

  // CRITICAL: Track loading state to show loader while data is being loaded from database
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // CRITICAL: Load data from database if workspacePath is available (saved project)
  // Hybrid Approach: Fetch on Main Thread (required by Tauri IPC), Process on Worker (Heavy CPU)
  const loadDataFromDatabase = useCallback(async (dbPath: string) => {
    // CRITICAL: Validate dbPath - reject time strings and invalid paths
    if (!dbPath || typeof dbPath !== 'string') {
      return false;
    }

    // Reject time strings (legacy check)
    if (/^\d{1,2}:\d{2}:\d{2}\s*(AM|PM)$/i.test(dbPath)) {
      return false;
    }

    // Reject paths that don't look like file paths
    if (!dbPath.includes('/') && !dbPath.includes('\\')) {
      return false;
    }

    setIsLoadingData(true);
    let db: Database | null = null;
    try {
      db = new Database(dbPath);

      // CRITICAL: Dynamically find the table name
      // Sometimes it might be 'input' (EXCEL constant), 'Sheet1', or something else
      let tableName = EXCEL;
      const tables = await db.selectQuery(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`);

      const inputExists = tables.some((t: any) => t.name === EXCEL);
      if (inputExists) {
        tableName = EXCEL;
      } else if (tables && tables.length > 0) {
        // If 'input' doesn't exist, use the first available table
        tableName = tables[0].name;
        console.log(`⚠️ [loadDataFromDatabase] Table '${EXCEL}' not found. Using '${tableName}' instead.`);
      }

      // 1. Get Count
      const countResult = await db.selectQuery(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const totalRows = countResult[0]?.count || 0;
      console.log(`📊 [loadDataFromDatabase] Total rows in database: ${totalRows.toLocaleString()} (Table: ${tableName})`);

      // 2. Fetch Raw Data (Chunked or Full)
      // DYNAMIC OPTIMIZATION: Adapt chunk size to hardware capabilities
      // High-End PC (>= 8GB RAM or >= 8 Cores) -> 200k Chunks (Instant)
      // Low-End PC -> 50k Chunks (Safe/Stable)

      const cores = navigator.hardwareConcurrency || 4;
      // @ts-ignore - deviceMemory is standard in Chrome/Edge but not in standard TS lib
      const ram = (navigator as any).deviceMemory || 4;

      const isHighEnd = cores >= 8 || ram >= 8;
      const CHUNK_SIZE = isHighEnd ? 200000 : 50000;

      console.log(`💻 [loadDataFromDatabase] Hardware Detected: ${cores} Cores, ~${ram}GB RAM`);
      console.log(`🚀 [loadDataFromDatabase] Mode: ${isHighEnd ? 'EXTREME (200k)' : 'BALANCED (50k)'}`);

      let rawResult: any[] = [];

      if (totalRows > CHUNK_SIZE) {
        console.log(`📡 [loadDataFromDatabase] Starting chunked load (Size: ${CHUNK_SIZE})...`);
        for (let offset = 0; offset < totalRows; offset += CHUNK_SIZE) {
          console.log(`📡 Fetching chunk offset: ${offset}`);
          const chunk = await db.selectQuery(
            `SELECT * FROM "${tableName}" LIMIT ${CHUNK_SIZE} OFFSET ${offset}`
          );
          if (chunk && chunk.length > 0) {
            rawResult = rawResult.concat(chunk);
          }
          // Zero delay to maximize throughput
        }
      } else {
        rawResult = await db.selectQuery(`SELECT * FROM "${tableName}"`);
      }

      // 3. Offload Processing to Worker
      console.log(`🚀 [loadDataFromDatabase] Offloading Formatting of ${rawResult.length} rows to Worker...`);
      const startTime = performance.now();

      const excelData = await mainWorker.processDbData(rawResult);

      const endTime = performance.now();
      console.log(`✅ [loadDataFromDatabase] Worker formatted data in ${((endTime - startTime) / 1000).toFixed(2)}s`);

      // 4. Update UI
      if (excelData && Array.isArray(excelData) && excelData.length > 0) {
        initialSpreadsheetDataRef.current = excelData;
        hasSetInitialDataRef.current = true;
        setInitialData(excelData);

        if (setData) {
          const converted = convertExcelDataToMatrix(excelData);
          setData(converted);
        }

        // Sync to Univer UI
        try {
          setTimeout(() => {
            const api = (window as any).univerAPI;
            if (api) {
              const workbook = api.getActiveWorkbook();
              const sheet = workbook?.getActiveSheet();
              if (sheet && excelData.length > 0) {
                const rowCount = excelData.length;
                const colCount = excelData[0]?.length || 0;

                // Expansion Logic
                if (rowCount > 0 && colCount > 0) {
                  try {
                    let currentRowCount = 1000;
                    if (typeof sheet.getRowCount === 'function') currentRowCount = sheet.getRowCount();

                    if (rowCount > currentRowCount) {
                      const needed = rowCount - currentRowCount + 50;
                      if (typeof sheet.setRowCount === 'function') sheet.setRowCount(rowCount + 50);
                      else if (typeof sheet.insertRow === 'function') sheet.insertRow(currentRowCount - 1, needed);
                    }

                    let currentColCount = 20;
                    if (typeof sheet.getColumnCount === 'function') currentColCount = sheet.getColumnCount();

                    if (colCount > currentColCount) {
                      const needed = colCount - currentColCount + 10;
                      if (typeof sheet.setColumnCount === 'function') sheet.setColumnCount(colCount + 10);
                      else if (typeof sheet.insertColumn === 'function') sheet.insertColumn(currentColCount - 1, needed);
                    }
                  } catch (e) { console.warn('Expansion failed', e); }

                  if (typeof sheet.getRange === 'function') {
                    sheet.getRange(0, 0, rowCount, colCount).setValues(excelData);
                  }
                }
              }
            }
          }, 100);
        } catch (e) { console.warn('Sync failed', e); }

        setIsLoadingData(false);
        return true;
      }

      setIsLoadingData(false);
      return false;

    } catch (error) {
      console.error('❌ Error loading data:', error);
      setIsLoadingData(false);
      return false;
    } finally {
      if (db) await db.close();
    }
  }, [INIT_DATA_KEY, setData, setInitialData]); // Added setInitialData to dependencies

  // Try to restore initial data from sessionStorage or database
  useEffect(() => {
    // CRITICAL: Create a unique key combining storageKey and workspacePath
    // This ensures we reload when workspacePath changes (e.g., opening from explorer)
    const initializationKey = `${storageKey}-${workspacePath || 'no-path'}`;

    // Only skip if we've already initialized for this exact combination
    if (initializedStorageKeyRef.current === initializationKey) {
      return; // Already initialized for this storageKey + workspacePath combination
    }

    // Priority 1: Try to load from database if workspacePath is available (saved project)
    // CRITICAL: Validate workspacePath before using it (reject time strings and invalid paths)
    const isValidWorkspacePath = workspacePath &&
      typeof workspacePath === 'string' &&
      workspacePath.trim() !== '' &&
      !/^\d{1,2}:\d{2}:\d{2}\s*(AM|PM)$/i.test(workspacePath) && // Not a time string
      (workspacePath.includes('/') || workspacePath.includes('\\')); // Looks like a file path

    if (isValidWorkspacePath && !hasSetInitialDataRef.current) {
      loadDataFromDatabase(workspacePath).then((loaded) => {
        if (loaded) {
          initializedStorageKeyRef.current = initializationKey;
        }
      });
      return; // Don't check sessionStorage if we're loading from DB
    }

    // Priority 2: Try to restore from sessionStorage
    try {
      const storedInitialData = sessionStorage.getItem(INIT_DATA_KEY);
      if (storedInitialData) {
        const parsed = JSON.parse(storedInitialData);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          initialSpreadsheetDataRef.current = parsed;
          hasSetInitialDataRef.current = true;
          initializedStorageKeyRef.current = initializationKey;
          return;
        }
      }
    } catch (e) {
      // Ignore sessionStorage errors
    }

    // Priority 3: Use data from context if available (only on first mount)
    if (!hasSetInitialDataRef.current && data && Array.isArray(data) && data.length > 0) {
      const hasData = data.some((row: any) =>
        row && Array.isArray(row) && row.some((cell: any) =>
          cell && typeof cell === 'object' && 'value' in cell && cell.value
        )
      );
      if (hasData) {
        // Convert Matrix<CellBase> to ExcelSpreadsheet format (array of arrays)
        const converted = data.map((row: any) =>
          row.map((cell: any) => {
            if (cell && typeof cell === 'object' && 'value' in cell) {
              return cell.value;
            }
            return cell || '';
          })
        );
        initialSpreadsheetDataRef.current = converted;
        hasSetInitialDataRef.current = true;
        initializedStorageKeyRef.current = initializationKey;

        // CRITICAL: Persist to sessionStorage to prevent resets on remount
        try {
          sessionStorage.setItem(INIT_DATA_KEY, JSON.stringify(converted));
        } catch (e) {
          // Ignore sessionStorage errors
        }
      }
    }
  }, [INIT_DATA_KEY, storageKey, workspacePath, loadDataFromDatabase]); // REMOVED: data from dependencies to prevent remounts

  // Handle save button click - publish data to database (like old datasheet)
  const handleSave = useCallback(async (result: any) => {
    // CRITICAL: Prevent duplicate/concurrent saves - this causes resets
    if (isSavingRef.current) {
      return;
    }

    // Cancel any pending auto-save when manual save is triggered
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }

    isSavingRef.current = true;

    try {
      let dataToSave: Matrix<CellBase> = [];
      let finalResultData = result?.data;

      let isFullSnapshot = false;

      // Priority 0: Try to fetch data DIRECTLY from Univer API if possible
      // This ensures we get exactly what's currently in the UI, even if events haven't fired
      try {
        const api = (window as any).univerAPI;
        if (api) {
          const workbook = api.getActiveWorkbook();
          const sheet = workbook?.getActiveSheet();
          if (sheet) {
            // Defensive method/property access
            const rowCount = (typeof (sheet as any).getRowCount === 'function' ? (sheet as any).getRowCount() : (sheet as any).rowCount) || 0;
            const colCount = (typeof (sheet as any).getColumnCount === 'function' ? (sheet as any).getColumnCount() : (sheet as any).columnCount) || 0;

            // If still no counts, try internal snapshot
            const finalRowCount = rowCount || (sheet as any)._snapshot?.rowCount || 0;
            const finalColCount = colCount || (sheet as any)._snapshot?.columnCount || 0;

            if (finalRowCount > 0 && finalColCount > 0 && finalRowCount < 100000) {
              const range = sheet.getRange(0, 0, finalRowCount, finalColCount);
              const apiValues = range.getValues();
              if (apiValues && Array.isArray(apiValues) && apiValues.length > 0) {
                console.log(`💎 [handleSave] Fetched ${apiValues.length} rows directly from Univer API (Priority 0)`);
                finalResultData = apiValues;
                isFullSnapshot = true;
              }
            }
          }
        }
      } catch (apiError) {
        console.warn('[handleSave] Failed to fetch data from API, falling back to result/context:', apiError);
      }

      // Updated Priority 1: Use finalResultData (either from API or from argument)
      if (finalResultData && Array.isArray(finalResultData) && finalResultData.length > 0) {
        console.log(`💎 [handleSave] Using data for save (${finalResultData.length} rows)`);

        // CRITICAL: Treat any valid array data passed to save as a full snapshot
        // This ensures that deletions (which result in fewer rows/cols) are respected
        // and not "merged" back with the stale context data.
        isFullSnapshot = true;

        const resultDataConverted = convertExcelDataToMatrix(finalResultData);

        // Check if result.data has fewer cells (rows OR cols) than context data (incomplete data)
        // CRITICAL FIX: If we have a full snapshot from API, we trust it even if it's smaller (deletion case)
        // We only check for missing cells if it's NOT a full snapshot (e.g. partial update from event)
        const contextHasMoreCells = !isFullSnapshot && data && Array.isArray(data) && data.length > 0 &&
          ((data.length > resultDataConverted.length) ||
            (data[0] && Array.isArray(data[0]) && data[0].length > (resultDataConverted[0]?.length || 0)));

        if (contextHasMoreCells && data) {
          // Result data is incomplete - merge with context data to preserve all columns
          // OPTIMIZED: Use efficient loops instead of map/reduce for huge datasets
          // Calculate max columns using efficient loop
          let maxColsFromData = 0;
          let maxColsFromResult = 0;
          const dataLength = data.length;
          const resultLength = resultDataConverted.length;

          for (let i = 0; i < dataLength; i++) {
            const rowLen = data[i]?.length || 0;
            if (rowLen > maxColsFromData) maxColsFromData = rowLen;
          }

          for (let i = 0; i < resultLength; i++) {
            const rowLen = resultDataConverted[i]?.length || 0;
            if (rowLen > maxColsFromResult) maxColsFromResult = rowLen;
          }

          const maxCols = Math.max(maxColsFromData, maxColsFromResult);

          // OPTIMIZED: Use for loop instead of map for better performance
          dataToSave = [];
          for (let rowIdx = 0; rowIdx < resultLength; rowIdx++) {
            const resultRow = resultDataConverted[rowIdx] || [];
            const contextRow = data[rowIdx] || [];
            const mergedRow: CellBase[] = [];

            // CRITICAL: Merge result.data with context data, then apply pending edits
            for (let colIdx = 0; colIdx < maxCols; colIdx++) {
              const editKey = `${rowIdx}-${colIdx}`;
              const pendingEdit = pendingEditsRef.current.get(editKey);

              // Priority 1: Pending edit from ref
              if (pendingEdit && pendingEdit.row === rowIdx && pendingEdit.col === colIdx) {
                mergedRow.push({ value: pendingEdit.value } as CellBase);
                continue;
              }

              // Priority 2: Result data
              if (colIdx < resultRow.length) {
                const resultCell = resultRow[colIdx];
                mergedRow.push(resultCell !== undefined && resultCell !== null ? resultCell : { value: '' } as CellBase);
                continue;
              }

              // Priority 3: Context data
              const contextCell = contextRow[colIdx];
              mergedRow.push(contextCell !== undefined && contextCell !== null ? contextCell : { value: '' } as CellBase);
            }
            dataToSave.push(mergedRow);
          }

          // Clear pending edits after applying them
          pendingEditsRef.current.clear();

          // Add any extra rows from context that aren't in result
          if (dataLength > resultLength) {
            for (let rowIdx = resultLength; rowIdx < dataLength; rowIdx++) {
              // OPTIMIZED: Use slice instead of spread to avoid stack overflow
              const row = data[rowIdx];
              if (row) {
                dataToSave.push(row.slice());
              }
            }
          }
        } else {
          // Result data is complete or we don't have context data
          // OPTIMIZED: Use for loop instead of map for better performance
          dataToSave = [];
          const resultLength = resultDataConverted.length;

          for (let rowIdx = 0; rowIdx < resultLength; rowIdx++) {
            const resultRow = resultDataConverted[rowIdx];
            if (!Array.isArray(resultRow)) {
              dataToSave.push(resultRow);
              continue;
            }

            const editedRow: CellBase[] = [];
            const rowLength = resultRow.length;

            for (let colIdx = 0; colIdx < rowLength; colIdx++) {
              const editKey = `${rowIdx}-${colIdx}`;
              const pendingEdit = pendingEditsRef.current.get(editKey);

              // Apply pending edit if exists (overrides result.data)
              if (pendingEdit) {
                editedRow.push({ value: pendingEdit.value } as CellBase);
              } else {
                const cell = resultRow[colIdx];
                if (cell !== undefined && cell !== null) {
                  editedRow.push(cell);
                } else {
                  editedRow.push({ value: '' } as CellBase);
                }
              }
            }

            dataToSave.push(editedRow);
          }

          // Clear pending edits after applying them
          pendingEditsRef.current.clear();
        }
      }
      // Priority 2: Use data from fullGridDataRef (sync'd from spreadsheet events)
      else if (fullGridDataRef.current && Array.isArray(fullGridDataRef.current) && fullGridDataRef.current.length > 0) {
        const converted = convertExcelDataToMatrix(fullGridDataRef.current);

        // Apply pending edits to the ref data
        dataToSave = converted.map((row, rowIdx) => {
          if (!Array.isArray(row)) return row;
          return row.map((cell, colIdx) => {
            const editKey = `${rowIdx}-${colIdx}`;
            const pendingEdit = pendingEditsRef.current.get(editKey);
            return pendingEdit ? { value: pendingEdit.value } as CellBase : cell;
          });
        });
        pendingEditsRef.current.clear();
      }
      // Priority 3: Use context data (fallback if no ref data)
      else if (data && Array.isArray(data) && data.length > 0) {
        // Apply pending edits to context data
        dataToSave = data.map((row, rowIdx) => {
          if (!Array.isArray(row)) return row;
          return row.map((cell, colIdx) => {
            const editKey = `${rowIdx}-${colIdx}`;
            const pendingEdit = pendingEditsRef.current.get(editKey);
            return pendingEdit ? { value: pendingEdit.value } as CellBase : cell;
          });
        });
        pendingEditsRef.current.clear();
      }


      // OPTIMIZED: Filter out completely empty rows using efficient loop
      if (dataToSave.length > 0) {
        const filteredData: Matrix<CellBase> = [];
        const dataLength = dataToSave.length;

        for (let i = 0; i < dataLength; i++) {
          const row = dataToSave[i];
          if (!row || !Array.isArray(row)) continue;

          // Check if row has any non-empty cells
          let hasData = false;
          const rowLength = row.length;
          for (let j = 0; j < rowLength; j++) {
            const cell = row[j];
            let cellValue = '';

            if (cell && typeof cell === 'object') {
              cellValue = (cell as any).value ?? (cell as any).v ?? (cell as any).m ?? (cell as any).text ?? '';
            } else {
              cellValue = cell !== null && cell !== undefined ? String(cell) : '';
            }

            if (cellValue !== '') {
              hasData = true;
              break; // Early exit once we find a non-empty cell
            }
          }

          if (hasData) {
            filteredData.push(row);
          }
        }

        dataToSave = filteredData;
      }

      if (dataToSave.length === 0) {

        // Final fallback: If everything else fails but we have data in context, use it without filtering first to see what's in it
        if (data && data.length > 0 && dataToSave.length === 0) {
        }

        toaster.error({
          body: 'No data to save. Please enter data in the spreadsheet.',
          title: 'Error',
        });
        return;
      }

      // Always save if we have valid data

      // -------------------------------------------------------------------------
      // ZERO-FILLING LOGIC FOR MANUAL EDITS
      // -------------------------------------------------------------------------
      if (dataToSave.length > 0) {
        try {
          const rowCount = dataToSave.length;
          // Determine max col count
          let maxCols = 0;
          for (let r = 0; r < rowCount; r++) {
            if (dataToSave[r].length > maxCols) maxCols = dataToSave[r].length;
          }

          const numericColsToFill: number[] = [];

          // 1. Identify Numeric Columns
          for (let c = 0; c < maxCols; c++) {
            let hasNumber = false;
            let hasContent = false;
            let checkCount = 0;

            for (let r = 0; r < rowCount; r++) {
              const cell = dataToSave[r]?.[c];
              let val = '';
              if (cell && typeof cell === 'object') {
                // @ts-ignore
                val = cell.value ?? cell.v ?? cell.m ?? '';
              } else {
                val = String(cell || '');
              }

              const sVal = String(val).trim();
              if (sVal !== '') {
                hasContent = true;
                if (!isNaN(parseFloat(sVal))) {
                  hasNumber = true;
                }
                checkCount++;
              }
              if (hasContent && hasNumber) break; // Confirmed numeric column
              if (checkCount > 100) break; // Optimization
            }

            if (hasContent && hasNumber) {
              numericColsToFill.push(c);
            }
          }

          // 2. Fill Empty Cells with 0
          if (numericColsToFill.length > 0) {
            console.log(`🧹 [handleSave] Zero-filling manual edits in columns: ${numericColsToFill.join(', ')}`);
            for (const c of numericColsToFill) {
              for (let r = 0; r < rowCount; r++) {
                const cell = dataToSave[r]?.[c];
                let val = '';
                if (cell && typeof cell === 'object') {
                  // @ts-ignore
                  val = cell.value ?? cell.v ?? cell.m ?? '';
                } else {
                  val = String(cell || '');
                }

                if (String(val).trim() === '') {
                  // Ensure row/cell structure exists
                  if (!dataToSave[r]) dataToSave[r] = [];
                  // Update in place
                  dataToSave[r][c] = { value: 0 } as CellBase;
                }
              }
            }
          }
        } catch (fillErr) {
          console.warn('⚠️ [handleSave] Zero-fill logic failed:', fillErr);
        }
      }
      // -------------------------------------------------------------------------

      // Always save if we have valid data
      // OPTIMIZED: For huge datasets, add progress indicator and error handling
      const isHugeDataset = dataToSave.length > 50000;

      if (isHugeDataset) {
        toaster.info({
          body: `Saving ${dataToSave.length.toLocaleString()} rows... Please wait.`,
          title: 'Saving Large Dataset',
        });
      }

      try {
        // Use Promise.race with timeout to prevent infinite hangs
        const savePromise = generateCSVDataAndSaveCSV(dataToSave, columns || {});
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Save operation timed out. Please try again.')), 300000) // 5 minute timeout
        );

        await Promise.race([savePromise, timeoutPromise]);
      } catch (saveError: any) {
        console.error('❌ Save error:', saveError);
        toaster.error({
          body: saveError.message || 'Failed to save data. Please try again.',
          title: 'Save Error',
        });
        throw saveError;
      }

      // CRITICAL: Update INIT_DATA_KEY in sessionStorage with saved data
      // For large datasets (>10k rows), skip sessionStorage to avoid quota exceeded errors
      // The database is the source of truth for large datasets
      const isLargeDataset = dataToSave.length > 10000;

      if (isLargeDataset) {
        // For large datasets, keep the current data in ref (don't clear it)
        // This prevents the spreadsheet from resetting after save
        // Convert saved data to ExcelSpreadsheet format and keep it in ref
        const excelFormat = dataToSave.map((row: any) =>
          row.map((cell: any) => {
            if (cell && typeof cell === 'object' && 'value' in cell) {
              return cell.value;
            }
            return cell || '';
          })
        );

        // CRITICAL: Keep the current data in ref so spreadsheet doesn't reset
        // Don't increment saveCount for large datasets to avoid forced remount
        // The spreadsheet should continue with its current state
        initialSpreadsheetDataRef.current = excelFormat;
        hasSetInitialDataRef.current = true;

        // CRITICAL: For large datasets, DO NOT update context data after save
        // This prevents parent component from re-rendering and potentially resetting state
        // The spreadsheet manages its own state internally, and we've already saved to DB
        // Only update dataState to 'published' to reflect the save status
        if (setDataState) {
          setDataState('published');
        }
        // DO NOT call setData(dataToSave) for large datasets - prevents reset
        // DO NOT increment saveCount for large datasets - this prevents remount
        // DO NOT clear the ref - this prevents reset
      } else {
        // For small datasets, update context data and sessionStorage normally
        // CRITICAL: Update context data immediately after save to keep it in sync
        if (setData) {
          setData(dataToSave);
        }
        if (setDataState) {
          setDataState('published');
        }
        // For small datasets, update sessionStorage normally
        try {
          const excelFormat = dataToSave.map((row: any) =>
            row.map((cell: any) => {
              if (cell && typeof cell === 'object' && 'value' in cell) {
                return cell.value;
              }
              return cell || '';
            })
          );

          // Estimate size before storing
          const estimatedSize = JSON.stringify(excelFormat).length;
          const sizeInMB = estimatedSize / (1024 * 1024);

          if (sizeInMB > 4) {
            // If estimated size > 4MB, skip sessionStorage (leave some buffer for quota)
            initialSpreadsheetDataRef.current = undefined;
            hasSetInitialDataRef.current = false;
            // REMOVED: setSaveCount - no longer needed, prevents remounts
          } else {
            sessionStorage.setItem(INIT_DATA_KEY, JSON.stringify(excelFormat));
            initialSpreadsheetDataRef.current = excelFormat;
            hasSetInitialDataRef.current = true;
            // REMOVED: setSaveCount - no longer needed, prevents remounts
          }
        } catch (storageError: any) {
          // If quota exceeded or any other error, skip sessionStorage
          initialSpreadsheetDataRef.current = undefined;
          hasSetInitialDataRef.current = false;
          // REMOVED: setSaveCount - no longer needed, prevents remounts
        }
      }

    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      const isMetadataError = errorMessage.includes('get metadata') ||
        errorMessage.includes('cannot find the file');

      if (!isMetadataError) {
        toaster.error({
          body: t('csvExportFailed') || 'Failed to save data. Please try again.',
          title: 'Error',
        });
      } else {
        if (setDataState) {
          setDataState('published');
        }
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [data, columns, setData, setDataState, dataState, generateCSVDataAndSaveCSV, toaster, t, INIT_DATA_KEY]);

  // Handle edit ended - OPTIMIZED for large paste operations
  const handleEditEnded = useCallback((result: any) => {
    // Set 'draft' state immediately on any edit if not already draft
    if (setDataState && dataState !== 'draft') {
      setDataState('draft');
    }

    // CRITICAL: We NO LONGER call setData (the context sync) on every cell edit.
    // Syncing the entire 50k+ cell matrix to React state on every edit is slow
    // and causes unstable re-renders that can crash Univer.
    // The "Save Data" button (modal or analysis) now uses Priority 0 API fetch
    // to get the latest data directly from Univer, so context sync is only
    // needed bulk operations like imports or after a successful save.

    // Still update the fullGridDataRef for immediate reference if needed
    if (result && result.data && Array.isArray(result.data)) {
      fullGridDataRef.current = result.data;
    }
  }, [setDataState, dataState]); // Removed setData dependence to keep it stable

  // CRITICAL: Update initialData when ref changes (e.g., when data loads from database or sessionStorage)
  useEffect(() => {
    // Priority 1: Check if we have data in ref (set by loadDataFromDatabase or useEffect)
    if (hasSetInitialDataRef.current && initialSpreadsheetDataRef.current) {
      setInitialData(initialSpreadsheetDataRef.current);
      return;
    }

    // Priority 2: Try to read from sessionStorage
    if (hasSetInitialDataRef.current !== false) {
      try {
        const storedInitialData = sessionStorage.getItem(INIT_DATA_KEY);
        if (storedInitialData) {
          const parsed = JSON.parse(storedInitialData);
          if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            // Store in ref for future reads
            initialSpreadsheetDataRef.current = parsed;
            hasSetInitialDataRef.current = true;
            setInitialData(parsed);
            return;
          }
        }
      } catch (e) {
        // Ignore sessionStorage errors (quota exceeded, etc.)
      }
    }

    // Priority 3: Set to undefined if no data found (only if not already set)
    // The spreadsheet will manage its own state
    if (!hasSetInitialDataRef.current) {
      setInitialData(undefined);
    }
  }, [INIT_DATA_KEY, workspacePath]); // CRITICAL: Re-run when INIT_DATA_KEY or workspacePath changes (removed initialData to prevent loops)

  // CRITICAL: Make INIT_KEY unique per tab using storageKey
  const INIT_KEY = useMemo(() => `excel-spreadsheet-initialized-${storageKey || 'default'}`, [storageKey]);

  // CRITICAL: Use sessionStorage to persist initialization state across remounts
  const hasInitializedRef = useRef<boolean>(
    sessionStorage.getItem(INIT_KEY) === 'true'
  );

  // Initialize empty data on mount ONLY if no data exists (don't reset persisted data)
  useEffect(() => {
    // Only initialize if we haven't initialized before AND there's truly no data
    if (!hasInitializedRef.current && setData) {
      // Check current data state (from context)
      const currentData = data;
      const hasData = currentData && Array.isArray(currentData) && currentData.length > 0 && currentData.some((row: any) =>
        row && Array.isArray(row) && row.some((cell: any) =>
          cell && typeof cell === 'object' && 'value' in cell && cell.value
        )
      );

      if (!hasData) {
        // Only create empty data if there's truly no data (not even persisted)
        const emptyData: Matrix<CellBase> = [];
        for (let i = 0; i < 50; i++) {
          const row: CellBase[] = [];
          for (let j = 0; j < 36; j++) {
            row.push({ value: '' } as CellBase);
          }
          emptyData.push(row);
        }
        setData(emptyData);
      }
      hasInitializedRef.current = true;
      sessionStorage.setItem(INIT_KEY, 'true');
    }
  }, [setData, data, INIT_KEY]);

  // Handle keyboard shortcut: Ctrl+S (save)
  const handleSaveRef = useRef(handleSave);
  const dataRef = useRef(data);
  handleSaveRef.current = handleSave;
  dataRef.current = data;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+S or Cmd+S (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        const target = event.target as HTMLElement;
        const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

        // Only handle if not in an input field
        if (!isInInput) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          // Call handleSave directly with context data
          const saveResult = {
            data: dataRef.current || [],
            sheetName: 'Sheet1',
            sheetId: 'keyboard-save'
          };

          // Use setTimeout to ensure the save happens after the event is fully processed
          setTimeout(() => {
            handleSaveRef.current(saveResult);
          }, 0);
        }
      }
    };

    // Attach to window with capture phase to catch events early
    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true } as any);
    };
  }, []); // Empty deps - use refs to avoid re-creating handler

  // Memoize spreadsheet style
  const spreadsheetStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

  // Create stable callback ref for handleEditEnded
  const handleEditEndedRef = useRef(handleEditEnded);
  handleEditEndedRef.current = handleEditEnded;

  // CRITICAL: Use a stable callback ref to prevent re-renders
  // CRITICAL: Use a stable callback ref to prevent re-renders
  const eventAfterEditEndedCallback = useCallback((arg1: any, arg2: any) => {
    // Handle case where ExcelSpreadsheet passes a single object with params
    if (arg1 && typeof arg1 === 'object' && !arg2 && ('cell' in arg1 || 'data' in arg1)) {
      handleEditEndedRef.current(arg1); // Pass the single result object
    } else {
      // Handle standard two-argument call (convert to single result object)
      handleEditEndedRef.current({ cell: arg1, data: arg2 });
    }
  }, []); // Empty deps - uses ref which is always current

  return {
    handleSave,
    handleEditEnded,
    initialData,
    setInitialData, // EXPOSE setInitialData for manual updates (Imports)
    isLoadingData,
    spreadsheetKey: useMemo(() => `excel-spreadsheet-${storageKey || 'default'}`, [storageKey]),
    spreadsheetStyle,
    eventAfterEditEndedCallback,
  };
};

/**
 * Hook to handle immediate numeric conversion after paste
 * This uses the window.univerAPI to fix values in the spreadsheet model directly
 */
export const useSpreadsheetPasteImmediateFix = (
  setData?: (data: Matrix<CellBase>) => void,
  setDataState?: (state: 'draft' | 'published' | undefined) => void,
  dataState?: 'draft' | 'published' | undefined
) => {
  const setDataRef = useRef(setData);
  const setDataStateRef = useRef(setDataState);
  const dataStateRef = useRef(dataState);

  useEffect(() => {
    setDataRef.current = setData;
    setDataStateRef.current = setDataState;
    dataStateRef.current = dataState;
  }, [setData, setDataState, dataState]);

  useEffect(() => {
    const handlePasteImmediate = () => {
      // Small delay to allow Univer to process the paste into the model
      setTimeout(async () => {
        try {
          const api = (window as any).univerAPI;
          if (!api) return;

          const workbook = api.getActiveWorkbook();
          const sheet = workbook?.getActiveSheet();
          if (!sheet) return;

          const selection = sheet.getSelection();
          const range = selection?.getActiveRange();
          if (!range) return;

          const values = range.getValues();
          let hasChange = false;

          const convertedValues = values.map((row: any[]) =>
            row.map(cell => {
              // Handle various cell formats (plain value or object)
              let val: any = cell;
              if (cell && typeof cell === 'object') {
                val = cell.v ?? cell.m ?? cell.text ?? cell.value;
              }

              if (typeof val === 'string' && val.trim() !== '') {
                const trimmed = val.trim();
                const num = Number(trimmed);
                if (!isNaN(num)) {
                  hasChange = true;

                  // If it's an object, update its value property
                  if (cell && typeof cell === 'object') {
                    return { ...cell, v: num, m: String(num), t: 2 }; // t: 2 is numeric type in some formats
                  }
                  return num;
                }
              }
              return cell;
            })
          );

          if (hasChange) {
            console.log('💎 [Immediate Paste Fix] Converting numeric strings in selection...');
            range.setValues(convertedValues);
          }

          // CRITICAL: Always mark as draft when pasting, even if no numeric conversion happened
          // This ensures that ANY paste operation (numbers, text, etc.) marks the data as unsaved
          if (setDataStateRef.current && dataStateRef.current !== 'draft') {
            console.log('📝 [Paste] Setting dataState to DRAFT (current state:', dataStateRef.current, ')');
            setDataStateRef.current('draft');
          } else if (dataStateRef.current === 'draft') {
            console.log('📝 [Paste] dataState already DRAFT, skipping update');
          } else {
            console.warn('⚠️ [Paste] setDataStateRef.current is not available!');
          }

          // OPTIMIZATION: We NO LONGER sync the entire sheet back to React context here.
          // The Save handler's Priority 0 API fetch will get the latest data when needed.
          // Syncing 50k+ cells on every paste is too expensive for the React thread.
        } catch (err) {
          console.error('[Immediate Paste Fix] Error:', err);
        }
      }, 200); // 200ms delay to ensure paste has settled
    };

    window.addEventListener('paste', handlePasteImmediate);
    return () => window.removeEventListener('paste', handlePasteImmediate);
  }, []); // Stable effect - uses refs for setters
};
