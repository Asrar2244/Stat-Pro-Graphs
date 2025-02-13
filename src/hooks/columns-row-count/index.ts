import { useEffect, useState } from 'react';
import { EXCEL } from '@constants';
import { Database } from '@utils';
import { useStartProStore } from '@store/main-store';
interface ITableProps {
  id: number;
  isActive: number;
  lastModified: string;
  tabName: string;
  type: string;
}
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
  const { setBlockUI } = useStartProStore()

  useEffect(() => {
    if (id) {
      const db = new Database(tabName);
      const columnQuery = `PRAGMA table_info(${EXCEL});`;
      const countQuery = `SELECT COUNT(*) as count from ${EXCEL};`;
      const queries: Promise<any>[] = [];

      queries.push(db.selectQuery(columnQuery));
      if (!noRowCount) {
        queries.push(db.selectQuery(countQuery));
      }
      Promise.all(queries)
        .then((result) => {
          if (result.length === 0) {
            return [];
          }
          const createColumns: IColumn[] = result[0].map((column: IColumn) => {
            return {
              columnId: column.name,
            };
          });
          if (!noRowCount) {
            const { count: cnt } = result[1][0];
            setCount(cnt);
            createColumns.unshift({ columnId: '' });
          }
          setColumns(createColumns);
        })
        .catch((error) => {
          console.error('error', error);
          setBlockUI({ value: true, msg: error.message })
        });
    }
  }, [id]);
  return {
    columns,
    count,
  };
};
