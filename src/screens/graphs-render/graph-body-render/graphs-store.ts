import { Database } from '@utils';
import { GRAPHS } from '@constants';

export interface GraphRunInput {
  name: string;
  createdAt: string;
  config: Record<string, unknown>;
  tabName: string;
  graphType: string;
  properties?: Record<string, unknown>;
}

export interface GraphRunRow {
  id: number;
  name: string;
  createdAt: string;
  config: string;
  tabName: string;
  graphType: string;
}

const createTableSQL = `
  CREATE TABLE IF NOT EXISTS ${GRAPHS} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    config TEXT NOT NULL,
    tabName TEXT NOT NULL,
    graphType TEXT NOT NULL,
    modifiedDateTime TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    properties TEXT
  );
`;

export const insertGraphRun = async (workspacePath: string, run: GraphRunInput) => {
  const db = new Database(workspacePath);
  await db.executeQuery(createTableSQL);
  const sql = `INSERT INTO ${GRAPHS}(name, createdAt, config, tabName, graphType, modifiedDateTime, properties) VALUES(?, ?, ?, ?, ?, ?, ?);`;
  const params = [run.name, run.createdAt, JSON.stringify(run.config), run.tabName, run.graphType, new Date().toISOString(), JSON.stringify(run.properties || {})];
  await db.executeQueryWithParams(sql, params as any);
  
  // Notify workspace that project size should be updated
  const event = new CustomEvent('statpro:projectUpdated', { 
    detail: { projectName: run.tabName, workspacePath } 
  });
  window.dispatchEvent(event);
  
  // Automatically set flag to display the latest graph
  try {
    const { useStartProStore } = await import('@store/main-store');
    const { setRenderLatestRun } = useStartProStore.getState();
    setRenderLatestRun(true);
  } catch (error) {
  }
};

export const listGraphRuns = async (workspacePath: string): Promise<GraphRunRow[]> => {
  const db = new Database(workspacePath);
  await db.executeQuery(createTableSQL);
  const rows = await db.selectQuery(`SELECT id, name, createdAt, config, tabName, graphType, modifiedDateTime, properties FROM ${GRAPHS} ORDER BY id DESC;`);
  return rows as GraphRunRow[];
};


