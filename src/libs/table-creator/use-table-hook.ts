import { useCallback, useMemo, useState } from 'react';
import { Database } from '@utils';

interface IDataResult {
  totalRecords: number;
  data: any[];
}

const generateQuery = (tableName: string, key: string, columns: any[]): string => {
  const queryColumns = [];
  for (const column in columns) {
    queryColumns.push(column[key as any]);
  }

  return `SELECT ${queryColumns.join(',')} FROM ${tableName} WHERE ${queryColumns.join(' IS NOT NULL OR ')}`;
};

export const useTableFetch = (
  dbName: string,
  tableName: string,
  Key: string,
  columns: any[],
  dataMapper?: Array<any>,
): IDataResult => {
  const [data, setData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const query = useMemo(() => {
    if (dataMapper) {
      return generateQuery(tableName, Key, dataMapper);
    }
    return generateQuery(tableName, Key, columns);
  }, []);

  useCallback(async () => {
    const db = new Database(dbName);
    const result = await db.selectQuery(query);

    setData(result);
  }, []);

  return {
    data,
    totalRecords,
  };
};
