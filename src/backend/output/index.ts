import { Database } from '@utils';
import { OUTPUT } from '@constants';

export interface IFetchSingleOutput {
  id: number;
  result: any;
  tabName: string;
  outputFor: string;
  outputType: string;
  modifiedDateTime: string;
}

export const fetchSingleOutput = async (
  dbName: string,
  runId: number,
): Promise<IFetchSingleOutput | undefined> => {
  const db = new Database(dbName);
  const records = await db.selectQuery(
    `SELECT id,result,tabName,outputFor,outputType,modifiedDateTime FROM ${OUTPUT} WHERE id = ${runId};`,
    [],
  );
  if (records.length > 0) {
    const { id, modifiedDateTime, outputFor, tabName, result, outputType } = records[0];
    return {
      id,
      modifiedDateTime,
      outputFor,
      tabName,
      outputType,
      result: parseJsonObject(result),
    };
  }
  return undefined;
};

export const fetchRunListOutput = async (dbName: string): Promise<IFetchSingleOutput[]> => {
  const db = new Database(dbName);
  return await db.selectQuery(
    `SELECT id,tabName,outputFor,outputType,modifiedDateTime,result
   FROM ${OUTPUT} ORDER BY id DESC;`,
    [],
  );
};

export const fetchSelected = async (
  dbName: string,
  query: string,
): Promise<IFetchSingleOutput[]> => {
  const db = new Database(dbName);
  return await db.selectQuery(query, []);
};

const parseJsonObject = (parameter: string): any => {
  return JSON.parse(!parameter || parameter === '' ? '{}' : parameter);
};

export const createOutputTable = `CREATE TABLE IF NOT EXISTS ${OUTPUT} (
      id INTEGER PRIMARY KEY   AUTOINCREMENT,
      parameters TEXT NULL,
      result TEXT NULL,
      tabName Text NUL,
      outputFor Text NULL,
      outputType Text NULL,
      modifiedDateTime TEXT NOT NULL
     )`;

export const insertToOutputTable = `INSERT INTO ${OUTPUT}
               (parameters,outputFor,tabName,modifiedDateTime,outputType)
               VALUES(?,?,?,?,?)`;
export const generateIDOutputTable = `INSERT INTO ${OUTPUT}
               (parameters,tabName,outputFor,outputType,modifiedDateTime)
               VALUES(?,?,?,?,?)`;

export const updateOutputResult = `UPDATE ${OUTPUT} SET result = ? WHERE id =?;`;
export const deleteByIDOutputTableQuery = `DELETE FROM ${OUTPUT} WHERE id = ?;`;
export const deleteByIDOutputTable = async (dbName: string, parameters: any[]): Promise<number> => {
  const db = new Database(dbName);
  const record = await db.executeQuery(deleteByIDOutputTableQuery, parameters);
  return record.lastInsertId;
};
export const outputGenerateIDTable = async (dbName: string, parameters: any[]): Promise<number> => {
  const db = new Database(dbName);
  const record = await db.executeQuery(`${createOutputTable};${generateIDOutputTable}`, parameters);
  return record.lastInsertId;
};
export const outputTable = async (dbName: string, parameters: any[]): Promise<number> => {
  const db = new Database(dbName);
  const record = await db.executeQuery(`${createOutputTable};${insertToOutputTable}`, parameters);
  
  // Notify workspace that project size should be updated
  try {
    const event = new CustomEvent('statpro:projectUpdated', { 
      detail: { projectName: parameters[2], workspacePath: dbName } // tabName is parameters[2]
    });
    window.dispatchEvent(event);
    console.log(`🔔 Notified workspace: output saved for "${parameters[2]}"`);
  } catch (error) {
    console.warn('Could not notify workspace:', error);
  }
  
  return record.lastInsertId;
};
export const outputUpdateResult = async (dbName: string, parameters: any[]): Promise<void> => {
  const db = new Database(dbName);
  await db.executeQuery(updateOutputResult, parameters);
  
  // Notify workspace that project size should be updated (results added)
  try {
    const event = new CustomEvent('statpro:projectUpdated', { 
      detail: { projectName: dbName, workspacePath: dbName }
    });
    window.dispatchEvent(event);
    console.log(`🔔 Notified workspace: output results updated for database "${dbName}"`);
  } catch (error) {
    console.warn('Could not notify workspace:', error);
  }
};
