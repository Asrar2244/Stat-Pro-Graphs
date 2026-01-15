import { useEffect, useState } from 'react';
import { ITableProps } from './index';
import { EXCEL } from '@constants';
import { Database } from '@utils';
import { useStartProStore } from '@store/main-store';
import { isValidWorkspacePath } from '@utils/helper';
export type IItem = {
  [key: string]: string;
};
export interface IColumn {
  columnId: string;
  name?: string;
}
interface IOutput {
  columns: IColumn[];
  count: number;
}
interface IColumnsRowsCount extends ITableProps {
  noRowCount?: boolean;
}
export const useColumnsRowsCount = ({ id, tabName, noRowCount }: IColumnsRowsCount): IOutput => {
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [count, setCount] = useState<number>(0);
  const { setBlockUI } = useStartProStore();
  useEffect(() => {
    if (id && isValidWorkspacePath(tabName)) {
      const fetchData = async () => {
        let db: Database | null = null;
        try {
          db = new Database(tabName);
          db = new Database(tabName);

          // CRITICAL: Dynamically find the table name
          // Sometimes it might be 'input' (EXCEL constant), 'Sheet1', or something else
          // First, try standard EXCEL constant
          let tableName = EXCEL;
          let columnsResult = await db.selectQuery(`PRAGMA table_info(${tableName});`);

          if (!columnsResult || columnsResult.length === 0) {
            // Fallback: Find any valid table in the DB
            const tables = await db.selectQuery(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`);
            if (tables && tables.length > 0) {
              tableName = tables[0].name;
              console.log(`⚠️ Table '${EXCEL}' not found. Using '${tableName}' instead.`);
              columnsResult = await db.selectQuery(`PRAGMA table_info(${tableName});`);
            }
          }

          if (!columnsResult || columnsResult.length === 0) {
            setColumns([]);
            return;
          }

          const countQuery = `SELECT COUNT(*) as count from ${tableName};`;
          const queries: Promise<any>[] = [];

          // We already have columns, just need count if requested
          if (!noRowCount) {
            queries.push(db.selectQuery(countQuery));
          }

          const result = await Promise.all(queries);

          const createColumns: IColumn[] = columnsResult.map((column: IColumn) => {
            return {
              columnId: column.name,
            };
          });

          if (!noRowCount && result.length > 0) {
            const { count: cnt } = result[0][0];
            setCount(cnt);
            createColumns.unshift({ columnId: '' });
          }
          const cols = createColumns.filter((f) => f.columnId !== 'xxx_start_pro_id');
          setColumns(cols);
        } catch (error: any) {
          console.error('error', error);
          setBlockUI({ value: true, msg: error.message });
        } finally {
          if (db) {
            await db.close();
          }
        }
      };
      fetchData();
    }
  }, [id, tabName]);
  return {
    columns,
    count,
  };
};
