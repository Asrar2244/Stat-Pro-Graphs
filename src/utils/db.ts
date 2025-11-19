import DB from '@tauri-apps/plugin-sql';
import { join, appLocalDataDir } from '@tauri-apps/api/path';
import { CONFIGURATION_DB } from '@constants';
const { MODE } = import.meta.env;

// Import table creation queries
const CREATE_PROJECTS_TABLE = `CREATE TABLE IF NOT EXISTS PROJECTS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projectName TEXT NOT NULL,
  inputFileName TEXT NOT NULL,
  businessObjectPath TEXT NULL,
  sheetId TEXT NOT NULL DEFAULT '',
  fileSize TEXT NULL DEFAULT 0,
  isActive SMALLINT NOT NULL DEFAULT 1,
  isOpenedData SMALLINT NOT NULL DEFAULT 0,
  isOpenedOutput SMALLINT NOT NULL DEFAULT 0,
  workspacePath TEXT NULL DEFAULT '',
  createdDateTime TEXT NOT NULL,
  modifiedDateTime TEXT NOT NULL
)`;

const CREATE_CONFIGURATION_TABLE = `CREATE TABLE IF NOT EXISTS CONFIGURATION (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  types TEXT NOT NULL,
  description TEXT NOT NULL,
  createdDateTime TEXT NOT NULL,
  modifiedDateTime TEXT NOT NULL
)`;

const CREATE_NOTIFICATION_TABLE = `CREATE TABLE IF NOT EXISTS NOTIFICATION (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  seen SMALLINT NOT NULL DEFAULT 0,
  openTab TEXT NOT NULL,
  outputId INTEGER NULL,
  createdDateTime TEXT NOT NULL,
  seenDateTime TEXT NULL
)`;

const CREATE_EXECUTE_TASK_TABLE = `CREATE TABLE IF NOT EXISTS EXECUTE_TASK (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payload TEXT NOT NULL,
  otherJson TEXT NULL
)`;

export class Database {
  private db: Promise<DB>;
  constructor(dbName: string) {
    this.db = this.loadSqlLiteFile(dbName);
  }
  //To loading database file
  private async loadSqlLiteFile(dbName: string) {
    let dbLocation = dbName;
    
    if (dbName === CONFIGURATION_DB) {
      try {
        // Use app-local data directory to store writable app data
        const appFolder = await appLocalDataDir();
        const collectionsPath = await join(appFolder, 'collections');
        dbLocation = await join(collectionsPath, `${dbName}.db`);
        
        if (MODE === 'development') {
          console.log('Database - appFolder path:', appFolder);
          console.log('Database - final dbLocation:', dbLocation);
          console.log('Database - checking directory:', collectionsPath);
        }
        
        // Try to ensure the collections directory exists
        try {
          const { exists, mkdir } = await import('@tauri-apps/plugin-fs');
          if (!(await exists(collectionsPath))) {
            await mkdir(collectionsPath, { recursive: true });
          }
        } catch (dirError) {
          console.warn('Database - error setting up directory:', dirError);
          // Fall back to simpler database location
          dbLocation = `${dbName}.db`;
          if (MODE === 'development') {
            console.log('Database - using fallback dbLocation:', dbLocation);
          }
        }
        
      } catch (error) {
        console.warn('Database - error getting home directory:', error);
        dbLocation = `${dbName}.db`;
        if (MODE === 'development') {
          console.log('Database - using fallback dbLocation due to home dir error:', dbLocation);
        }
      }
    }

    if (MODE === 'development') {
      console.log('Database - attempting to load sqlite:', `sqlite:${dbLocation}`);
    }

    const database = await DB.load(`sqlite:${dbLocation}`);
    
    if (MODE === 'development') {
      console.log('Database - successfully loaded database');
    }
    
    // Ensure required tables exist for CONFIGURATION_DB
    if (dbName === CONFIGURATION_DB) {
      await this.ensureTablesExist(database);
    }
    
    return database;
  }

  // Ensure all required tables exist
  private async ensureTablesExist(database: DB) {
    const tables = [
      CREATE_PROJECTS_TABLE,
      CREATE_CONFIGURATION_TABLE,
      CREATE_NOTIFICATION_TABLE,
      CREATE_EXECUTE_TASK_TABLE
    ];

    for (const tableQuery of tables) {
      try {
        await database.execute(tableQuery);
        if (MODE === 'development') {
          console.log('Table created/verified:', tableQuery.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1]);
        }
      } catch (error) {
        console.warn('Error creating table:', error);
      }
    }
  }

  //To Execute transaction queries
  public async executeQuery(query: string, parameters?: Array<any>): Promise<any> {
    if (query === '') {
      return Promise.reject('Query can not be empty');
    }

    if (MODE === 'development') {
      console.log(`Query: ${query} with parameters: ${parameters}`);
    }

    return (await this.db).execute(query, parameters);
  }
  //To Execute selections queries
  public async selectQuery(query: string, parameters?: Array<any>): Promise<any> {
    if (query === '') {
      return Promise.reject('Query can not be empty');
    }

    if (MODE === 'development') {
      console.log(`Query: ${query} with parameters: ${parameters}`);
    }

    return (await this.db).select(query, parameters);
  }
}
