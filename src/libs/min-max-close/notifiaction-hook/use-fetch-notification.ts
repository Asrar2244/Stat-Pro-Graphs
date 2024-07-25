import { useState, useEffect, useCallback } from 'react';
import { getNotSeenNotification } from '@backend';
import { db } from './notification-open-db';
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

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await db.selectQuery(getNotSeenNotification);

      if (notifications.length !== result.length) {
        setNotifications(result);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // 10000 ms = 10 seconds

    // // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return notifications;
};
