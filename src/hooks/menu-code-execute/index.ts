import { useTranslation } from 'react-i18next';
import { uniqueNumber } from '@utils';
import { useNodeActions } from '../layout-nodes';
import dayjs from 'dayjs';
import { GRAPHS } from '@constants';
import { DATA } from '@constants/db';
import { open } from '@tauri-apps/plugin-dialog';
import { Database, getFileSize, getFileNameFromPath, getDirPath } from '@utils';
import { CONFIGURATION_DB } from '@constants';
import { insertIntoProject } from '@backend';
import { useGetInitialConfig } from '../initial-config/use-get-initial-config';
import { useStartProStore } from '@store';

import {
  prepareExcelImport,
  importExcelData,
  parseDSV,
  processAndOpenNewTab,
} from '@utils/spreadsheet-import';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { browseFile } from '../../screens/top-menu/browse-file/configurations';

type IMenuCodeExecutor = {
  id: string;
  isEmptyDataView?: boolean;
  extraConfig?: Record<string, unknown>;
};

export const useMenuCodeExecutor = () => {
  const { openNewTab, getOpenRecords } = useNodeActions();
  const { t } = useTranslation('workspace');
  const { getConfigurations } = useGetInitialConfig();
  const { setGlobalSheetSelection } = useStartProStore();

  const openNewTabAction = (input: IMenuCodeExecutor) => {
    // If extraConfig is provided (e.g., from graph creation), use it directly
    // Otherwise, generate dummy data for empty data views
    if (input.extraConfig) {
      const config = input.extraConfig;
      openNewTab(
        {
          fileSize: '',
          isOpenedData: config.isActive as number,
          isActive: config.isActive as number,
          modifiedDateTime: config.lastModified as string,
          createdDateTime: config.lastModified as string,
          isOpenedOutput: config.isActive as number,
          isOpenedGraphs: config.isActive as number,
          workspacePath: config.workspacePath as string,
          id: config.id as string,
          sheetId: input.id,
          inputFileName: config.name as string,
          projectName: config.name as string,
          isEmptyDataView: input.isEmptyDataView,
        } as any,
        Number(config.id),
        input.id,
        t
      );
    } else {
      // Fallback to original behavior for empty data views
      const idNum = uniqueNumber();
      const id = String(idNum);
      const projectName = dayjs().format('YYYY-MM-DD');
      const workspacePath = dayjs().format('hh:mm:ss A');

      openNewTab(
        {
          fileSize: '',
          isOpenedData: idNum,
          isActive: idNum,
          modifiedDateTime: '',
          createdDateTime: '',
          isOpenedOutput: idNum,
          workspacePath,
          id,
          sheetId: input.id,
          inputFileName: input.id,
          projectName,
          isEmptyDataView: input.isEmptyDataView,
        } as any,
        idNum,
        input.id,
        t
      );
    }
  };

  const importDataAction = async () => {
    try {
      const selectedFile = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: 'Spreadsheet Files',
            extensions: browseFile.acceptFiles,
          },
          {
            name: 'All Files',
            extensions: ['*'],
          },
        ],
      });

      if (!selectedFile) return;

      const filePath = typeof selectedFile === 'string' ? selectedFile : (selectedFile as any).path;
      const extension = filePath.split('.').pop()?.toLowerCase() || '';
      const rawFileName = filePath.split(/[/\\]/).pop() || `imported_file.${extension}`;
      // CRITICAL: Force unique filename to prevent collisions/overwrites when importing same file
      const fileName = `${Date.now()}_${rawFileName}`;

      const { setBlockUI } = useStartProStore.getState();

      if (extension === 'csv') {
        setBlockUI({ value: true, msg: 'Reading CSV file...', hideOk: true });
        const content = await readTextFile(filePath);
        const fileData = parseDSV(content, ',');
        await processAndOpenNewTab(fileData, filePath, openNewTab, t);
        setBlockUI({ value: false, msg: '' });
      } else if (extension === 'tsv' || extension === 'txt') {
        setBlockUI({ value: true, msg: 'Reading text file...', hideOk: true });
        const content = await readTextFile(filePath);
        const fileData = parseDSV(content, '\t');
        await processAndOpenNewTab(fileData, filePath, openNewTab, t);
        setBlockUI({ value: false, msg: '' });
      } else if (['xlsx', 'xls', 'xlsm', 'xlsb'].includes(extension)) {
        setBlockUI({ value: true, msg: 'Preparing Excel import...', hideOk: true });
        const { linuxPath, savePath, sheetNames, defaultSheet } = await prepareExcelImport(filePath, fileName);
        setBlockUI({ value: false, msg: '' });

        if (sheetNames.length > 1) {
          setGlobalSheetSelection({
            open: true,
            sheetNames,
            onConfirm: async (sheetName) => {
              try {
                console.log(`📂 [importDataAction] User confirmed sheet: ${sheetName}`);
                const { fileData, dbPath } = await importExcelData(linuxPath, savePath, sheetName);
                console.log(`✅ [importDataAction] Data imported successfully: ${fileData.length} rows`);
                await processAndOpenNewTab(fileData, filePath, openNewTab, t, dbPath);
                console.log(`🚀 [importDataAction] New tab opened successfully`);
                setGlobalSheetSelection({ open: false, sheetNames: [], onConfirm: () => { }, onCancel: () => { } });
              } catch (confirmError: any) {
                console.error('❌ [importDataAction] Error in sheet confirmation flow:', confirmError);
                const { setBlockUI } = useStartProStore.getState();
                setBlockUI({ value: true, msg: confirmError.message || 'Failed to import sheet' });
              }
            },
            onCancel: () => {
              setGlobalSheetSelection({ open: false, sheetNames: [], onConfirm: () => { }, onCancel: () => { } });
            },
          });
        } else {
          console.log(`📂 [importDataAction] Automatically importing single sheet: ${defaultSheet}`);
          const { fileData, dbPath } = await importExcelData(linuxPath, savePath, defaultSheet);
          await processAndOpenNewTab(fileData, filePath, openNewTab, t, dbPath);
        }
      }
    } catch (error: any) {
      console.error('❌ [importDataAction] Root error:', error);
      const { setBlockUI } = useStartProStore.getState();
      setBlockUI({ value: true, msg: error.message || 'Failed to import data' });
    }
  };

  const openProjectAction = async () => {
    try {
      const selectedFile = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: 'Project Files',
            extensions: ['db'],
          },
          {
            name: 'All Files',
            extensions: ['*'],
          },
        ],
      });

      if (!selectedFile) return;

      const filePath = typeof selectedFile === 'string' ? selectedFile : (selectedFile as any).path;
      const fileName = await getFileNameFromPath(filePath);
      const projectName = fileName.split('.')[0];
      const fileSize = await getFileSize(filePath);

      // Check if project already exists in workspace
      const { projects } = useStartProStore.getState();
      const nameLower = projectName.toLowerCase();
      if (projects[nameLower]) {
        throw new Error(`Project "${projectName}" is already in your workspace.`);
      }

      const db = new Database(CONFIGURATION_DB);
      await db.executeQuery(insertIntoProject, [
        nameLower,                  // projectName
        fileName,                   // inputFileName
        filePath,                   // businessObjectPath (use filePath for external)
        'External',                 // sheetId
        fileSize.toString(),        // fileSize
        new Date().toISOString(),   // createdDateTime
        new Date().toISOString(),   // modifiedDateTime
        1,                          // isActive
        filePath,                   // workspacePath
        1,                          // isExternal
      ]);

      await getConfigurations();

      const { setBlockUI } = useStartProStore.getState();
      setBlockUI({ value: true, msg: `Project "${projectName}" added to workspace.` });
    } catch (error: any) {
      console.error('❌ [openProjectAction] Error:', error);
      const { setBlockUI } = useStartProStore.getState();
      setBlockUI({ value: true, msg: error.message || 'Failed to open project' });
    }
  };

  return { openNewTabAction, openProjectAction, importDataAction };
};
