import { useTranslation } from 'react-i18next';
import {
  insertToNotificationTable,
  deleteNotification,
  outputGenerateIDTable,
  deleteByIDOutputTable,
  insertExecuteTaskTable,
} from '@backend';
import { v4 as uuidv4 } from 'uuid';
import { collectionFolder, saveLargeJsonToFile, Database } from '@utils';
import { CONFIGURATION_DB } from '@constants';
import { useToaster } from '@hooks';
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
  const { error, info } = useToaster();
  const insertInNotifications = async (
    isDeleteID: number = 0,
    message: string,
    openTab: string,
    outputId: number,
  ): Promise<number> => {
    info({ body: t('addingTaskToQueue') });
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
  const insertInTasks = async (payload: string, otherJson: string): Promise<number> => {
    const db = new Database(CONFIGURATION_DB);

    const inserted = await db.executeQuery(insertExecuteTaskTable, [payload, otherJson]);
    return inserted.lastInsertId;
  };
  const save = async (
    dbName: string,
    parameters: Record<string, any>,
    otherParameters: IOthersParameters,
  ) => {
    const uuid = uuidv4();
    const jsonFile = await collectionFolder(`${uuid}.json`);
    const outputId = await outputGenerateIDTable(dbName, [
      jsonFile,
      dbName,
      otherParameters.queueFor,
      otherParameters.queueType,
      new Date().toISOString(),
    ]);
    const message = t(otherParameters?.commonTranslate ?? 'analyzing', {
      description: otherParameters.queueFor,
      tab: dbName,
      ns: 'common',
    });
    const notificationID = await insertInNotifications(0, message, dbName, outputId);
    parameters['notificationId'] = notificationID;
    otherParameters['message'] = message;
    otherParameters['outputId'] = outputId;
    otherParameters['notificationId'] = notificationID;
    otherParameters['dbName'] = dbName;
    saveLargeJsonToFile(jsonFile, parameters)
      .then(async () => {
        await insertInTasks(jsonFile, JSON.stringify(otherParameters));
      })
      .catch(async (err) => {
        console.error(err);
        await insertInNotifications(notificationID, '', '', 0);
        await deleteByIDOutputTable(dbName, [outputId]);
        error({ body: err.message ?? t('errorInSaveFile', { ns: 'errors' }) });
      });
  };
  return { save };
};
