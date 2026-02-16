import DB from '@tauri-apps/plugin-sql';
import { join, appLocalDataDir } from '@tauri-apps/api/path';
import { CONFIGURATION_DB } from '@constants';
import { platformInfo } from './app-apis';
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
  isOpenedGraphs SMALLINT NOT NULL DEFAULT 0,
  workspacePath TEXT NULL DEFAULT '',
  isExternal SMALLINT NOT NULL DEFAULT 0,
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
  private dbName: string;
  private isConfigDb: boolean = false;
  private resolvedPath: string = '';

  // Static map to track active connections per file path
  private static refCounts: Map<string, number> = new Map();

  constructor(dbName: string) {
    this.dbName = dbName;

    // Initial check based on name
    if (dbName === CONFIGURATION_DB || dbName.includes(`${CONFIGURATION_DB}.db`)) {
      this.isConfigDb = true;
    }

    this.db = this.loadSqlLiteFile(dbName);
  }

  //To loading database file
  private async loadSqlLiteFile(dbName: string) {
    let dbLocation = dbName;

    if (dbName === CONFIGURATION_DB) {
      this.isConfigDb = true; // Confirm it's the config DB
      try {
        // Use app-local data directory to store writable app data
        const appFolder = await appLocalDataDir();
        const collectionsPath = await join(appFolder, 'Stat-Pro', 'collections');
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
    } else {
      // Additional check: If the provided path ends with the config DB name
      if (String(dbName).endsWith(`${CONFIGURATION_DB}.db`) || String(dbName).includes(`collections${platformInfo?.() === 'windows' ? '\\' : '/'}${CONFIGURATION_DB}.db`)) {
        this.isConfigDb = true;
        if (MODE === 'development') {
          console.log(`Database - Detected CONFIGURATION_DB via path: ${dbName}`);
        }
      }
      // Use dbName as location directly (it's likely a full path or simple name)
      // Note: For project DBs, dbName is usually the full 'workspacePath'
    }

    // Normalize path for ref counting consistency
    // Simple normalization: if it contains separators, assume it's a path.
    // Ideally we'd use `resolve` but `join` gives us a good enough approximation for keys if consistent.
    // For now, we use `dbLocation` as the key.
    this.resolvedPath = dbLocation;

    // INCREMENT REF COUNT
    const currentCount = Database.refCounts.get(this.resolvedPath) || 0;
    Database.refCounts.set(this.resolvedPath, currentCount + 1);

    if (MODE === 'development') {
      console.log(`Database - attempting to load sqlite: sqlite:${dbLocation} (RefCount: ${currentCount + 1})`);
    }

    const database = await DB.load(`sqlite:${dbLocation}`);

    if (MODE === 'development') {
      console.log('Database - successfully loaded database');
    }

    // Ensure required tables exist for CONFIGURATION_DB
    // Use the flag to be sure
    if (this.isConfigDb) {
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

    // Run migrations for existing tables (add missing columns)
    await this.runMigrations(database);
  }

  // Run migrations to add missing columns to existing tables
  private async runMigrations(database: DB) {
    const migrations = [
      // Add isOpenedGraphs column to PROJECTS table if it doesn't exist
      'ALTER TABLE PROJECTS ADD COLUMN isOpenedGraphs SMALLINT NOT NULL DEFAULT 0',
      // Add isExternal column to PROJECTS table if it doesn't exist
      'ALTER TABLE PROJECTS ADD COLUMN isExternal SMALLINT NOT NULL DEFAULT 0',
    ];

    for (const migration of migrations) {
      try {
        await database.execute(migration);
        if (MODE === 'development') {
          console.log('Migration applied:', migration.substring(0, 50) + '...');
        }
      } catch (error: any) {
        const msg = String(error?.message || error || '');
        if (msg.toLowerCase().includes('duplicate column')) {
          if (MODE === 'development') {
            console.log('Migration skipped: Column already exists.');
          }
        } else {
          if (MODE === 'development') {
            console.warn('Migration failed with unexpected error:', msg);
          }
        }
      }
    }
  }

  //To Execute transaction queries
  public async executeQuery(query: string, parameters?: Array<any>): Promise<any> {
    if (query === '') {
      return Promise.reject('Query can not be empty');
    }



    return (await this.db).execute(query, parameters);
  }
  //To Execute selections queries
  public async selectQuery(query: string, parameters?: Array<any>): Promise<any> {
    if (query === '') {
      return Promise.reject('Query can not be empty');
    }



    return (await this.db).select(query, parameters);
  }

  public async executeQueryWithParams(query: string, parameters: Array<any>): Promise<any> {
    if (query === '') {
      return Promise.reject('Query can not be empty');
    }

    return (await this.db).execute(query, parameters);
  }

  /**
   * Closes the database connection.
   * @param force - If true, ignores reference counting and forces closure.
   */
  public async close(force: boolean = false): Promise<void> {
    // 1. CONFIGURATION_DB Protection
    // Always ignored unless forced (though ideally even forced is risky for config)
    // We treat Config DB as permanent singleton usually.
    if (this.isConfigDb && !force) {
      if (MODE === 'development') {
        console.log('Database - IGNORING close request for CONFIGURATION_DB (Protected Singleton)');
      }
      return;
    }

    // 2. Reference Counting Protection
    const currentCount = Database.refCounts.get(this.resolvedPath) || 0;
    const newCount = Math.max(0, currentCount - 1);
    Database.refCounts.set(this.resolvedPath, newCount);

    if (newCount > 0 && !force) {
      if (MODE === 'development') {
        console.log(`Database - Soft Close. Connection kept open. (RefCount: ${currentCount} -> ${newCount}) for ${this.resolvedPath}`);
      }
      return;
    }

    // 3. Actual Closure
    // If count reaches 0 OR force is true
    try {
      await (await this.db).close();
      if (MODE === 'development') {
        console.log(`Database - connection closed successfully (RefCount: ${currentCount} -> ${newCount}${force ? ' [FORCED]' : ''})`);
      }
      // If we genuinely closed it, ensure map is clean, though newCount is already 0
      if (newCount === 0) {
        Database.refCounts.delete(this.resolvedPath);
      }
    } catch (error) {
      console.warn('Database - error closing connection:', error);
    }
  }
}
