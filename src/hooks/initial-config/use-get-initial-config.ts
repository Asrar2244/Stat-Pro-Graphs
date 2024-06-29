import { useCallback } from 'react';
import { useStartProStore } from '@store';
import { CONFIGURATION_DB } from '@constants';
import { selectFromProject } from '@backend';
import { Database } from '@utils';

interface ISetInitial {
  getConfigurations: () => Promise<void>;
}
export const useGetInitialConfig = (): ISetInitial => {
  const { setBulkProjects } = useStartProStore();
  const getConfigurations = useCallback(async () => {
    try {
      const db = new Database(CONFIGURATION_DB);
      db.selectQuery(CONFIGURATION_DB, [selectFromProject])
        .then((result) => {
          const projectsTable: any[] = result[0];
          if (projectsTable.length > 0) {
            const bulkProjectData: any = {};
            for (let i = 0; i < projectsTable.length; i++) {
              const {
                id,
                projectName,
                fileSize,
                isOpenedData,
                isActive,
                modifiedDateTime,
                createdDateTime,
                isOpenedOutput,
              } = projectsTable[i];
              bulkProjectData[projectName] = {
                fileSize,
                isOpenedData,
                isActive,
                modifiedDateTime,
                createdDateTime,
                isOpenedOutput,
                id,
              };
            }
            setBulkProjects(bulkProjectData);
          }
        })
        .catch((error) => {
          console.error('error', error.message);
        });
    } catch (e) {
      console.error('error', e);
    }
  }, []);
  return {
    getConfigurations,
  };
};
