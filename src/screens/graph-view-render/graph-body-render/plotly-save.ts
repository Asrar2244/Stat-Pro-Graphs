import { exists, mkdir } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';

export const ensureGraphFolderAndSave = async (
  projectPath: string,
  config: Record<string, unknown>
) => {
  try {
    if (!projectPath) return undefined;
    const graphsDir = await join(projectPath, 'Graphs');
    try {
      if (!(await exists(graphsDir))) {
        await mkdir(graphsDir, { recursive: true });
      }
    } catch {}
    const fileName = `graph_${Date.now()}.json`;
    const filePath = await join(graphsDir, fileName);
    try {
      await invoke('save_json_to_file', { filePath, jsonData: config });
      return filePath;
    } catch (e) {
      // Swallow save errors (e.g., forbidden path, missing permission). DB persistence remains the source of truth.
      return undefined;
    }
  } catch {
    return undefined;
  }
};









