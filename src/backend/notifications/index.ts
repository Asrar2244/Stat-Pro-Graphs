import { NOTIFICATION_TABLE } from '@constants';
export const insertToNotificationTable = `INSERT INTO ${NOTIFICATION_TABLE}
               (message,openTab,outputId,createdDateTime)
               VALUES(?,?,?,?)`;
