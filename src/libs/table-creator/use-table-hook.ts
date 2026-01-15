import { useEffect, useMemo, useState } from 'react';
import { Database, ITranslate, ITableCreator } from '@utils';
import { tableWorker } from '@workers/table-gen-worker';
interface IDataResult {
  totalRecords: number;
  templateView: Array<Array<string>>;
  loadTemplateView: (startIndex: number, stopIndex: number) => Promise<void>;
  loading: boolean;
  setLoading: (previous: boolean) => void;

}
interface ITableFetch extends ITranslate, ITableCreator {
  dbName: string;
  tableName: string;
  rawData?: boolean;
  setHeaderClass?: (x: "show" | "hide") => void
}

export const useTableFetch = ({
  dbName,
  tableName,
  view,
  recordType,
  appendColumn,
  postfix,
  prefix,
  type,
  rawData = false,
  setHeaderClass
}: ITableFetch): IDataResult => {
  const [templateView, setTemplateView] = useState<Array<Array<string>> | Array<any>>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const statements = useMemo(async () => {
    if (!dbName || !tableName) {
      setLoading(false);
      return { query: '', pageQuery: '', checkColumnsExistsQuery: '', viewNew: undefined } as any;
    }
    switch (type) {
      case 'columns':
        const columnsQuery = await tableWorker.generateQueryColumn(view, tableName, recordType);
        const viewNew = await executeColumnGenerator(columnsQuery.query);

        const result = await tableWorker.generateQueryColumn(viewNew, tableName, recordType);
        return Promise.resolve({ ...result, viewNew });
      case 'json-array': {
        const columnsQuery2 = await tableWorker.generateQueryColumn(view, tableName, recordType);
        const db = new Database(dbName);
        const rawRows = await db.selectQuery(columnsQuery2.query);
        let jsonStr: string | undefined;
        if (rawRows && rawRows.length > 0) {
          const row0 = rawRows[0];
          for (const key of Object.keys(row0)) {
            const val = row0[key];
            if (typeof val === 'string') {
              const trimmed = val.trim();
              if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
                jsonStr = trimmed;
                break;
              }
            }
          }
        }
        let viewNew2: Array<Array<string>> = [];
        try {
          if (jsonStr) {
            const arr = JSON.parse(jsonStr);
            if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'object') {
              const keys = Object.keys(arr[0]);
              viewNew2.push(keys);
              for (let i = 0; i < arr.length; i++) {
                const obj = arr[i] as Record<string, any>;
                viewNew2.push(keys.map((k) => (obj[k] == null ? '' : String(obj[k]))));
              }
            }
          }
        } catch (_) {
          viewNew2 = [];
        }
        return Promise.resolve({ query: '', pageQuery: '', checkColumnsExistsQuery: '', viewNew: viewNew2 });
      }
      default:
        return await tableWorker.generateQueryColumn(view, tableName, recordType);
    }
  }, []);

  useEffect(() => {
    executeTableCount();
  }, [dbName, tableName]);

  const executeColumnGenerator = async (query: string): Promise<string[]> => {
    if (!dbName || !tableName || !query) return [];
    const db = new Database(dbName);
    const result = await db.selectQuery(query);
    const viewGen: Array<string> = [];
    for (let i = 0; i < result.length; i++) {
      Object.values(result[i]).forEach((value: any) => {
        if (value) {
          viewGen.push(`${prefix ?? ''}${value}${postfix ?? ''}`);
        }
      });
    }
    if (Array.isArray(appendColumn)) {
      viewGen.push(...appendColumn);
    }
    return viewGen;
  };
  const executeTableCount = async () => {
    if (!dbName || !tableName) return;
    const { pageQuery } = await statements;
    if (pageQuery !== '') {
      const db = new Database(dbName);
      const recordCount = await db.selectQuery(`${pageQuery}`);
      setTotalRecords(recordCount[0]['CNT']);
    }
  };
  const loadTemplateView = async (startIndex: number, stopIndex: number) => {
    if (!dbName || !tableName) {
      setTemplateView([]);
      setLoading(false);
      return;
    }
    const { query: rawQuery, columns: rawColumns, viewNew, checkColumnsExistsQuery } = await statements;
    if (rawQuery !== '') {
      const db = new Database(dbName);
      const existedColumns = checkColumnsExistsQuery ? await db.selectQuery(checkColumnsExistsQuery) : [];
      if (existedColumns.length > 0) {
        // Filter columns to only those that actually exist in the database table
        const existedColumnNames = existedColumns.map((c: any) => c.name);
        const filteredColumns = rawColumns.filter((col: string) => {
          const unquoted = col.replace(/"/g, '');
          return existedColumnNames.includes(unquoted);
        });

        if (filteredColumns.length > 0) {
          const filteredQuery = `SELECT ${filteredColumns.join(',')} FROM ${tableName} WHERE ${filteredColumns.join(' IS NOT NULL OR ')} IS NOT NULL`;
          const result = await db.selectQuery(
            `${filteredQuery} ${totalRecords > 0 ? `LIMIT ${startIndex},${stopIndex}` : ''}`,
          );
          if (!rawData) {
            const templateView = await tableWorker.mergingData(viewNew ?? view, result, recordType);
            setTemplateView(templateView);
          } else {
            setTemplateView(result);
          }
        } else {
          setTemplateView([]);
        }
      }
      else {
        setTemplateView([]);
      }
      setHeaderClass && setHeaderClass(existedColumns.length > 0 ? "show" : "hide")
      setLoading(false);
    } else if (Array.isArray(viewNew) && Array.isArray(viewNew[0])) {
      setTemplateView(viewNew as Array<Array<string>>);
      setHeaderClass && setHeaderClass((viewNew as Array<any>).length > 0 ? "show" : "hide")
      setLoading(false);
    }
  };
  return {
    templateView,
    totalRecords,
    loadTemplateView,
    loading,
    setLoading,
  };
};
