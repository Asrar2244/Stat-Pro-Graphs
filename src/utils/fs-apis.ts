import { exists, remove, copyFile, mkdir } from '@tauri-apps/plugin-fs';
import { join, extname, basename, dirname } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';
import { homeDirectory } from './app-apis';
import { EXCEL_DIR } from '@constants';
const { VITE_DOCKER_VOLUME_LOCATION } = import.meta.env;

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
  const tempDir = await join(await homeDirectory(), 'temp');
  if (!(await exists(tempDir))) {
    await mkdir(tempDir, { recursive: true });
  }
  return tempDir;
};
