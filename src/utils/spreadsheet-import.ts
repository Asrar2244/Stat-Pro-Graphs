import { readTextFile, exists, mkdir, rename } from '@tauri-apps/plugin-fs';
import {
    copyExcelFileToVolume,
    volumeExcelFilePath,
    convertToLinuxPath,
    collectionsLocation,
    joinPaths,
    fileNameWithExtension,
    uniqueNumber,
    findBestTable,
    platformInfo,
    createTempFolder,
    Database
} from './index';
import axios from 'axios';
import { API, CONFIGURATION_DB } from '@constants';
import dayjs from 'dayjs';
import { useStartProStore } from '@store';
import { insertIntoProject } from '@backend';

/**
 * Utility to refresh the projects in the global store
 */
export const refreshProjectsInStore = async () => {
    try {
        const { Database } = await import('./index');
        const { selectFromProject } = await import('@backend');
        const db = new Database(CONFIGURATION_DB);
        try {
            const result = await db.selectQuery(selectFromProject);

            if (result && result.length > 0) {
                const bulkProjectData: any = {};
                for (const item of result) {
                    bulkProjectData[item.projectName] = { ...item };
                }
                useStartProStore.getState().setBulkProjects(bulkProjectData);
                console.log(`🔄 [refreshProjectsInStore] Updated ${result.length} projects in store`);
            }
        } finally {
            await db.close();
        }
    } catch (e) {
        console.error('❌ Failed to refresh projects in store:', e);
    }
};

/**
 * Generates sequential project names like "empty data view 1", "empty data view 2", etc.
 */
export const generateEmptyDataViewName = async (): Promise<string> => {
    try {
        const db = new Database(CONFIGURATION_DB);
        try {
            const projects = await db.selectQuery(
                `SELECT projectName FROM PROJECTS WHERE LOWER(projectName) LIKE 'empty data view%'`
            );

            if (projects.length === 0) return 'empty data view 1';

            const numberSet = new Set<number>();
            for (const project of projects) {
                const match = (project.projectName || '').match(/empty\s+data\s+view\s+(\d+)/i);
                if (match && match[1]) numberSet.add(parseInt(match[1], 10));
            }

            const numbers = Array.from(numberSet).sort((a, b) => a - b);
            let nextNumber = 1;
            for (const num of numbers) {
                if (num === nextNumber) nextNumber++;
                else if (num > nextNumber) break;
            }
            return `empty data view ${nextNumber}`;
        } finally {
            await db.close();
        }
    } catch (error) {
        return `empty data view ${Date.now()}`;
    }
};

/**
 * Utility to clear old "Empty Data View" states from sessionStorage if quota is exceeded
 */
export const clearStaleSessionStorage = () => {
    try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith('empty-data-view-state-')) {
                keysToRemove.push(key);
            }
        }

        // Remove all old states to free up maximum space
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
        console.log(`🧹 [clearStaleSessionStorage] Cleared ${keysToRemove.length} stale states from sessionStorage`);
    } catch (e) {
        console.error('❌ Failed to clear sessionStorage:', e);
    }
};

/**
 * Parse Delimiter-Separated Values (CSV/TSV)
 * Handles quoted values and escapes correctly
 */
export const parseDSV = (content: string, delimiter: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentVal = '';
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = content[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentVal += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            currentRow.push(currentVal);
            currentVal = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') i++; // Handle CRLF
            if (currentRow.length > 0 || currentVal !== '') {
                currentRow.push(currentVal);
                rows.push(currentRow);
            }
            currentRow = [];
            currentVal = '';
        } else {
            currentVal += char;
        }
    }

    if (currentRow.length > 0 || currentVal !== '') {
        currentRow.push(currentVal);
        rows.push(currentRow);
    }

    return rows;
};

/**
 * Prepare Excel file for import (Step 1: Copy & Get Sheets)
 */
