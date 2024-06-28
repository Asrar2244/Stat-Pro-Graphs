import { Database } from '@utils';
interface IOutputTable {
  success: boolean;
}
export const outputTable = async (dbName: string): Promise<IOutputTable> => {
  const query = `CREATE TABLE IF NOT EXISTS "OUTPUT" (
    id INTEGER PRIMARY KEY   AUTOINCREMENT,
    parameters TEXT NULL,
    result TEXT NULL,
    tabName Text NUL,
    outputFor Text NULL,
    outputType Text NULL,
    modifiedDateTime TEXT NOT NULL
   );`;
  try {
    const db = new Database(dbName);
    await db.executeQuery(query);
    return { success: true };
  } catch (error: any) {
    console.error('Error===>', error.message);
    return {
      success: false,
    };
  }
};
