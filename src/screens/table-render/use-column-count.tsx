import { useEffect, useState } from 'react';
import { useToaster } from '@hooks';
import { ITableProps } from './index';
import { EXCEL } from '@constants';
export type IItem = {
  [key: string]: string;
};
export interface IColumn {
  columnId: string;
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
  const toast = useToaster();

  useEffect(() => {
    if (id) {
      //ToDo
      /*  const dbName = tabName;
      const columnQuery = `PRAGMA table_info(${EXCEL})`;
      const countQuery = `SELECT COUNT(*) as count from ${EXCEL};`;
      const queries: Promise<any>[] = [];
      
      queries.push(window.api.selectQuery(dbName, columnQuery, []));
      if (!noRowCount) {
        queries.push(window.api.selectQuery(dbName, countQuery));
      }
      Promise.all(queries)
        .then((result) => {
          const createColumns: IColumn[] = result[0].map((column) => {
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
          window.api.log('error', error);
          toast.error({ body: error.message });
        });
        */
    }
  }, [id]);
  return {
    columns,
    count,
  };
};
