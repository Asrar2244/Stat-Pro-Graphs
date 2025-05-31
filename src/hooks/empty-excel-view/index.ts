import { dataGenWorker } from '@workers/data-gen-worker';
import { CellBase, Matrix } from 'react-spreadsheet';
import {
  convertToLinuxPath,
  createTempFolder,
  joinPaths,
  saveCsvToFile,
  Database,
  fileNameWithExtension,
  removeFileFromGivenPath,
} from '@utils';
import { useActiveNode, useNodeActions, useToaster } from '@hooks';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import { API } from '@constants/locale';
import { CONFIGURATION_DB } from '@constants';
import { insertIntoProject } from '@backend';

const createRandomUser = (): string => {
  const animalGenerators = [
    faker.animal.bird,
    faker.animal.cat,
    faker.animal.dog,
    faker.animal.snake,
    faker.animal.bear,
    faker.animal.lion,
    faker.animal.cow,
    faker.animal.horse,
    faker.animal.fish,
    faker.animal.insect,
    faker.animal.rabbit,
  ];

  // Pick one at random
  const randomFn = faker.helpers.arrayElement(animalGenerators);
  return randomFn();
};
export const useDraftData = () => {
  const { id, config } = useActiveNode([]);
  const { updateNodeAttributes } = useNodeActions();
  const toaster = useToaster();
  const saveDataFromFile = async (
    fileLocation: string,
    folderPath: string,
    fileExists: boolean,
  ) => {
    try {
      const dataName = fileExists ? config?.dataName : createRandomUser();
      const operation = 'store_data_in_db';
      const db_location = convertToLinuxPath(folderPath);
      const { data } = await axios.post(`api/${API.analysis}`, {
        data_name: fileLocation,
        input_data_type: 'file',
        operation,
        sheet_name: 'Sheet1',
        db_location,
      });

      if (data.error) {
        throw new Error(data.error);
      }
      if (data?.return_value === 'success') {
        const dbName = await fileNameWithExtension(data?.db_name);
        const workspacePath = await joinPaths([db_location, dbName]);
        const fileSize = (data.fileSize = 1046);
        let result = { lastInsertId: config.id };
        if (!fileExists) {
          const db = new Database(CONFIGURATION_DB);
          result = await db.executeQuery(insertIntoProject, [
            dataName,
            dbName,
            data?.data_name,
            data?.sheet_name,
            fileSize,
            new Date().toISOString(),
            new Date().toISOString(),
            2,
            workspacePath,
          ]);
        }

        const { lastInsertId } = result;
        updateNodeAttributes(id as string, {
          config: {
            ...config,
            tabName: workspacePath,
            name: dbName,
            id: lastInsertId,
            dataName,
            isActive: 2,
            workspacePath,
            dataState: 'published',
            isEmptyDataView: true,
          },
        });
        toaster.success({
          body: 'Data Published Successfully',
          title: 'Success',
        });

        // catch((error) => {
        //   console.error('error==>', error);
        //   toaster.error({
        //     body: error.message,
        //     title: 'error',
        //   });
        // });
      } else {
        throw new Error('Something went wrong save location file');
      }
    } catch (error: any) {
      console.error('error==>', error);
      toaster.error({
        body: error.message,
        title: 'error',
      });
    }
  };
  const deleteFileIfExists = async (filePath: string) => {
    return await removeFileFromGivenPath(filePath);
  };

  const generateCSVDataAndSaveCSV = async (
    data: Matrix<CellBase>,
    columns: Record<string, string>,
  ) => {
    const folderPath = await createTempFolder();
    const fullPath = await joinPaths([folderPath, `${config?.id}.csv`]);
    const fileExists = await deleteFileIfExists(fullPath);
    const formattedData = await dataGenWorker.getFormattedData(data, columns);

    saveCsvToFile(fullPath, formattedData)
      .then(() => {
        saveDataFromFile(fullPath, folderPath, fileExists);
      })
      .catch((error) => {
        console.error('error==>', error);
      });
  };
  return { generateCSVDataAndSaveCSV };
};
