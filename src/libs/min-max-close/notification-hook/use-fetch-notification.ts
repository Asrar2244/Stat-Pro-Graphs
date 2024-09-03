import { useState, useEffect, useCallback } from 'react';
import { getNotSeenNotification, getExecutedTask, deleteBulkExecutedTask } from '@backend';
import { db } from './notification-open-db';
import { SLEEP_TIMEOUT } from '@constants';
import { useDbExecuteTask } from '@hooks';
interface INotifications {
  id: number;
  message: string;
  status: string;
  openTab?: string;
  outputId?: number;
  createdDateTime: string;
}

export const useFetchNotifications = (): Array<INotifications> => {
  const [notifications, setNotifications] = useState<INotifications[]>([]);
  const [executingTasks, setExecutingTasks] = useState<boolean>(false);
  const { executeTask } = useDbExecuteTask();
  const fetchNotifications = useCallback(async () => {
    try {
      Promise.all([
        db.selectQuery(`${getNotSeenNotification}`),
        db.selectQuery(`${getExecutedTask}`),
      ])
        .then(([notify, execTask]) => {
          if (notifications.length !== notify.length) {
            setNotifications(notify);
          }
          if (!executingTasks && execTask.length > 0) {
            setExecutingTasks(true);
            executeTask(execTask)
              .then((records) => {
                if (records.length > 0) {
                  db.executeQuery(deleteBulkExecutedTask, [records.join(',')]);
                }
              })
              .catch((error) => {
                console.error('Failed to execute tasks:', error);
              })
              .finally(() => {
                setExecutingTasks(false);
                setNotifications([]);
                fetchNotifications();
              });
          }
        })
        .catch((error) => {
          console.error('Failed to fetch notifications and executed tasks:', error);
        });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, SLEEP_TIMEOUT); // 10000 ms = 10 seconds

    // // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return notifications;
};
