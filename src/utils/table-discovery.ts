import { Database } from './db';
import { EXCEL } from '@constants';

export interface TableInfo {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    notnull: number;
    dflt_value: any;
    pk: number;
  }>;
}

export interface ProjectInfo {
  sheetId?: string;
  [key: string]: any;
}

/**
 * Discover all non-system tables in a database
 */
export const discoverTables = async (db: Database): Promise<string[]> => {
  try {
    console.log('🔍 Discovering tables in database...');
    
    // First, let's check if the database has any tables at all
    const allTables = await db.selectQuery(`SELECT name, type FROM sqlite_master`);
    console.log('📋 All database objects:', allTables);
    
    // Now get just the tables
    const tables = await db.selectQuery(`SELECT name FROM sqlite_master WHERE type='table'`);
    console.log('📊 Tables found:', tables);
    
    const tableNames = (tables || []).map((t: any) => String(t.name));
    const nonSystemTables = tableNames.filter((name: string) => !name.startsWith('sqlite_'));
    
    console.log('✅ Non-system tables:', nonSystemTables);
    
    return nonSystemTables;
  } catch (error) {
    console.error('❌ Error discovering tables:', error);
    return [];
  }
};

/**
 * Find the best table to use for data operations
 * Uses multiple strategies to find the most appropriate table
 */
export const findBestTable = async (db: Database, project?: ProjectInfo): Promise<string | null> => {
  const nonSystemTables = await discoverTables(db);
  
  if (nonSystemTables.length === 0) {
    return null;
  }
  
  // Strategy 1: Try the default EXCEL table name
  if (nonSystemTables.includes(EXCEL)) {
    return EXCEL;
  }
  
  // Strategy 2: Try case-insensitive match for 'input'
  const inputMatch = nonSystemTables.find((name: string) => name.toLowerCase() === 'input');
  if (inputMatch) {
    return inputMatch;
  }
  
  // Strategy 3: Try sheetId match if available
  if (project?.sheetId) {
    const sheetMatch = nonSystemTables.find((name: string) => 
      name.toLowerCase() === String(project.sheetId).toLowerCase()
    );
    if (sheetMatch) {
      return sheetMatch;
    }
  }
  
  // Strategy 4: Use the first non-system table
  return nonSystemTables[0];
};

/**
 * Get table information including columns
 */
export const getTableInfo = async (db: Database, tableName: string): Promise<TableInfo | null> => {
  try {
    const columns = await db.selectQuery(`PRAGMA table_info("${tableName}")`);
    if (!columns || columns.length === 0) {
      return null;
    }
    
    return {
      name: tableName,
      columns: columns.map((col: any) => ({
        name: col.name,
        type: col.type,
        notnull: col.notnull,
        dflt_value: col.dflt_value,
        pk: col.pk
      }))
    };
  } catch (error) {
    console.error(`Error getting table info for ${tableName}:`, error);
    return null;
  }
};

/**
 * Get column names from a table
 */
export const getColumnNames = async (db: Database, tableName: string): Promise<string[]> => {
  const tableInfo = await getTableInfo(db, tableName);
  return tableInfo ? tableInfo.columns.map(col => col.name) : [];
};

/**
 * Comprehensive function to get the best table and its columns
 */
export const getBestTableColumns = async (db: Database, project?: ProjectInfo): Promise<{
  tableName: string | null;
  columns: string[];
  error?: string;
}> => {
  try {
    console.log('🚀 Starting comprehensive table discovery...');
    
    // First, let's check if we can even connect to the database
    console.log('🔗 Testing database connection...');
    const connectionTest = await db.selectQuery(`SELECT 1 as test`);
    console.log('✅ Database connection test:', connectionTest);
    
    // Let's also try to get database info
    try {
      console.log('📊 Getting database schema info...');
      const schemaInfo = await db.selectQuery(`SELECT sql FROM sqlite_master`);
      console.log('📋 Database schema info:', schemaInfo);
    } catch (schemaError) {
      console.warn('⚠️ Could not get schema info:', schemaError);
    }
    
    const bestTable = await findBestTable(db, project);
    console.log('🎯 Best table found:', bestTable);
    
    if (!bestTable) {
      console.log('❌ No best table found');
      return {
        tableName: null,
        columns: [],
        error: 'No data tables found in the database'
      };
    }
    
    const columns = await getColumnNames(db, bestTable);
    console.log(`📋 Columns for table '${bestTable}':`, columns);
    
    if (columns.length === 0) {
      return {
        tableName: bestTable,
        columns: [],
        error: `Table '${bestTable}' found but has no columns`
      };
    }
    
    console.log(`✅ Success! Found table '${bestTable}' with ${columns.length} columns`);
    return {
      tableName: bestTable,
      columns
    };
  } catch (error) {
    console.error('💥 Exception in getBestTableColumns:', error);
    return {
      tableName: null,
      columns: [],
      error: `Failed to load table information: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
