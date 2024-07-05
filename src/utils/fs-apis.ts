import { exists, remove, copyFile } from '@tauri-apps/plugin-fs';
import { join, extname } from '@tauri-apps/api/path';
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
