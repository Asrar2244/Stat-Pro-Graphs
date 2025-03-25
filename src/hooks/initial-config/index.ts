import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { exists, mkdir, create } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { Database, homeDirectory } from '@utils';
import { useTasks } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { CONFIGURATION_DB, COLLECTION_DIR } from '@constants';
import initialTables from './query';

export const useInitialConfig = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setCommonMsg } = useTasks(useShallow((state) => ({ setCommonMsg: state.setCommonMsg })));

  const { t } = useTranslation('dockLayout', { useSuspense: true });

  useEffect(() => {
    seedInitialConfig();
    //To Print App Version
    setCommonMsg({ message: '' }, t('currentVersion'));
  }, []);

  //Creating Folders
  const createInitialFolders = async (): Promise<void> => {
    const homeDir = await homeDirectory();
    if (!(await exists(homeDir))) {
      await mkdir(homeDir);
    }
    [COLLECTION_DIR].forEach(async (folder) => {
      const fullPath = await join(homeDir, folder);
      if (!(await exists(fullPath))) {
        await mkdir(fullPath);
      }
    });
  };
  //Creating Folders
  const createInitialFile = async (): Promise<void> => {
    const homeDir = await homeDirectory();
    const fullCollectionDBPath = await join(homeDir, COLLECTION_DIR, CONFIGURATION_DB);

    if (!(await exists(fullCollectionDBPath))) {
      await create(fullCollectionDBPath);
    }
  };

  const seedInitialConfig = async () => {
    try {
      setIsLoading(true);
      await createInitialFolders();
      await createInitialFile();
      const db = new Database(CONFIGURATION_DB);

      await db.executeQuery(`${Object.values(initialTables).join(';')}`).catch((error) => {
        throw error;
      });
    } catch (e) {
      console.error('Error in Seeding Initial Configurations=>', e);
    } finally {
      await invoke('close_splashscreen');
      setIsLoading(false);
    }
  };

  return {
    isLoading,
  };
};
