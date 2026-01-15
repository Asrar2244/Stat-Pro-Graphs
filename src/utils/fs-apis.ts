import { exists, remove, copyFile, mkdir } from '@tauri-apps/plugin-fs';
import { join, extname, basename, dirname, homeDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';
import { homeDirectory } from './app-apis';
import { EXCEL_DIR } from '@constants';
const { VITE_DOCKER_VOLUME_LOCATION } = import.meta.env;

// Helper to get app local data directory
// In Tauri v2, this resolves to: C:\Users\{user}\AppData\Local\com.start.pro on Windows
const getAppLocalDataDir = async (): Promise<string> => {
  try {
    // Try invoking the path API directly
    return await invoke<string>('plugin:path|app_local_data_dir');
  } catch (error) {
    // Fallback: construct it manually using homeDir
    const home = await homeDir();
    if (navigator.userAgent.indexOf('Win') !== -1) {
      return await join(home, 'AppData', 'Local', 'com.start.pro');
    } else if (navigator.userAgent.indexOf('Mac') !== -1) {
      return await join(home, 'Library', 'Application Support', 'com.start.pro');
    } else {
      return await join(home, '.local', 'share', 'com.start.pro');
    }
  }
};

export const copyExcelFileToVolume = async (from: string, fileName: string): Promise<string> => {
  let copiedPath: string = from;
  // If docker volume location is set
  if (VITE_DOCKER_VOLUME_LOCATION) {
    const homeDir = await homeDirectory();
    //Home directory with
    const to = await join(homeDir, EXCEL_DIR, fileName);
    //Check if file exists
    if (await exists(to)) {
      await remove(to);
    }
    //Copy file
    await copyFile(from, to);
    copiedPath = to;
  }
  return copiedPath;
};

export const removeExcelFileFromVolume = async (fileName: string): Promise<void> => {
  // If docker volume location is set
  if (VITE_DOCKER_VOLUME_LOCATION) {
    const homeDir = await homeDirectory();
    //Home directory with
    const to = await join(homeDir, EXCEL_DIR, fileName);
    //Check if file exists
    if (await exists(to)) {
      await remove(to);
    }
  }
};

export const getExtension = async (path: string): Promise<string> => {
  return extname(path);
};

export const saveLargeJsonToFile = async (filePath: string, jsonData: any): Promise<any> => {
  return await invoke('save_json_to_file', { filePath, jsonData });
};


export const readJsonFile = async (filePath: string): Promise<any> => {
  return await invoke('read_json_from_file', { filePath })
}

export const removeFileFromGivenPath = async (filePath: string): Promise<boolean> => {
  if (await exists(filePath)) {
    await remove(filePath);
    return true;
  }
  return false;
};

export const chunkArray = (arr: Array<any>, chunkSize: number): Array<any> => {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
};

export const getFileSize = async (filePath: string): Promise<number> => {
  return await invoke('get_file_size', { path: filePath });
};

export const getDirectorySize = async (directoryPath: string): Promise<number> => {
  return await invoke('get_directory_size', { path: directoryPath });
};

export const getProjectSize = async (dbPath: string): Promise<number> => {
  return await invoke('get_project_size', { dbPath: dbPath });
};

export interface ProjectSizeBreakdown {
  total: number;
  database: number;
  breakdown: {
    data: number;
    output: number;
    graphs: number;
    other: number;
  };
  tables: string[];
  tableDetails: Array<{
    name: string;
    rows: number;
    size: number;
  }>;
}

export const getProjectSizeBreakdown = async (dbPath: string): Promise<ProjectSizeBreakdown> => {
  return await invoke('get_project_size_breakdown', { dbPath: dbPath });
};

export const getFileNameFromPath = (filePath: string): Promise<string> => {
  return basename(filePath);
};

export const getDirPath = async (filePath: string): Promise<string> => {
  return dirname(filePath);
};

export const createTempFolder = async (): Promise<string> => {
  // Strategy 1: Try getAppLocalDataDir first (has built-in Tauri permissions)
  // This resolves to: C:\Users\{user}\AppData\Local\com.start.pro on Windows
  try {
    const appDataDir = await getAppLocalDataDir();
    const tempDir = await join(appDataDir, 'temp');
    
    // Ensure temp directory exists
    const tempExists = await exists(tempDir);
    if (!tempExists) {
      await mkdir(tempDir, { recursive: true });
    }
    
    // Verify we can actually access this directory
    await exists(tempDir); // This will throw if we don't have permission
    return tempDir;
  } catch (appDataError) {
    console.warn('getAppLocalDataDir failed, trying homeDirectory:', appDataError);
    
    // Strategy 2: Fall back to homeDirectory (same as rest of app)
    try {
      const homeDir = await homeDirectory();
      const tempDir = await join(homeDir, 'temp');
      
      // Ensure temp directory exists
      const tempExists = await exists(tempDir);
      if (!tempExists) {
        await mkdir(tempDir, { recursive: true });
      }
      
      return tempDir;
    } catch (homeError) {
      console.error('Both getAppLocalDataDir and homeDirectory failed:', {
        appDataError,
        homeError
      });
      throw new Error(
        `Could not create temp folder. Please ensure the application has proper file system permissions. ` +
        `Tried getAppLocalDataDir and homeDirectory. Last error: ${homeError}`
      );
    }
  }
};
