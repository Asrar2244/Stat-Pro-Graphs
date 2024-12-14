import { homeDir, join, basename } from '@tauri-apps/api/path';
import { APP_DIR, COLLECTION_DIR, EXCEL_DIR } from '@constants';
const { VITE_DIR_SHARED_LOCATION, VITE_DOCKER_VOLUME_LOCATION } = import.meta.env;

//Get Home directory
export const homeDirectory = async (): Promise<string> => {
  if (VITE_DIR_SHARED_LOCATION) {
    return join(VITE_DIR_SHARED_LOCATION, APP_DIR);
  }
  const dirPath = await homeDir();
  return join(dirPath, APP_DIR);
};

//Get Docker Volume directory if set
export const volumeDirectory = async (): Promise<string> => {
  if (VITE_DOCKER_VOLUME_LOCATION) {
    return VITE_DOCKER_VOLUME_LOCATION;
  }
  return await homeDirectory();
};

// Platform Info normal js method to find is windows | mac | linux

export const platformInfo = (): string => {
  if (navigator.userAgent.indexOf('Mac') !== -1) return 'mac';
  if (navigator.userAgent.indexOf('Win') !== -1) return 'windows';
  if (navigator.userAgent.indexOf('Linux') !== -1) return 'linux';
  return 'unknown';
};

//Get Collection path from volume location if set
export const collectionsLocation = async (table?: string): Promise<string> => {
  const homeDir = await volumeDirectory();
  if (table) {
    return await join(homeDir, COLLECTION_DIR, table);
  }
  return await join(homeDir, COLLECTION_DIR);
};

//Get Excel path from volume location if set
export const excelLocation = async (): Promise<string> => {
  const homeDir = await volumeDirectory();
  return await join(homeDir, EXCEL_DIR);
};

// Get File Name with extension
export const fileNameWithExtension = async (filePath: string): Promise<string> => {
  return await basename(filePath);
};

//Get Excel file path from volume location if set
export const volumeExcelFilePath = async (filePath: string): Promise<string> => {
  if (VITE_DOCKER_VOLUME_LOCATION) {
    const fileName = await fileNameWithExtension(filePath);
    //If docker volume location is set
    return await join(VITE_DOCKER_VOLUME_LOCATION, EXCEL_DIR, fileName);
  }
  return filePath;
};

// Convert to linux path if set docker
export const convertToLinuxPath = (filePath: string): string => {
  if (VITE_DOCKER_VOLUME_LOCATION && platformInfo() === 'windows') {
    return filePath.replace(/\\/g, '/').replace(/^([a-zA-Z]):/, '/$1');
  }
  return filePath;
};
export const collectionFolder = async (appendPath?: string): Promise<string> => {
  const homeDir = await homeDirectory();
  if (appendPath) {
    return await join(homeDir, COLLECTION_DIR, appendPath);
  }
  return await join(homeDir, COLLECTION_DIR);
};

export const joinPaths = (paths: string[]): Promise<string> => {
  return join(...paths);
};
