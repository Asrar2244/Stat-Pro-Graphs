import type { IDatabaseConnectionInfo } from '../types';

/**
 * Get all database tables and their data
 */
export const getAllDatabaseData = async (connectionInfo: IDatabaseConnectionInfo): Promise<Map<string, any[]>> => {
  const dataMap = new Map<string, any[]>();
  
  if (!connectionInfo.tabName) {
    return dataMap;
  }

  try {
    const { Database } = await import('@utils');
    const db = new Database(connectionInfo.tabName);

    // Get all available tables
    const tablesQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`;
    const tables = await db.selectQuery(tablesQuery);

    // Fetch ALL data from ALL tables
    for (const table of tables) {
      try {
        const tableName = table.name;
        
        const fullQuery = `SELECT * FROM ${tableName}`;
        const fullData = await db.selectQuery(fullQuery);
        
        if (fullData.length > 0) {
          dataMap.set(tableName, fullData);
        }
      } catch (error) {
        console.warn(`❌ Error fetching table ${table.name}:`, error);
      }
    }
    return dataMap;
  } catch (error) {
    console.error('❌ Error fetching all database data:', error);
    return dataMap;
  }
};

/**
 * Find the best matching data for a section based on intelligent analysis
 */
export const findBestDataForSection = (allData: Map<string, any[]>, sectionTitle: string, mainOutputTableName?: string): any[] | null => {
  
  const sectionLower = sectionTitle.toLowerCase();
  let bestMatch: any[] | null = null;
  let bestScore = 0;
  // let bestTableName = '';
  
  // Check each table for relevance to this section
  for (const [tableName, data] of allData.entries()) {
    if (data.length === 0) continue;
    
    const columns = Object.keys(data[0]).map(col => col.toLowerCase());
    const tableNameLower = tableName.toLowerCase();
    let score = 0;
    
    
    
    // Score based on section title keywords
    if (sectionLower.includes('lcl') || sectionLower.includes('ucl') || 
        sectionLower.includes('lpl') || sectionLower.includes('upl') ||
        sectionLower.includes('confidence') || sectionLower.includes('limit')) {
      
      const hasLimitColumns = columns.some(col => 
        col.includes('lcl') || col.includes('ucl') || 
        col.includes('lpl') || col.includes('upl') ||
        col.includes('estimate') || col.includes('limit') ||
        col.includes('confidence')
      );
      if (hasLimitColumns) score += 100;
    }
    
    if (sectionLower.includes('outlier')) {
      const hasOutlierColumns = columns.some(col => col.includes('outlier')) ||
                              tableNameLower.includes('outlier');
      if (hasOutlierColumns) score += 100;
    }
    
    if (sectionLower.includes('coefficient') || sectionLower.includes('regression') ||
        sectionLower.includes('b =') || sectionLower.includes('effect')) {
      const hasCoeffColumns = columns.some(col => 
        col.includes('coefficient') || col.includes('effect') || 
        col.includes('bse') || col.includes('tvalue') || col.includes('pvalue') ||
        col.includes('estimate') || col.includes('std')
      );
      if (hasCoeffColumns) score += 100;
    }
    
    if (sectionLower.includes('statistic') || sectionLower.includes('test')) {
      const hasStatColumns = columns.some(col => 
        col.includes('stat') || col.includes('test') || 
        col.includes('p_value') || col.includes('pvalue') ||
        col.includes('chi') || col.includes('f_value')
      );
      if (hasStatColumns) score += 100;
    }
    
    // Check for data table sections - prefer larger datasets
    if (sectionLower.includes('table') || sectionLower.includes('data') || 
        sectionLower.includes('output') || sectionLower.includes('result') ||
        sectionLower.includes('scrollable') || sectionLower.includes('complete')) {
      
      // Main output table gets high priority
      if (mainOutputTableName && tableName === mainOutputTableName) {
        score += 80;
      }
      
      // Larger datasets get preference for data tables (especially scrollable ones)
      if (data.length > 100) score += 50; // Very large datasets
      else if (data.length > 50) score += 40;
      else if (data.length > 20) score += 30;
      else if (data.length > 10) score += 20;
      
      // Bonus for tables that might contain scrollable data
      if (data.length > 20) {
        score += 15;
      }
    }
    
    // Bonus for tables with many meaningful columns
    const meaningfulColumns = columns.filter(col => {
      const columnValues = data.map(row => row[col]);
      const nonEmptyValues = columnValues.filter(val => val !== null && val !== undefined && val !== '');
      return nonEmptyValues.length > data.length * 0.1; // At least 10% non-empty
    });
    
    if (meaningfulColumns.length > 5) score += 10;
    
    
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = data;
      // bestTableName = tableName;
      
    }
  }
  
  if (!bestMatch) {
    return null;
  }

  // For outlier sections: display only present values and hide null/undefined
  if (sectionLower.includes('outlier')) {
    const isEmptyCell = (v: any): boolean => v == null || v === '' || (typeof v === 'string' && (v.toLowerCase() === 'null' || v.toLowerCase() === 'undefined'));
    const isEmptyRow = (row: any): boolean => {
      if (!row || typeof row !== 'object') return true;
      return Object.values(row).every(isEmptyCell);
    };
    const sanitizeRow = (row: any): any => {
      if (!row || typeof row !== 'object') return row;
      return Object.fromEntries(Object.entries(row).map(([k, v]) => {
        if (isEmptyCell(v)) {
          return [k, '']; // Hide null/undefined/empty values completely
        }
        // Display numeric zero as "0"
        if (typeof v === 'number' && v === 0) {
          return [k, '0'];
        }
        return [k, v];
      }));
    };

    // Remove fully empty rows and sanitize remaining cells
    const cleaned = bestMatch.filter((r) => !isEmptyRow(r)).map(sanitizeRow);

    // Optionally trim trailing empties if any slipped through
    let lastIdx = -1;
    for (let i = 0; i < cleaned.length; i += 1) {
      if (!isEmptyRow(cleaned[i])) lastIdx = i;
    }
    return lastIdx >= 0 ? cleaned.slice(0, lastIdx + 1) : [];
  }

  return bestMatch;
};