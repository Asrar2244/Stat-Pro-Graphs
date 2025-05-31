import { invoke } from '@tauri-apps/api/core';

export const saveExcelToFile = async (
  filePath: string,
  sheetData: Array<Array<string>>,
): Promise<void> => {
  return await invoke('save_excel_to_file', { filePath, sheetData });
};

export const saveCsvToFile = async (
  filePath: string,
  sheetData: Array<Array<string>>,
): Promise<void> => {
  return await invoke('save_csv_to_file', { filePath, sheetData });
};
