import { Database } from '@utils';
import { GRAPHS } from '@constants';

export interface IFetchSingleGraph {
  id: number;
  config: any;
  tabName: string;
  graphType: string;
  modifiedDateTime: string;
  properties?: any;
}

export const fetchSingleGraph = async (
  dbName: string,
  runId: number,
): Promise<IFetchSingleGraph | undefined> => {
  const db = new Database(dbName);
  await db.executeQuery(createGraphTable);
  // Attempt to add properties column if it doesn't exist
  try { await db.executeQuery(`ALTER TABLE ${GRAPHS} ADD COLUMN properties TEXT`); } catch {}
  const records = await db.selectQuery(
    `SELECT id,config,tabName,graphType,modifiedDateTime,properties FROM ${GRAPHS} WHERE id = ${runId};`,
    [],
  );
  if (records.length > 0) {
    const { id, modifiedDateTime, graphType, tabName, config, properties } = records[0];
    return {
      id,
      modifiedDateTime,
      graphType,
      tabName,
      config: parseJsonObject(config),
      properties: parseJsonObject(properties),
    };
  }
  return undefined;
};

export const fetchGraphRunList = async (dbName: string): Promise<IFetchSingleGraph[]> => {
  console.log('🔍 Backend: Fetching graph runs from database:', dbName);
  const db = new Database(dbName);
  await db.executeQuery(createGraphTable);
  try { await db.executeQuery(`ALTER TABLE ${GRAPHS} ADD COLUMN properties TEXT`); } catch {}
  const records = await db.selectQuery(
    `SELECT id,tabName,graphType,modifiedDateTime,config,properties
     FROM ${GRAPHS} ORDER BY id DESC;`,
    [],
  );
  console.log('📊 Backend: Raw graph records:', records);
  const result = records.map(record => ({
    ...record,
    config: parseJsonObject(record.config),
    properties: parseJsonObject(record.properties),
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
  modifiedDateTime TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  properties TEXT
)`;

export const insertToGraphTable = `INSERT INTO ${GRAPHS}
  (name, createdAt, config, tabName, graphType, modifiedDateTime, properties)
  VALUES(?,?,?,?,?,?,?)`;

export const generateIDGraphTable = `INSERT INTO ${GRAPHS}
  (name, createdAt, config, tabName, graphType, modifiedDateTime, properties)
  VALUES(?,?,?,?,?,?,?)`;

export const graphGenerateIDTable = async (dbName: string, parameters: any[]): Promise<number> => {
  const db = new Database(dbName);
  const record = await db.executeQuery(`${createGraphTable};${generateIDGraphTable}`, parameters);
  
  // Notify workspace that project size should be updated
  try {
    const event = new CustomEvent('statpro:projectUpdated', { 
      detail: { projectName: parameters[3], workspacePath: dbName } // tabName is parameters[3]
    });
    window.dispatchEvent(event);
    console.log(`🔔 Notified workspace: graph saved (backend) for "${parameters[3]}"`);
  } catch (error) {
    console.warn('Could not notify workspace:', error);
  }
  
  // Automatically set flag to display the latest graph
  try {
    const { useStartProStore } = await import('@store/main-store');
    const { setRenderLatestRun } = useStartProStore.getState();
    setRenderLatestRun(true);
    console.log('🎯 Auto-selecting latest graph after backend ID generation');
  } catch (error) {
    console.warn('Could not set renderLatestRun flag:', error);
  }
  
  return record.lastInsertId;
};

export const graphTable = async (dbName: string, parameters: any[]): Promise<number> => {
  const db = new Database(dbName);
  const record = await db.executeQuery(`${createGraphTable};${insertToGraphTable}`, parameters);
  
  // Automatically set flag to display the latest graph
  try {
    const { useStartProStore } = await import('@store/main-store');
    const { setRenderLatestRun } = useStartProStore.getState();
    setRenderLatestRun(true);
    console.log('🎯 Auto-selecting latest graph after backend creation');
  } catch (error) {
    console.warn('Could not set renderLatestRun flag:', error);
  }
  
  return record.lastInsertId;
};

export const updateGraphRunConfig = async (
  dbName: string,
  runId: number,
  nextConfig: any,
): Promise<void> => {
  const db = new Database(dbName);
  await db.executeQuery(createGraphTable);
  // Merge with existing config to avoid overwriting fields like workspacePath
  const rows = await db.selectQuery(`SELECT config FROM ${GRAPHS} WHERE id = ?;`, [runId] as any);
  const currentCfg = rows && rows[0] ? parseJsonObject(rows[0].config) : {};
  const merged = { ...currentCfg, ...nextConfig };
  const sql = `UPDATE ${GRAPHS} SET config = ?, modifiedDateTime = CURRENT_TIMESTAMP WHERE id = ?;`;
  await db.executeQueryWithParams(sql, [JSON.stringify(merged), runId] as any);
};

export const updateGraphRunProperties = async (
  dbName: string,
  runId: number,
  nextProperties: any,
): Promise<void> => {
  const db = new Database(dbName);
  await db.executeQuery(createGraphTable);
  try { await db.executeQuery(`ALTER TABLE ${GRAPHS} ADD COLUMN properties TEXT`); } catch {}
  const sql = `UPDATE ${GRAPHS} SET properties = ?, modifiedDateTime = CURRENT_TIMESTAMP WHERE id = ?;`;
  await db.executeQueryWithParams(sql, [JSON.stringify(nextProperties), runId] as any);
};
