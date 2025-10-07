import { useEffect, useState } from 'react';
import { exists, mkdir, create } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { Database, homeDirectory } from '@utils';
import { safeTauriCall, isTauriEnvironment } from '@utils/tauri-utils';
import { useTasks } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { CONFIGURATION_DB, COLLECTION_DIR } from '@constants';
import initialTables from './query';

export const useInitialConfig = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setCommonMsg } = useTasks(useShallow((state) => ({ setCommonMsg: state.setCommonMsg })));

  const { t } = useTranslation('dockLayout', { useSuspense: false }); // Change to false

  useEffect(() => {
    // Run config setup in background
    seedInitialConfig();
    //To Print App Version
    setCommonMsg({ message: '' }, t('currentVersion'));
  }, []);

  //Creating Folders
  const createInitialFolders = async (): Promise<void> => {
    try {
      const homeDir = await homeDirectory();
      
      // In development mode, skip folder creation
      if (!isTauriEnvironment()) {
        console.log('Development mode: Skipping folder creation for:', homeDir);
        return;
      }

      if (!(await safeTauriCall(() => exists(homeDir), false))) {
        await safeTauriCall(() => mkdir(homeDir), undefined);
      }
      
      for (const folder of [COLLECTION_DIR]) {
        const fullPath = await safeTauriCall(
          () => join(homeDir, folder),
          homeDir + '/' + folder
        );
        if (!(await safeTauriCall(() => exists(fullPath), false))) {
          await safeTauriCall(() => mkdir(fullPath), undefined);
        }
      }
    } catch (error) {
      console.warn('Error creating folders:', error);
    }
  };

  //Creating Folders
  const createInitialFile = async (): Promise<void> => {
    try {
      const homeDir = await homeDirectory();
      const fullCollectionDBPath = await safeTauriCall(
        () => join(homeDir, COLLECTION_DIR, CONFIGURATION_DB),
        homeDir + '/' + COLLECTION_DIR + '/' + CONFIGURATION_DB
      );

      // In development mode, skip file creation
      if (!isTauriEnvironment()) {
        console.log('Development mode: Skipping file creation for:', fullCollectionDBPath);
        return;
      }

      if (!(await safeTauriCall(() => exists(fullCollectionDBPath), false))) {
        await safeTauriCall(() => create(fullCollectionDBPath), undefined);
      }
    } catch (error) {
      console.warn('Error creating initial file:', error);
    }
  };

  const seedInitialConfig = async () => {
    try {
      setIsLoading(true);
      await createInitialFolders();
      await createInitialFile();
      
      // Skip database operations in development mode
      if (isTauriEnvironment()) {
        const db = new Database(CONFIGURATION_DB);
        await db.executeQuery(`${Object.values(initialTables).join(';')}`).catch((error) => {
          console.warn('Database initialization error:', error);
        });
      } else {
        console.log('Development mode: Skipping database initialization');
      }
    } catch (e) {
      console.error('Error in Seeding Initial Configurations=>', e);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
  };
};
