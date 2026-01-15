import { useCallback } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { CellBase, Matrix } from 'react-spreadsheet';
import { convertExcelDataToMatrix } from './use-spreadsheet-data';
import { browseFile } from '../../../../screens/top-menu/browse-file/configurations';
import axios from 'axios';
import { API } from '@constants';
import { copyExcelFileToVolume, volumeExcelFilePath, convertToLinuxPath } from '@utils';

import {
  parseDSV,
  prepareExcelImport,
  importExcelData,
} from '@utils/spreadsheet-import';

export const useSpreadsheetImport = (
  setData: ((data: Matrix<CellBase>) => void) | undefined,
  setDataState?: ((state: 'draft' | 'published' | undefined) => void) | undefined,
  setInitialData?: ((data: any[][]) => void) | undefined,
  projectId?: number | string,
  dataState?: 'draft' | 'published' | undefined,
  onShowImportModal?: (fileData: string[][], filePath: string) => void,
  onShowSheetSelectionModal?: (sheetNames: string[], linuxPath: string, savePath: string, fileName: string) => void
) => {
  // Logic to process the imported data (check saved options, set data, etc.)
  const processImportedData = useCallback((fileData: string[][], filePath: string) => {
    // CRITICAL: Check if this is a saved project
    // If so, show modal to ask user if they want to append or open new view
    const isSavedProject = projectId !== undefined && projectId !== null && projectId !== '' && dataState === 'published';

    if (isSavedProject && onShowImportModal) {
      // Show modal and let it handle the import
      onShowImportModal(fileData, filePath);
      return; // Exit early - modal will handle the rest
    }

    // Convert to Matrix<CellBase> format
    const convertedData = convertExcelDataToMatrix(fileData);

    // Update data
    if (setData) {
      setData(convertedData);
    }

    // Update initial data for spreadsheet
    if (setInitialData) {
      setInitialData(fileData);
    }

    // Mark as draft
    if (setDataState) {
      setDataState('draft');
    }

    // Sync to UI via API
    try {
      const api = (window as any).univerAPI;
      if (api) {
        const workbook = api.getActiveWorkbook();
        const sheet = workbook?.getActiveSheet();
        if (sheet && fileData && fileData.length > 0) {
          console.log(`💎 [handleImport] Syncing to spreadsheet UI via API`);
          const rowCount = fileData.length;
          const colCount = fileData[0].length;

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
          }

          sheet.getRange(0, 0, rowCount, colCount).setValues(fileData);
        }
      }
    } catch (apiError) {
      console.warn('⚠️ [handleImport] Failed to sync to UI via API. UI might be stale, but internal data is updated.', apiError);
    }
  }, [setData, setDataState, setInitialData, projectId, dataState, onShowImportModal]);

  const handleImport = useCallback(async () => {
    if (!setData) {
      return;
    }

    try {
      // Open file dialog
      const selectedFile = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: 'Excel Files',
            extensions: browseFile.acceptFiles,
          },
          {
            name: 'All Files',
            extensions: ['*'],
          },
        ],
      });

      if (!selectedFile) {
        return;
      }

      const filePath = typeof selectedFile === 'string' ? selectedFile : (selectedFile as any).path;
      if (!filePath) return;

      const extension = filePath.split('.').pop()?.toLowerCase() || '';
      const fileName = filePath.split(/[/\\]/).pop() || `imported_file.${extension}`;

      // USE CENTRALIZED LOADER STATE
      const { setBlockUI } = (await import('@store')).useStartProStore.getState();

      let fileData: string[][];

      // CRITICAL: Unify import logic to use backend for ALL file types
      // This prevents browser crashes on large files by avoiding readTextFile
      setBlockUI({ value: true, msg: 'Preparing file import...', hideOk: true });

      // Step 1: Prepare file (copy to volume, get info)
      const { linuxPath, savePath, sheetNames, defaultSheet } = await prepareExcelImport(filePath, fileName);
      setBlockUI({ value: false, msg: '' });

      // Step 2: Handle Sheet Selection (only for Excel with multiple sheets)
      // CSV/TSV/TXT will only have 1 "sheet" or none
      if (['xlsx', 'xls', 'xlsm', 'xlsb'].includes(extension) && sheetNames.length > 1 && onShowSheetSelectionModal) {
        onShowSheetSelectionModal(sheetNames, linuxPath, savePath, fileName);
        return;
      } else {
        // Step 3: Process Data via Backend
        // For CSV/TSV, this uses the same robust pipeline as Excel
        setBlockUI({ value: true, msg: 'Processing data...', hideOk: true });

        // Use default sheet or 'Sheet1' for CSVs
        const sheetToImport = sheetNames.length > 0 ? sheetNames[0] : (defaultSheet || 'Sheet1');

        const { fileData: importedData } = await importExcelData(linuxPath, savePath, sheetToImport);
        fileData = importedData;
        setBlockUI({ value: false, msg: '' });
      }

      if (!fileData || fileData.length === 0) {
        throw new Error('File appears to be empty or could not be parsed.');
      }

      processImportedData(fileData, filePath);

    } catch (error: any) {
      console.error('❌ Import error:', error);
      const { setBlockUI } = (await import('@store')).useStartProStore.getState();
      setBlockUI({ value: true, msg: error?.message || 'Failed to import file', hideOk: false });
    }
  }, [setData, onShowSheetSelectionModal, processImportedData]);

  // Helper function to append imported data to existing data
  const appendToExistingData = useCallback(async (fileData: string[][], currentData: Matrix<CellBase>) => {
    if (!setData) return;

    try {
      // Get current column count
      const currentColCount = currentData.length > 0 ? (currentData[0]?.length || 0) : 0;
      const currentRowCount = currentData.length;

      const importRowCount = fileData.length;
      const importColCount = fileData.length > 0 ? fileData[0].length : 0;

      console.log(`📊 Appending ${importRowCount}x${importColCount} to existing ${currentRowCount}x${currentColCount}`);

      // Determine max row count
      const maxRows = Math.max(currentRowCount, importRowCount);

      // Create new data array with appended columns
      const newData: Matrix<CellBase> = [];

      for (let i = 0; i < maxRows; i++) {
        const row: CellBase[] = [];

        // Add existing columns (or empty cells if this row doesn't exist in current data)
        for (let j = 0; j < currentColCount; j++) {
          if (i < currentRowCount && currentData[i] && currentData[i][j]) {
            row.push(currentData[i][j]);
          } else {
            row.push({ value: '' });
          }
        }

        // Add imported columns (or empty cells if this row doesn't exist in imported data)
        for (let j = 0; j < importColCount; j++) {
          if (i < importRowCount && fileData[i] && fileData[i][j] !== undefined) {
            row.push({ value: fileData[i][j] });
          } else {
            row.push({ value: '' });
          }
        }

        newData.push(row);
      }

      // Update data
      setData(newData);

      // Update initial data for spreadsheet
      if (setInitialData) {
        const plainData = newData.map(row => row.map(cell => cell.value || ''));
        setInitialData(plainData);
      }

      // Mark as draft
      if (setDataState) {
        setDataState('draft');
      }

      // Sync to UI via API
      try {
        const api = (window as any).univerAPI;
        if (api) {
          const workbook = api.getActiveWorkbook();
          const sheet = workbook?.getActiveSheet();
          if (sheet && newData && newData.length > 0) {
            const rowCount = newData.length;
            const colCount = newData[0].length;

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
            }

            const plainData = newData.map(row => row.map(cell => cell.value || ''));
            sheet.getRange(0, 0, rowCount, colCount).setValues(plainData);
          }
        }
      } catch (apiError) {
        console.warn('[appendToExistingData] Failed to sync to UI via API:', apiError);
      }

      console.log('✅ Successfully appended imported data');
    } catch (error) {
      console.error('❌ Error appending data:', error);
      throw error;
    }
  }, [setData, setDataState, setInitialData]);

  return { handleImport, appendToExistingData, processImportedData };
};
