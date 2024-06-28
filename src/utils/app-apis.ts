import { homeDir, join } from '@tauri-apps/api/path';
import { APP_DIR } from '@constants';
const { VITE_DIR_SHARED_LOCATION, VITE_DOCKER_VOLUME_LOCATION } = import.meta.env;

//Get Home directory
export const homeDirectory = async (): Promise<string> => {
  if (VITE_DIR_SHARED_LOCATION) {
    return join(VITE_DIR_SHARED_LOCATION, APP_DIR);
  }
  const dirPath = await homeDir();
  return join(dirPath, APP_DIR);
};

//Assign volume directory

export const volumeDirectory = async (): Promise<string> => {
  if (VITE_DOCKER_VOLUME_LOCATION) {
    return VITE_DOCKER_VOLUME_LOCATION;
  }
  return await homeDirectory();
};
