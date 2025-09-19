import { Database } from '@utils';
import { GRAPHS } from '@constants';

export interface IFetchSingleGraph {
  id: number;
  config: any;
  tabName: string;
  graphType: string;
  modifiedDateTime: string;
}

export const fetchSingleGraph = async (
  dbName: string,
  runId: number,
): Promise<IFetchSingleGraph | undefined> => {
  const db = new Database(dbName);
  const records = await db.selectQuery(
    `SELECT id,config,tabName,graphType,modifiedDateTime FROM ${GRAPHS} WHERE id = ${runId};`,
    [],
  );
  if (records.length > 0) {
    const { id, modifiedDateTime, graphType, tabName, config } = records[0];
    return {
      id,
      modifiedDateTime,
      graphType,
      tabName,
      config: parseJsonObject(config),
    };
  }
  return undefined;
};

export const fetchGraphRunList = async (dbName: string): Promise<IFetchSingleGraph[]> => {
  console.log('🔍 Backend: Fetching graph runs from database:', dbName);
  const db = new Database(dbName);
  await db.executeQuery(createGraphTable);
  const records = await db.selectQuery(
    `SELECT id,tabName,graphType,modifiedDateTime,config
     FROM ${GRAPHS} ORDER BY id DESC;`,
    [],
  );
  console.log('📊 Backend: Raw graph records:', records);
  const result = records.map(record => ({
    ...record,
    config: parseJsonObject(record.config),
  }));
  console.log('📊 Backend: Processed graph records:', result);
  return result;
};

const parseJsonObject = (parameter: string): any => {
  return JSON.parse(!parameter || parameter === '' ? '{}' : parameter);
};

export const createGraphTable = `CREATE TABLE IF NOT EXISTS ${GRAPHS} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  config TEXT NOT NULL,
  tabName TEXT NOT NULL,
  graphType TEXT NOT NULL,
  modifiedDateTime TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

export const insertToGraphTable = `INSERT INTO ${GRAPHS}
  (name, createdAt, config, tabName, graphType, modifiedDateTime)
  VALUES(?,?,?,?,?,?)`;

export const generateIDGraphTable = `INSERT INTO ${GRAPHS}
  (name, createdAt, config, tabName, graphType, modifiedDateTime)
  VALUES(?,?,?,?,?,?)`;

export const graphGenerateIDTable = async (dbName: string, parameters: any[]): Promise<number> => {
  const db = new Database(dbName);
  const record = await db.executeQuery(`${createGraphTable};${generateIDGraphTable}`, parameters);
  return record.lastInsertId;
};

export const graphTable = async (dbName: string, parameters: any[]): Promise<number> => {
  const db = new Database(dbName);
  const record = await db.executeQuery(`${createGraphTable};${insertToGraphTable}`, parameters);
  return record.lastInsertId;
};
