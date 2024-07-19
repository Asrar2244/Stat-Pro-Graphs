import { NOTIFICATION_TABLE } from '@constants';
export const insertToNotificationTable = `INSERT INTO ${NOTIFICATION_TABLE}
               (message,openTab,outputId,createdDateTime)
               VALUES(?,?,?,?)`;
export const getNotSeenNotification = `SELECT id,message,status,openTab,outputId,createdDateTime
  FROM NOTIFICATION WHERE seen=0;`;
