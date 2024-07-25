import { useCallback, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { insertToNotificationTable, outputTable, outputUpdateResult } from '@backend';
import { API, CONFIGURATION_DB } from '@constants';
import { useTasks } from '@store';
import {
  Database,
  collectionFolder,
  saveLargeJsonToFile,
  removeFileFromGivenPath,
  sleep,
} from '@utils';
import { mainWorker } from '@workers/worker';

export const useExecuteTask = (): void => {
  const { t } = useTranslation('common');
  const { queueTasks, setAddTask, setCommonMsg } = useTasks(
    useShallow((state) => ({
      queueTasks: state.queueTasks,
      setAddTask: state.setAddTask,
      setCommonMsg: state.setCommonMsg,
    })),
  );

  const insertInNotifications = async (
    message: string,
    openTab: string,
    outputId: number,
  ): Promise<number> => {
    const db = new Database(CONFIGURATION_DB);
    const inserted = await db.executeQuery(insertToNotificationTable, [
      message,
      openTab,
      outputId,
      new Date().toISOString(),
    ]);
    return inserted.lastInsertId;
  };

  const executeQueues = useCallback(async (): Promise<void> => {
    if (!queueTasks) return;
    while (queueTasks.length > 0) {
      const task = queueTasks.shift(); // Dequeue the task
      const messageObj = { description: task?.queueFor, tab: task?.tabName };
      try {
        setCommonMsg({ spinner: true, message: t('analyzing', messageObj) });
        const jsonFile = await collectionFolder(`${task?.uuid}.json`);
        saveLargeJsonToFile(jsonFile, task?.parameters)
          .then(async () => {
            const outputId = await outputTable(`${task?.tabName}`, [
              jsonFile,
              task?.queueFor,
              task?.tabName,
              new Date().toISOString(),
              task?.queueType,
            ]);
            const notificationID = await insertInNotifications(
              t('analyzing', messageObj),
              task?.tabName as string,
              outputId,
            );

            const response = await mainWorker.axios(`${API.backendURL}/api/${API.analysis}`, {
              ...task?.parameters,
              notificationId: notificationID,
            });
            await outputUpdateResult(`${task?.tabName}`, [JSON.stringify(response), outputId]);

            setCommonMsg({
              spinner: false,
              message: t('analyzingSuccess', messageObj),
            });
          })
          .catch(async (err) => {
            await removeFileFromGivenPath(jsonFile);
            console.log('file not saved', err);
          });
      } catch (error) {
        setCommonMsg({ spinner: false, message: t('analyzingError', messageObj) });
        setAddTask({
          status: 'offline',
          description: t('analyzingError', messageObj),
          queueFor: task?.queueFor,
          queueType: task?.queueType,
          tabId: task?.tabId,
          tabName: task?.tabName,
        });
        console.error('error', error);
      } finally {
        setCommonMsg({ message: '', spinner: false });
        await sleep(5000);
      }
    }
  }, [queueTasks]);
  useEffect(() => {
    executeQueues();
  }, [queueTasks]);
};
