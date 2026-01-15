import { dataGenWorker } from '@workers/data-gen-worker';
import { CellBase, Matrix } from 'react-spreadsheet';
import {
  convertToLinuxPath,
  createTempFolder,
  joinPaths,
  saveCsvToFile,
  Database,
  fileNameWithExtension,
  removeFileFromGivenPath,
} from '@utils';
import { useNodeActions, useToaster, useGetInitialConfig } from '@hooks';
import axios from 'axios';
import { API } from '@constants/locale';
import { CONFIGURATION_DB, EXCEL } from '@constants';
import { insertIntoProject } from '@backend';
import { generateEmptyDataViewName } from '@utils/spreadsheet-import';

export const useDraftData = (
  projectId?: number | string,
  setProjectId?: (id: number | string | undefined) => void,
  nodeId?: string, // CRITICAL: Received nodeId for targeted updates
  nodeConfig?: any // CRITICAL: Received nodeConfig for reference
) => {
  const { updateNodeAttributes } = useNodeActions();
  const toaster = useToaster();
  const { getConfigurations } = useGetInitialConfig();
  const saveDataFromFile = async (
    fileLocation: string,
    folderPath: string,
    _fileExists: boolean,
    currentProjectId?: number | string,
  ) => {
    try {
      let projectExistsInDb = false;
      let verifiedProjectId: number | undefined;

      const hasValidProjectId = (id: number | string | undefined): boolean => {
        if (id === undefined || id === null) return false;
        if (typeof id === 'string' && id.trim() === '') return false;
        if (typeof id === 'number' && id <= 0) return false;
        return true;
      };

      const projectIdToCheck = hasValidProjectId(currentProjectId)
        ? currentProjectId
        : (hasValidProjectId(nodeConfig?.id) ? nodeConfig.id : undefined);

      if (projectIdToCheck !== undefined && projectIdToCheck !== null && projectIdToCheck !== '') {
        try {
          const db = new Database(CONFIGURATION_DB);
          try {
            const projectIdNum = typeof projectIdToCheck === 'string' ? Number(projectIdToCheck) : projectIdToCheck;
            const isLikelyTimestamp = projectIdNum > 1000000000000;

            if (isNaN(projectIdNum) || projectIdNum <= 0) {
              projectExistsInDb = false;
            } else if (isLikelyTimestamp) {
              projectExistsInDb = false;
              if (setProjectId) setProjectId(undefined);
            } else {
              const existingProject = await db.selectQuery(
                'SELECT id, projectName, isActive FROM PROJECTS WHERE id = ?',
                [projectIdNum]
              );
              if (existingProject.length > 0) {
                projectExistsInDb = true;
                verifiedProjectId = projectIdNum;
                if (currentProjectId === undefined && setProjectId && verifiedProjectId) {
                  setProjectId(verifiedProjectId);
                }
              } else {
                projectExistsInDb = false;
                if (setProjectId) setProjectId(undefined);
              }
            }
          } finally {
            await db.close();
          }
        } catch (dbError) {
          projectExistsInDb = false;
        }
      }

      const shouldUpdate = projectExistsInDb;
      let dataName: string;
      if (shouldUpdate && nodeConfig?.dataName && nodeConfig.dataName.toLowerCase().match(/^empty\s+data\s+view\s+\d+$/i)) {
        dataName = nodeConfig.dataName;
      } else {
        dataName = await generateEmptyDataViewName();
      }
      const operation = 'store_data_in_db';
      let db_location: string;
      let db_location_folder: string;

      if (shouldUpdate && verifiedProjectId) {
        try {
          const db = new Database(CONFIGURATION_DB);
          try {
            const projectQuery = await db.selectQuery(
              'SELECT workspacePath FROM PROJECTS WHERE id = ?',
              [verifiedProjectId]
            );
            if (projectQuery.length > 0 && projectQuery[0].workspacePath) {
              const workspacePath = projectQuery[0].workspacePath;
              const pathParts = workspacePath.split(/[/\\]/);
              pathParts.pop();
              db_location_folder = pathParts.join('/');
              db_location = convertToLinuxPath(db_location_folder);
            } else {
              db_location_folder = folderPath;
              db_location = convertToLinuxPath(folderPath);
            }
          } finally {
            await db.close();
          }
        } catch (dbError) {
          db_location_folder = folderPath;
          db_location = convertToLinuxPath(folderPath);
        }
      } else {
        db_location_folder = folderPath;
        db_location = convertToLinuxPath(folderPath);
      }

      let existingWorkspacePath: string | undefined;
      if (shouldUpdate && verifiedProjectId) {
        try {
          const db = new Database(CONFIGURATION_DB);
          try {
            const projectQuery = await db.selectQuery(
              'SELECT workspacePath FROM PROJECTS WHERE id = ?',
              [verifiedProjectId]
            );
            if (projectQuery.length > 0 && projectQuery[0].workspacePath) {
              existingWorkspacePath = projectQuery[0].workspacePath;
            }
          } finally {
            await db.close();
          }
        } catch (dbError) { }
      }

      if (shouldUpdate && verifiedProjectId && existingWorkspacePath !== undefined) {
        try {
          const projectDb = new Database(existingWorkspacePath);
          try {
            await projectDb.executeQuery(`DROP TABLE IF EXISTS ${EXCEL}`);
            await new Promise(resolve => setTimeout(resolve, 200));
          } finally {
            await projectDb.close();
          }
        } catch (dropTableError) {
          console.error('❌ Error dropping table before update:', dropTableError);
        }
      }

      const { data } = await axios.post(`api/${API.analysis}`, {
        data_name: fileLocation,
        input_data_type: 'file',
        operation,
        sheet_name: 'Sheet1',
        db_location,
      });

      if (data.error) {
        const errorMessage = data.error.toLowerCase();
        if (shouldUpdate && errorMessage.includes('table') && errorMessage.includes('already exists')) {
          // Success
        } else {
          throw new Error(data.error);
        }
      }

      if (data?.return_value === 'success' || (shouldUpdate && data.error && data.error.toLowerCase().includes('table') && data.error.toLowerCase().includes('already exists'))) {
        let dbName: string;
        let workspacePath: string | undefined;

        if (data?.db_name) {
          dbName = await fileNameWithExtension(data.db_name);
          workspacePath = await joinPaths([db_location_folder, dbName]);
        } else if (shouldUpdate && verifiedProjectId) {
          try {
            const db = new Database(CONFIGURATION_DB);
            try {
              const projectQuery = await db.selectQuery(
                'SELECT workspacePath FROM PROJECTS WHERE id = ?',
                [verifiedProjectId]
              );
              if (projectQuery.length > 0 && projectQuery[0].workspacePath) {
                workspacePath = projectQuery[0].workspacePath;
                const pathParts = workspacePath!.split(/[/\\]/);
                dbName = pathParts[pathParts.length - 1];
              } else {
                dbName = `${verifiedProjectId}_csv_Sheet1.db`;
                workspacePath = await joinPaths([db_location_folder, dbName]);
              }
            } finally {
              await db.close();
            }
          } catch (e) {
            dbName = `${verifiedProjectId}_csv_Sheet1.db`;
            workspacePath = await joinPaths([db_location_folder, dbName]);
          }
        } else {
          dbName = await fileNameWithExtension(`${nodeConfig?.tabName?.split('/').pop()?.replace('.db', '') || ''}.db`);
          workspacePath = await joinPaths([db_location_folder, dbName]);
        }

        const fileSize = data.fileSize || 1046;
        let result = { lastInsertId: nodeConfig.id };
        let projectIdForUpdate = verifiedProjectId;

        if (!shouldUpdate) {
          const db = new Database(CONFIGURATION_DB);
          try {
            result = await db.executeQuery(insertIntoProject, [
              dataName,
              dbName,
              data?.data_name || fileLocation,
              data?.sheet_name || 'Sheet1',
              fileSize,
              new Date().toISOString(),
              new Date().toISOString(),
              1,
              workspacePath,
              0,
            ]);

            const { lastInsertId } = result;
            projectIdForUpdate = lastInsertId;

            if (setProjectId) setProjectId(lastInsertId);

            const needsUpdate =
              nodeConfig?.tabName !== workspacePath ||
              nodeConfig?.workspacePath !== workspacePath ||
              nodeConfig?.id !== lastInsertId ||
              nodeConfig?.dataState !== 'published';

            if (needsUpdate) {
              const updateConfig = () => {
                updateNodeAttributes(nodeId as string, {
                  config: {
                    ...nodeConfig,
                    tabName: workspacePath,
                    id: lastInsertId,
                    dataName,
                    isActive: 1,
                    workspacePath,
                    dataState: 'published',
                    isEmptyDataView: true,
                  },
                });
              };
              if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
                setTimeout(() => { (window as any).requestIdleCallback(updateConfig, { timeout: 2000 }); }, 500);
              } else {
                setTimeout(updateConfig, 1000);
              }
            }
          } finally {
            await db.close();
          }
        } else {
          // UPDATE Logic
          projectIdForUpdate = verifiedProjectId !== undefined
            ? verifiedProjectId
            : (currentProjectId !== undefined
              ? (typeof currentProjectId === 'string' ? Number(currentProjectId) : currentProjectId)
              : (typeof nodeConfig.id === 'string' ? Number(nodeConfig.id) : nodeConfig.id));

          try {
            const db = new Database(CONFIGURATION_DB);
            try {
              let currentProjectName: string | undefined;
              try {
                const nameQuery = await db.selectQuery('SELECT projectName FROM PROJECTS WHERE id = ?', [projectIdForUpdate]);
                currentProjectName = nameQuery?.[0]?.projectName;
              } catch (e) { }

              const needsNameUpdate = !currentProjectName || !currentProjectName.toLowerCase().match(/^empty\s+data\s+view\s+\d+$/i);
              if (needsNameUpdate) {
                await db.executeQuery('UPDATE PROJECTS SET projectName = ?, modifiedDateTime = ?, isActive = 1 WHERE id = ?', [dataName, new Date().toISOString(), projectIdForUpdate]);
              } else {
                await db.executeQuery('UPDATE PROJECTS SET modifiedDateTime = ?, isActive = 1 WHERE id = ?', [new Date().toISOString(), projectIdForUpdate]);
              }

              let workspacePathFromDb: string | undefined;
              try {
                const projectQuery = await db.selectQuery('SELECT workspacePath FROM PROJECTS WHERE id = ?', [projectIdForUpdate]);
                workspacePathFromDb = projectQuery?.[0]?.workspacePath;
              } catch (e) { }

              const finalWorkspacePath = workspacePath || workspacePathFromDb;

              if (finalWorkspacePath && workspacePathFromDb !== finalWorkspacePath) {
                await db.executeQuery('UPDATE PROJECTS SET workspacePath = ? WHERE id = ?', [finalWorkspacePath, projectIdForUpdate]);
              }

              const needsUpdate =
                nodeConfig?.tabName !== finalWorkspacePath ||
                nodeConfig?.workspacePath !== finalWorkspacePath ||
                nodeConfig?.dataState !== 'published';

              if (needsUpdate && finalWorkspacePath) {
                const updateConfig = () => {
                  updateNodeAttributes(nodeId as string, {
                    config: {
                      ...nodeConfig,
                      tabName: finalWorkspacePath,
                      workspacePath: finalWorkspacePath,
                      dataState: 'published',
                      modifiedDateTime: new Date().toISOString(),
                    },
                  });
                };
                if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
                  setTimeout(() => { (window as any).requestIdleCallback(updateConfig, { timeout: 2000 }); }, 500);
                } else {
                  setTimeout(updateConfig, 1000);
                }
              }

              // Rename table to input
              if (finalWorkspacePath) {
                try {
                  const projectDb = new Database(finalWorkspacePath);
                  try {
                    const checkInput = await projectDb.selectQuery(`SELECT name FROM sqlite_master WHERE type='table' AND name='${EXCEL}'`);
                    if (!checkInput || checkInput.length === 0) {
                      const tables = await projectDb.selectQuery(`SELECT name FROM sqlite_master WHERE type='table'`);
                      if (tables && tables.length > 0) {
                        const foundTable = tables[0].name;
                        console.log(`⚠️ 'input' table missing. Renaming '${foundTable}' to '${EXCEL}'`);
                        await projectDb.executeQuery(`ALTER TABLE "${foundTable}" RENAME TO "${EXCEL}"`);
                      }
                    }
                  } finally {
                    await projectDb.close();
                  }
                } catch (e) { }
              }

            } finally {
              await db.close();
            }
          } catch (e) { }
        }

        toaster.success({
          body: shouldUpdate ? 'Data Updated Successfully' : 'Data Published Successfully',
          title: 'Success',
        });

        const refreshExplorer = async () => {
          getConfigurations().catch((e) => console.error(e));
        };
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          setTimeout(() => { (window as any).requestIdleCallback(refreshExplorer, { timeout: 3000 }); }, 500);
        } else {
          setTimeout(refreshExplorer, 2000);
        }

      } else {
        throw new Error('Something went wrong save location file');
      }
    } catch (error: any) {
      toaster.error({
        body: error.message,
        title: 'error',
      });
    }
  };

  const generateCSVDataAndSaveCSV = async (
    data: Matrix<CellBase>,
    columns: Record<string, string>,
  ) => {
    const folderPath = await createTempFolder();

    // CRITICAL: Use projectId from EmptyDataView context (per-tab), not config.id from active node
    // This ensures each EmptyDataView tab has its own project
    // Priority: projectId from context > nodeConfig.id from active node > undefined (new project)
    const currentProjectId = projectId !== undefined ? projectId : nodeConfig?.id;
    const projectExists = currentProjectId !== undefined && currentProjectId !== null && currentProjectId !== '' && (
      (typeof currentProjectId === 'number' && currentProjectId > 0) ||
      (typeof currentProjectId === 'string' && currentProjectId.trim() !== '' && !isNaN(Number(currentProjectId)) && Number(currentProjectId) > 0)
    );

    // DEBUG: Log project ID tracking (use nodeConfig for debugging instead of undefined config)
    console.log('🔍 Save attempt:', {
      projectId: projectId,
      'nodeConfig.id': nodeConfig?.id,
      currentProjectId,
      projectExists,
      'Will': projectExists ? 'UPDATE' : 'INSERT',
      'DataLength': data.length
    });

    console.log(`📦 [generateCSVDataAndSaveCSV] Saving ${data.length} rows to CSV. Columns: ${Object.keys(columns).length}`);

    // CRITICAL: For updates, get the existing database filename to match CSV filename
    // This ensures the backend uses the existing database file instead of creating a new one
    let fileName: string;
    if (projectExists) {
      try {
        const db = new Database(CONFIGURATION_DB);
        try {
          const projectIdNum = typeof currentProjectId === 'string' ? Number(currentProjectId) : currentProjectId;
          const projectQuery = await db.selectQuery(
            'SELECT workspacePath FROM PROJECTS WHERE id = ?',
            [projectIdNum]
          );

          if (projectQuery.length > 0 && projectQuery[0].workspacePath) {
            // Extract database filename from workspacePath (without .db extension)
            const workspacePath = projectQuery[0].workspacePath;
            const pathParts = workspacePath.split(/[/\\]/);
            const dbFileName = pathParts[pathParts.length - 1]; // e.g., "1765971789904_csv_Sheet1"

            // CRITICAL: Backend generates DB filename from CSV by: removing .csv, then appending _csv_Sheet1.db
            // So if DB is "1765971789904_csv_Sheet1.db", CSV should be "1765971789904.csv"
            // Remove "_csv_Sheet1" suffix to get the base name that backend expects
            const csvBaseName = dbFileName.replace(/_csv_Sheet1$/i, '');
            fileName = `${csvBaseName}.csv`;
          } else {
            // Fallback to project ID if workspacePath not found
            fileName = `${currentProjectId}.csv`;
          }
        } finally {
          await db.close();
        }
      } catch (error) {
        // Fallback to project ID if query fails
        fileName = `${currentProjectId}.csv`;
      }
    } else {
      // For new projects, use timestamp-based filename
      fileName = `${Date.now()}_csv_Sheet1.csv`;
    }

    const fullPath = await joinPaths([folderPath, fileName]);

    // Delete existing CSV file if it exists (we'll recreate it)
    await removeFileFromGivenPath(fullPath);

    // CRITICAL: For huge datasets, break up work to prevent UI blocking
    const isHugeDataset = data.length > 50000;

    if (isHugeDataset) {
      // Show progress indicator for huge datasets
      toaster.info({
        body: `Processing ${data.length.toLocaleString()} rows... This may take a moment.`,
        title: 'Saving Large Dataset',
      });
    }

    try {
      // OPTIMIZED: Format data - getFormattedData is already optimized with efficient loops
      // This operation is now safe for huge datasets (uses for loops instead of map/filter)
      const formattedData = await dataGenWorker.getFormattedData(data, columns);

      // OPTIMIZED: Save CSV file with timeout protection to prevent infinite hangs
      const saveCsvPromise = saveCsvToFile(fullPath, formattedData);
      const csvTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('CSV file save timed out after 5 minutes. Please try again.')), 300000) // 5 minute timeout
      );

      await Promise.race([saveCsvPromise, csvTimeoutPromise]);

      // OPTIMIZED: Save to database with timeout protection
      const saveDbPromise = saveDataFromFile(fullPath, folderPath, projectExists, currentProjectId);
      const dbTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database save timed out after 5 minutes. Please try again.')), 300000) // 5 minute timeout
      );

      await Promise.race([saveDbPromise, dbTimeoutPromise]);
    } catch (error: any) {
      console.error('❌ Error saving CSV:', error);
      toaster.error({
        body: error.message || 'Failed to save data. Please try again.',
        title: 'Save Error',
      });
      throw error; // Re-throw to be caught by caller
    }
  };
  return { generateCSVDataAndSaveCSV };
};