export const prepareExcelImport = async (filePath: string, fileName: string): Promise<{
    linuxPath: string;
    savePath: string;
    sheetNames: string[];
    defaultSheet: string;
}> => {
    const savePath = await copyExcelFileToVolume(filePath, fileName);
    const volumePath = await volumeExcelFilePath(savePath);
    const linuxPath = convertToLinuxPath(volumePath);

    let sheetNames: string[] = [];
    let defaultSheet = 'Sheet1';

    try {
        const { data: sheetData } = await axios.post(`api/${API.analysis}`, {
            data_name: linuxPath,
            input_data_type: 'file',
            operation: 'get_timeout',
        });

        if (sheetData?.sheet_names && Array.isArray(sheetData.sheet_names) && sheetData.sheet_names.length > 0) {
            sheetNames = sheetData.sheet_names;
            defaultSheet = sheetNames[0];
        }
    } catch (sheetError: any) {
        console.warn('Failed to fetch sheet names:', sheetError);
    }

    return { linuxPath, savePath, sheetNames, defaultSheet };
};

/**
 * Import Excel Data from specific sheet (Step 2: Store in DB & Read)
 */
export const importExcelData = async (
    linuxPath: string,
    savePath: string,
    sheetName: string,
    dbLocation?: string
): Promise<{ fileData: string[][], dbPath: string }> => {
    console.log(`🚀 [importExcelData] Starting import for sheet: ${sheetName}`);
    const { setBlockUI } = useStartProStore.getState();
    setBlockUI({ value: true, msg: 'Processing Excel data...', hideOk: true });

    try {
        // CRITICAL: Create a unique subfolder for this import to prevent DB collisions
        const rootTempDir = dbLocation || await createTempFolder();
        const uniqueSubDir = dbLocation
            ? dbLocation
            : await joinPaths([rootTempDir, `${Date.now()}_${uniqueNumber()}`]);

        if (!dbLocation) {
            await mkdir(uniqueSubDir, { recursive: true });
        }

        const finalDbDir = uniqueSubDir;

        if (!(await exists(finalDbDir))) {
            await mkdir(finalDbDir, { recursive: true });
        }

        const linuxDbLocation = convertToLinuxPath(finalDbDir);

        let storeData: any;
        let retries = 3;
        while (retries > 0) {
            try {
                const response = await axios.post(`api/${API.analysis}`, {
                    data_name: linuxPath,
                    input_data_type: 'file',
                    operation: 'store_data_in_db',
                    sheet_name: sheetName,
                    db_location: linuxDbLocation,
                });
                storeData = response.data;
                break;
            } catch (err: any) {
                const errorMsg = String(err?.response?.data?.error || err.message).toLowerCase();
                // If it's a file lock error, wait and retry
                if (errorMsg.includes('being used by another process') || errorMsg.includes('winerror 32')) {
                    console.warn(`⚠️ [importExcelData] File locked, retrying... (${retries} left)`);
                    await new Promise(r => setTimeout(r, 1000));
                    retries--;
                } else {
                    throw err;
                }
            }
        }

        if (storeData.error) {
            const errorMsg = String(storeData.error).toLowerCase();
            if (!errorMsg.includes('already exists')) {
                throw new Error(`Failed to read Excel file: ${storeData.error}`);
            }
        }

        const returnedDbName = storeData.db_name || savePath.replace(/\.(xlsx|xls|xlsm|xlsb)$/i, '.db');
        const dbName = await fileNameWithExtension(returnedDbName);
        let tempDbPath = await joinPaths([finalDbDir, dbName]);

        if (platformInfo() === 'windows') {
            tempDbPath = tempDbPath.replace(/\//g, '\\');
        }

        // CRITICAL: Rename the database file to have a unique name (timestamped)
        // This ensures the UI displays a unique file name and prevents any logical collisions
        const uniqueDbName = `${Date.now()}_${dbName}`;
        const uniqueDbPath = await joinPaths([finalDbDir, uniqueDbName]);
        let finalUniqueDbPath = uniqueDbPath;

        if (platformInfo() === 'windows') {
            finalUniqueDbPath = finalUniqueDbPath.replace(/\//g, '\\');
        }

        try {
            await rename(tempDbPath, finalUniqueDbPath);
            tempDbPath = finalUniqueDbPath; // Update path to use the new unique file
            console.log(`✅ [importExcelData] Renamed DB to unique: ${uniqueDbName}`);
        } catch (renameError) {
            console.warn(`⚠️ [importExcelData] Failed to rename DB, using original: ${renameError}`);
        }

        const db = new Database(tempDbPath);

        try {
            const tableName = await findBestTable(db, { sheetId: sheetName });
            if (!tableName) {
                throw new Error('No data tables found in imported file');
            }

            const countResult = await db.selectQuery(`SELECT COUNT(*) as count FROM ${tableName}`);
            const totalRows = countResult[0]?.count || 0;

            const CHUNK_SIZE = 1000;
            const result: any[] = [];

            if (totalRows > CHUNK_SIZE) {
                for (let offset = 0; offset < totalRows; offset += CHUNK_SIZE) {
                    const chunk = await db.selectQuery(`SELECT * FROM ${tableName} LIMIT ${CHUNK_SIZE} OFFSET ${offset}`);
                    if (chunk && chunk.length > 0) result.push(...chunk);
                    if (offset + CHUNK_SIZE < totalRows) await new Promise(r => setTimeout(r, 5));
                }
            } else {
                const smallResult = await db.selectQuery(`SELECT * FROM ${tableName}`);
                if (smallResult) result.push(...smallResult);
            }

            if (!result || result.length === 0) {
                throw new Error('No data found in Excel file');
            }

            const columns = Object.keys(result[0]).filter(col => col !== 'xxx_start_pro_id');

            // Check if these are likely auto-generated headers (0, 1, 2...)
            const isAutoSequence = columns.length > 0 && columns.every((col, idx) => String(col) === String(idx));

            // Check if headers contain any numbers (User case: "If mostly numbers, treat as content")
            // Heuristic: If ANY column header is a valid number (e.g. "10", "2023"), treat entire row as data.
            // "take first row as clomn names only if varibles" -> If any non-variable (number) found, treat as data.
            const hasNumericHeader = columns.some(col => !isNaN(parseFloat(String(col))) && String(col).trim() !== '');

            // -------------------------------------------------------------------------
            // SMART ZERO-FILLING LOGIC (Global Application)
            // -------------------------------------------------------------------------
            const numericColumnsToFill: string[] = [];

            for (const col of columns) {
                let hasNumber = false;
                let hasContent = false;
                // Optimized scan
                let checkCount = 0;
                for (const row of result) {
                    const val = row[col];
                    const sVal = String(val === null || val === undefined ? '' : val).trim();
                    if (sVal !== '') {
                        hasContent = true;
                        if (!isNaN(parseFloat(sVal))) { hasNumber = true; }
                        checkCount++;
                    }
                    if (hasContent && hasNumber) break;
                    if (checkCount > 100) break;
                }
                if (hasContent && hasNumber) numericColumnsToFill.push(col);
            }

            if (numericColumnsToFill.length > 0) {
                // 1. Update In-Memory Result
                for (const row of result) {
                    for (const col of numericColumnsToFill) {
                        const val = row[col];
                        if (val === null || val === undefined || String(val).trim() === '') {
                            row[col] = 0;
                        }
                    }
                }
                // 2. Update Database
                try {
                    for (const col of numericColumnsToFill) {
                        await db.executeQuery(`UPDATE ${tableName} SET "${col}" = 0 WHERE "${col}" IS NULL OR "${col}" = ''`);
                    }
                } catch (dbErr) { console.warn(`⚠️ [importExcelData] Database zero-fill failed:`, dbErr); }
            }
            // -------------------------------------------------------------------------

            const fileData: string[][] = result.map((row: any) =>
                columns.map((col: string) => String(row[col] || ''))
            );

            if (hasNumericHeader && !isAutoSequence) {
                console.log(`💪 [importExcelData] Detected numeric/mixed headers (${columns.join(', ')}). converting to data row...`);

                const getColLetter = (n: number): string => {
                    let s = "";
                    while (n >= 0) {
                        s = String.fromCharCode((n % 26) + 65) + s;
                        n = Math.floor(n / 26) - 1;
                    }
                    return `Column_${s}`;
                };

                try {
                    await db.executeQuery(`UPDATE ${tableName} SET xxx_start_pro_id = xxx_start_pro_id + 1`);
                    const newColNames: string[] = [];
                    for (let i = 0; i < columns.length; i++) {
                        const oldName = columns[i];
                        const newName = getColLetter(i);
                        newColNames.push(newName);
                        await db.executeQuery(`ALTER TABLE ${tableName} RENAME COLUMN "${oldName}" TO "${newName}"`);
                    }
                    const placeHolders = newColNames.map(() => '?').join(',');
                    const insertQuery = `INSERT INTO ${tableName} (xxx_start_pro_id, ${newColNames.map(c => `"${c}"`).join(',')}) VALUES (1, ${placeHolders})`;
                    await db.executeQuery(insertQuery, columns);
                    console.log(`✅ [importExcelData] Successfully converted headers to data row 1`);
                } catch (dbError) {
                    console.error(`❌ [importExcelData] Failed to restructure DB:`, dbError);
                }
                fileData.unshift(columns);
            } else if (!isAutoSequence) {
                fileData.unshift(columns);
            }

            setBlockUI({ value: false, msg: '' });
            return { fileData, dbPath: tempDbPath };
            setBlockUI({ value: false, msg: '' });
            return { fileData, dbPath: tempDbPath };
        } finally {
            // CRITICAL: Force close to release file lock for potential renaming/cleanup
            // This bypasses reference counting because we need to ensure the file is free
            await db.close(true);
        }
    } catch (error) {
        setBlockUI({ value: false, msg: '' });
        throw error;
    }
};

/**
 * Helper to prep sessionStorage and open a new Empty Data View tab
 * NOW: Directly creates a saved project for a consistent experience
 */
export const processAndOpenNewTab = async (
    fileData: string[][],
    filePath: string,
    openNewTab: any,
    t: any,
    dbPath?: string
) => {
    const { setBlockUI } = useStartProStore.getState();
    setBlockUI({ value: true, msg: 'Creating project...', hideOk: true });

    try {
        const newTabId = uniqueNumber();
        const type = 'emptyDataView';
        const nodeId = `${type}-${newTabId}`;
        const newStorageKey = `empty-data-view-state-${nodeId}`;

        const fileName = filePath.split(/[/\\]/).pop() || `Imported ${dayjs().format('HH:mm:ss')}`;
        const dataName = await generateEmptyDataViewName();

        // Determine backend-accessible storage location
        // CRITICAL: Use temp folder as backend (Docker) is confirmed to have write access there
        const rootTempDir = await createTempFolder();
        const uniqueSubDir = await joinPaths([rootTempDir, `${Date.now()}_${uniqueNumber()}`]);
        await mkdir(uniqueSubDir, { recursive: true });

        const dbDir = uniqueSubDir;
        const linuxDbDir = convertToLinuxPath(dbDir);

        let finalDbPath = dbPath;

        // 1. Ensure data is in a permanent database
        if (!finalDbPath) {
            console.log(`📂 [processAndOpenNewTab] Storing data in permanent database for immediate project creation`);
            const rawFileName = filePath.split(/[/\\]/).pop() || `temp_${newTabId}.csv`;
            // CRITICAL: Force unique filename to prevent collisions/overwrites when importing same file
            const fileNameWithExt = `${Date.now()}_${rawFileName}`;
            const volumePath = await copyExcelFileToVolume(filePath, fileNameWithExt);
            const linuxFilePath = convertToLinuxPath(volumePath);

            let storeData: any;
            let retries = 3;
            while (retries > 0) {
                try {
                    const response = await axios.post(`api/${API.analysis}`, {
                        data_name: linuxFilePath,
                        input_data_type: 'file',
                        operation: 'store_data_in_db',
                        sheet_name: 'Sheet1',
                        db_location: linuxDbDir,
                    });
                    storeData = response.data;
                    break;
                } catch (err: any) {
                    const errorMsg = String(err?.response?.data?.error || err.message).toLowerCase();
                    if (errorMsg.includes('being used by another process') || errorMsg.includes('winerror 32')) {
                        console.warn(`⚠️ [processAndOpenNewTab] File locked, retrying... (${retries} left)`);
                        await new Promise(r => setTimeout(r, 1000));
                        retries--;
                    } else {
                        throw err;
                    }
                }
            }

            if (storeData.error) throw new Error(storeData.error);

            const dbName = await fileNameWithExtension(storeData.db_name || `${fileNameWithExt.split('.')[0]}_csv_Sheet1.db`);
            finalDbPath = await joinPaths([dbDir, dbName]);
            if (platformInfo() === 'windows') finalDbPath = finalDbPath.replace(/\//g, '\\');

            // CRITICAL: Rename the database file to have a unique name (timestamped)
            try {
                const uniqueDbName = `${Date.now()}_${dbName}`;
                const uniqueDbPath = await joinPaths([dbDir, uniqueDbName]);
                let finalUniqueDbPath = uniqueDbPath;

                if (platformInfo() === 'windows') {
                    finalUniqueDbPath = finalUniqueDbPath.replace(/\//g, '\\');
                }

                await rename(finalDbPath, finalUniqueDbPath);
                finalDbPath = finalUniqueDbPath;
                console.log(`✅ [processAndOpenNewTab] Renamed CSV DB to unique: ${uniqueDbName}`);
            } catch (renameError) {
                console.warn(`⚠️ [processAndOpenNewTab] Failed to rename CSV DB: ${renameError}`);
            }

            // -------------------------------------------------------------------------
            // SMART HEADER & ZERO-FILLING LOGIC (Synced with importExcelData)
            // -------------------------------------------------------------------------
            try {
                console.log(`🧠 [processAndOpenNewTab] Checking headers and zero-filling in: ${finalDbPath}`);
                const projectDb = new Database(finalDbPath);
                try {
                    const tableName = await findBestTable(projectDb, { sheetId: 'Sheet1' });
                    if (tableName) {
                        const tableInfo = await projectDb.selectQuery(`PRAGMA table_info(${tableName})`);
                        const columns = tableInfo.map((col: any) => col.name).filter((c: string) => c !== 'xxx_start_pro_id');

                        // 1. Header Detection
                        const isAutoSequence = columns.length > 0 && columns.every((col: string, idx: number) => String(col) === String(idx));
                        const hasNumericHeader = columns.some((col: string) => !isNaN(parseFloat(String(col))) && String(col).trim() !== '');

                        // 2. Zero-Filling Scan
                        const result = await projectDb.selectQuery(`SELECT * FROM ${tableName} LIMIT 100`); // Scan sample for type detection
                        const numericColumnsToFill: string[] = [];

                        for (const col of columns) {
                            let hasNumber = false;
                            let hasContent = false;
                            for (const row of result) {
                                const val = row[col];
                                const sVal = String(val === null || val === undefined ? '' : val).trim();
                                if (sVal !== '') {
                                    hasContent = true;
                                    if (!isNaN(parseFloat(sVal))) { hasNumber = true; }
                                }
                                if (hasContent && hasNumber) break;
                            }
                            if (hasContent && hasNumber) numericColumnsToFill.push(col);
                        }

                        // Apply Zero-Fill Update
                        if (numericColumnsToFill.length > 0) {
                            for (const col of numericColumnsToFill) {
                                await projectDb.executeQuery(`UPDATE ${tableName} SET "${col}" = 0 WHERE "${col}" IS NULL OR "${col}" = ''`);
                            }
                            console.log(`✅ [processAndOpenNewTab] Database zero-fill complete`);
                        }

                        // Apply Header Fix
                        if (hasNumericHeader && !isAutoSequence) {
                            console.log(`💪 [processAndOpenNewTab] Detected numeric headers (${columns.join(', ')}). converting...`);
                            const getColLetter = (n: number): string => {
                                let s = "";
                                while (n >= 0) {
                                    s = String.fromCharCode((n % 26) + 65) + s;
                                    n = Math.floor(n / 26) - 1;
                                }
                                return `Column_${s}`;
                            };
                            await projectDb.executeQuery(`UPDATE ${tableName} SET xxx_start_pro_id = xxx_start_pro_id + 1`);
                            const newColNames: string[] = [];
                            for (let i = 0; i < columns.length; i++) {
                                const oldName = columns[i];
                                const newName = getColLetter(i);
                                newColNames.push(newName);
                                await projectDb.executeQuery(`ALTER TABLE ${tableName} RENAME COLUMN "${oldName}" TO "${newName}"`);
                            }
                            const placeHolders = newColNames.map(() => '?').join(',');
                            const insertQuery = `INSERT INTO ${tableName} (xxx_start_pro_id, ${newColNames.map(c => `"${c}"`).join(',')}) VALUES (1, ${placeHolders})`;
                            await projectDb.executeQuery(insertQuery, columns);
                            console.log(`✅ [processAndOpenNewTab] Successfully converted headers to data row 1`);

                            // Re-fetch data to reflect changes in UI
                            // But fileData is already passed in... we might need to rely on DB reloading in UI
                            // Actually, processAndOpenNewTab receives fileData BUT the View reloads from DB immediately
                            // by using workspacePath. So the DB fix is sufficient!
                        }
                    }
                } finally {
                    await projectDb.close();
                }
            } catch (headerCheckError) {
                console.warn(`⚠️ [processAndOpenNewTab] Logic failed:`, headerCheckError);
            }
        }

        // 2. Directly INSERT into PROJECTS table
        const db = new Database(CONFIGURATION_DB);
        let projectId: number | undefined;
        try {
            const dbFileName = finalDbPath.split(/[/\\]/).pop() || '';
            const fileSizeEstimate = (fileData.length * 100).toString();

            const result = await db.executeQuery(insertIntoProject, [
                dataName,                   // projectName
                dbFileName,                 // inputFileName
                filePath,                   // businessObjectPath
                'Sheet1',                   // sheetId
                fileSizeEstimate,           // fileSize
                new Date().toISOString(),   // createdDateTime
                new Date().toISOString(),   // modifiedDateTime
                1,                          // isActive (appear in explorer)
                finalDbPath,                // workspacePath
                0,                          // isExternal
            ]);

            projectId = result.lastInsertId;
            console.log(`✅ [processAndOpenNewTab] Project created with ID: ${projectId}`);
        } finally {
            await db.close();
        }

        // Refresh sidebar to show the new project
        await refreshProjectsInStore();

        // 3. Prepare initial state for the tab
        const isLarge = fileData.length >= 2000;
        const initialState: any = {
            columns: {},
            dataState: 'published',
            projectId: projectId,
            workspacePath: finalDbPath,
            dataName: dataName,
        };

        if (isLarge) {
            initialState.isLargeDataset = true;
            initialState.data = [];
        } else {
            initialState.data = fileData.map(row => row.map(cell => ({ value: cell })));
        }

        // Persistence
        try {
            sessionStorage.setItem(newStorageKey, JSON.stringify(initialState));
        } catch (e) {
            clearStaleSessionStorage();
            try {
                if (!initialState.isLargeDataset) {
                    initialState.isLargeDataset = true;
                    initialState.data = [];
                }
                sessionStorage.setItem(newStorageKey, JSON.stringify(initialState));
            } catch (retryError) {
                console.error('❌ Failed to persist state, but project is created.');
            }
        }

        // 4. Open the tab in 'published' mode
        openNewTab(
            {
                workspacePath: finalDbPath,
                projectName: dataName,
                isEmptyDataView: true,
                dataState: 'published',
                id: projectId, // This is the ID used by the tab for backend operations
                inputFileName: fileName,
                customTitle: dataName,
                dataName: dataName,
                isOpenedData: projectId, // Link to project
                isActive: projectId,
            } as any,
            projectId, // Use projectId as the tab identifier for consistency
            type,
            t
        );

        setBlockUI({ value: false, msg: '' });
    } catch (err: any) {
        console.error('❌ [processAndOpenNewTab] Error:', err);
        setBlockUI({ value: true, msg: `Failed to create project: ${err.message}`, hideOk: false });
    }
};
