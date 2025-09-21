import { exists, mkdir } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';

export const ensureGraphFolderAndSave = async (
  projectPath: string,
  config: Record<string, unknown>
) => {
  if (!projectPath) return;
  const graphsDir = await join(projectPath, 'Graphs');
  if (!(await exists(graphsDir))) {
    await mkdir(graphsDir, { recursive: true });
  }
  const fileName = `graph_${Date.now()}.json`;
  const filePath = await join(graphsDir, fileName);
  await invoke('save_json_to_file', { filePath, jsonData: config });
  return filePath;
};







