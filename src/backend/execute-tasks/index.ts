import { EXECUTE_TASK_TABLE } from '@constants';
export const insertExecuteTaskTable = `INSERT INTO ${EXECUTE_TASK_TABLE}
               (payload,otherJson)
               VALUES(?,?)`;
export const getExecutedTask = `SELECT id,payload,otherJson
  FROM ${EXECUTE_TASK_TABLE};`;

export const deleteBulkExecutedTask = `DELETE FROM ${EXECUTE_TASK_TABLE}
  WHERE id in(?);`;
