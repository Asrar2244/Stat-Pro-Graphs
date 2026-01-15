import { useState, useEffect, useCallback, useRef } from 'react';
import { getNotSeenNotification, getExecutedTask, deleteBulkExecutedTask } from '@backend';
import { Database } from '@utils';
import { CONFIGURATION_DB, SLEEP_TIMEOUT } from '@constants';
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

  // Ref to track if component is mounted to prevent state updates on unmounted component
  const isMounted = useRef(true);

  const fetchNotifications = useCallback(async () => {
    let db: Database | null = null;
    try {
      db = new Database(CONFIGURATION_DB);

      const [notify, execTask] = await Promise.all([
        db.selectQuery(`${getNotSeenNotification}`),
        db.selectQuery(`${getExecutedTask}`),
      ]);

      if (!isMounted.current) return;

      if (notifications.length !== notify.length) {
        setNotifications(notify);
      }

      if (!executingTasks && execTask.length > 0) {
        setExecutingTasks(true);

        // Close DB before long-running task execution to release connection
        await db.close();
        db = null;

        try {
          const records = await executeTask(execTask);

          if (isMounted.current && records.length > 0) {
            // Re-open DB to delete executed tasks
            const deleteDb = new Database(CONFIGURATION_DB);
            try {
              await deleteDb.executeQuery(deleteBulkExecutedTask, [records.join(',')]);
            } finally {
              await deleteDb.close();
            }
          }
        } catch (error) {
          console.error('Failed to execute tasks:', error);
        } finally {
          if (isMounted.current) {
            setExecutingTasks(false);
            setNotifications([]);
            // Trigger another fetch immediately to check for more tasks/updates
            // Intentionally separated from the main interval loop
            fetchNotifications();
          }
        }
      }

    } catch (error: any) {
      if (!String(error).includes('closed pool')) {
        console.error('Failed to fetch notifications:', error);
      }
    } finally {
      if (db) {
        await db.close();
      }
    }
  }, [notifications.length, executingTasks, executeTask]);

  useEffect(() => {
    isMounted.current = true;
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, SLEEP_TIMEOUT);

    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []); // Dependencies left empty for set-and-forget interval

  return notifications;
};
