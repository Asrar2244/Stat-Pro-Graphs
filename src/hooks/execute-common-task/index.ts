import { useCallback, useEffect } from 'react';
import { useAxios } from '@hooks';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { OUTPUT } from '@constants';
import { API } from '@constants';
import { useTasks } from '@store';
import { outputTable } from './create-output-table';
import { Database, sleep } from '@utils';
export const useExecuteTask = (): void => {
  const axios = useAxios();
  const { t } = useTranslation('common');
  const { queueTasks, setAddTask, setCommonMsg } = useTasks(
    useShallow((state) => ({
      queueTasks: state.queueTasks,
      setAddTask: state.setAddTask,
      setCommonMsg: state.setCommonMsg,
    })),
  );

  const executeQueues = useCallback(async (): Promise<void> => {
    if (!queueTasks) return;
    while (queueTasks.length > 0) {
      const task = queueTasks.shift(); // Dequeue the task
      const messageObj = { description: task?.queueFor, tab: task?.tabName };
      try {
        setCommonMsg({ spinner: true, message: t('analyzing', messageObj) });
        const response = await axios.post(`api/${API.analysis}`, task?.parameters);
        const result = await outputTable(`${task?.tabName}`);

        if (!result.success) throw new Error(`${result.success}`);

        //Db Call
        const db = new Database(`${task?.tabName}`);
        await db.executeQuery(
          `INSERT INTO ${OUTPUT}
               (parameters,outputFor,tabName,result,modifiedDateTime,outputType)
               VALUES(?,?,?,?,?,?)`,
          [
            JSON.stringify(task?.parameters),
            task?.queueFor,
            task?.tabName,
            JSON.stringify(response.data),
            new Date().toISOString(),
            task?.queueType,
          ],
        );
        setCommonMsg({ spinner: false, message: t('analyzingSuccess', messageObj) });
        setAddTask({
          status: 'available',
          description: t('analyzingSuccess', messageObj),
          queueFor: task?.queueFor,
          tabId: task?.tabId,
          tabName: task?.tabName,
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
        await sleep(5000);
        setCommonMsg({ message: '', spinner: false });
      }
    }
  }, [queueTasks]);
  useEffect(() => {
    executeQueues();
  }, [queueTasks]);
};
