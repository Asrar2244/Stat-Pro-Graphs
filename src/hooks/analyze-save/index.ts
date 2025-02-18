import { useTranslation } from 'react-i18next';
/**
 *  deleteByIDOutputTable,
  insertExecuteTaskTable,
 */
import {
  insertToNotificationTable,
  deleteNotification,
  outputGenerateIDTable,
  outputUpdateResult,
} from '@backend';
// import { v4 as uuidv4 } from 'uuid';
/**
 * collectionFolder, saveLargeJsonToFile,
 */
import { Database } from '@utils';
import { CONFIGURATION_DB } from '@constants';
import { useNodeActions } from '@hooks';
import { mainWorker } from '@workers/worker';
import { API } from '@constants';
import { useStartProStore } from '@store/main-store';
import { useShallow } from 'zustand/react/shallow';
import { ISelector } from 'src/screens/workspace/explorer';
interface IOthersParameters {
  message?: string;
  queueFor: string;
  url: string;
  commonTranslate?: string;
  queueType: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  notificationId?: number;
  outputId?: number;
  dbName?: string;
}
export const useAnalyzeSave = () => {
  const { t } = useTranslation(['common', 'errors']);
  const { setBlockUI } = useStartProStore();
  const { projects } = useStartProStore(
    useShallow((state) => ({ projects: state.projects, model: state.model })),
  );
  const { openNewTab } = useNodeActions();

  const insertInNotifications = async (
    isDeleteID: number = 0,
    message: string,
    openTab: string,
    outputId: number,
  ): Promise<number> => {
    const db = new Database(CONFIGURATION_DB);
    if (isDeleteID > 0) {
      const deleted = await db.executeQuery(deleteNotification, [isDeleteID]);
      return deleted.lastInsertId;
    }
    const inserted = await db.executeQuery(insertToNotificationTable, [
      message,
      openTab,
      outputId,
      new Date().toISOString(),
    ]);
    return inserted.lastInsertId;
  };

  const execute = async (
    dbName: string,
    parameters: Record<string, any>,
    otherParameters: IOthersParameters,
    id?: string
  ) => {
    const outputId = await outputGenerateIDTable(dbName, [
      '',
      dbName,
      otherParameters.queueFor,
      otherParameters.queueType,
      new Date().toISOString(),
    ]);
    const message = t(otherParameters?.commonTranslate ?? 'analyzing', {
      description: otherParameters.queueFor,
      tab: dbName,
      ns: 'common',
    })
    const notificationID = await insertInNotifications(0, message, dbName, outputId);
    parameters['notificationId'] = notificationID;
    otherParameters['message'] = message;
    otherParameters['outputId'] = outputId;
    otherParameters['notificationId'] = notificationID;
    otherParameters['dbName'] = dbName;
    // await insertInTasks('', JSON.stringify(otherParameters));
    mainWorker
      .axios(`${API.backendURL}/api/${API.analysis}`, parameters)
      .then((response: any) => {
        if (response.error) {
          throw new Error(response.error);
        }
        outputUpdateResult(dbName, [JSON.stringify(response), outputId]).then(() => {
          const projectId = Number(id?.split("-")[1])
          const data = Object.values(projects).find(item => Number(item.id) === projectId) as ISelector;
          const type = 'OUTPUT';
          openNewTab(data, projectId, type, t)

        })
          .catch((error) => {
            setBlockUI({ value: true, msg: error.message })
          });
      })
      .catch((errorMsg: any) => {
        console.log('errorMsg===>', errorMsg);
        setBlockUI({ value: true, msg: errorMsg.message });
      }).finally(() => {
        setBlockUI({ value: false, msg: "" })
      });
  };
  return { execute };
};
