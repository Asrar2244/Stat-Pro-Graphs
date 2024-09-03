import { mainWorker } from '@workers/worker';
import { useShallow } from 'zustand/react/shallow';
import { useTasks } from '@store';
import { exists, readTextFile } from '@tauri-apps/plugin-fs';
import { useToaster, useAxios } from '@hooks';
import { sleep, Database } from '@utils';
import { NOTIFICATION_STATUS, CONFIGURATION_DB } from '@constants';
import { outputUpdateResult, updateNotification } from '@backend';

interface ITasks {
  id: number;
  payload: string;
  otherJson: string;
}
interface ITaskOutput {
  executeTask: (tasks: ITasks[]) => Promise<number[]>;
}
export const useDbExecuteTask = (): ITaskOutput => {
  const { setCommonMsg } = useTasks(
    useShallow((state) => ({
      setCommonMsg: state.setCommonMsg,
    })),
  );
  const { info, error, success } = useToaster();
  const axios = useAxios();
  const getParametersFile = async (filePath: string) => {
    if (await exists(filePath)) {
      return await readTextFile(filePath);
    }
    return '';
  };
  const updateNotificationMethod = async (id: number, status: string) => {
    const db = new Database(CONFIGURATION_DB);
    await db.executeQuery(updateNotification, [status, id]);
  };
  const executeTask = async (tasks: ITasks[]): Promise<number[]> => {
    const toDelete = [];
    for (let i = 0; i < tasks.length; i++) {
      const { id, payload, otherJson } = tasks[i];
      const other = JSON.parse(otherJson ?? '{}');
      toDelete.push(id);
      try {
        if (!other?.url) {
          throw new Error('URL not found in given input');
        }
        info({ body: other?.message });
        setCommonMsg({
          message: other?.message,
          spinner: true,
        });
        getParametersFile(payload)
          .then(async (parameters) => {
            return await mainWorker.stringToObject(parameters);
          })
          .then((parameters) => {
            const method = other.method ?? 'POST';
            axios({
              url: other.url,
              method,
              data: method === 'POST' && parameters,
              params: method === 'GET' && parameters,
            })
              .then(({ data }: any) => {
                if (data.error) {
                  updateNotificationMethod(other.notificationId, NOTIFICATION_STATUS.ERROR);
                  throw new Error(data.error);
                }

                Promise.all([
                  outputUpdateResult(other.dbName, [JSON.stringify(data), other.outputId]),
                  updateNotificationMethod(other.notificationId, NOTIFICATION_STATUS.SUCCESS),
                ]).then(() => {
                  success({ body: other?.message });
                });
              })
              .catch((err: any) => {
                throw new Error(err.message);
              });
          });
      } catch (err: any) {
        error({ body: err.message });
      } finally {
        setCommonMsg({ message: '', spinner: false });
        await sleep(500);
      }
    }
    //Empty the tasks array
    tasks = [];
    return toDelete;
  };
  return { executeTask };
};
