import { useEffect, useState } from 'react';
import { EXCEL } from '@constants';
import { Database } from '@utils';
import { useStartProStore } from '@store/main-store';
import { isValidWorkspacePath } from '@utils/helper';
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
  const { setBlockUI } = useStartProStore();

  useEffect(() => {
    // CRITICAL: Also depend on tabName so columns refresh when database path changes after save
    if (id && tabName && isValidWorkspacePath(tabName)) {
      const fetchData = async () => {
        let db: Database | null = null;
        try {
          db = new Database(tabName);
          const columnQuery = `PRAGMA table_info(${EXCEL});`;
          const countQuery = `SELECT COUNT(*) as count from ${EXCEL};`;
          const queries: Promise<any>[] = [];
          queries.push(db.selectQuery(columnQuery));
          if (!noRowCount) {
            queries.push(db.selectQuery(countQuery));
          }
          const result = await Promise.all(queries);

          if (result.length === 0) {
            setColumns([]);
            return;
          }

          const createColumns: IColumn[] = result[0]
            .map((column: IColumn) => ({ columnId: column.name }))
            .filter((col: IColumn) => col.columnId !== 'xxx_start_pro_id'); // Filter internal ID first

          // CRITICAL: Filter out completely empty columns (no data)
          // This ensures "Available Variables" list only shows relevant columns
          // Construct a single optimized query to check data presence in all columns
          if (createColumns.length > 0 && db) {
            const checkDataQuery = `SELECT ${createColumns.map(c =>
              `MAX(CASE WHEN "${c.columnId}" IS NOT NULL AND CAST("${c.columnId}" AS TEXT) != '' THEN 1 ELSE 0 END) as "${c.columnId}"`
            ).join(', ')} FROM ${EXCEL}`;

            const dataResult = await db.selectQuery(checkDataQuery);

            if (dataResult && dataResult.length > 0) {
              const dataPresence = dataResult[0];
              const nonEmptyColumns = createColumns.filter(c =>
                dataPresence[c.columnId] === 1
              );

              if (!noRowCount) {
                const { count: cnt } = result[1][0];
                setCount(cnt);
                // Add empty option for descriptive stats if needed, or keeping it for consistency
                nonEmptyColumns.unshift({ columnId: '' });
              }
              setColumns(nonEmptyColumns);
            } else {
              // Should not happen if table exists, but fallback
              if (!noRowCount) {
                const { count: cnt } = result[1][0];
                setCount(cnt);
                createColumns.unshift({ columnId: '' });
              }
              setColumns(createColumns);
            }
          } else {
            setColumns([]);
          }
        } catch (err) {
          console.error('Database init error', err);
          // setBlockUI({ value: true, msg: error.message }); // Suppress UI block for background check
        } finally {
          if (db) {
            await db.close();
          }
        }
      };

      fetchData();
    } else {
      // Reset columns if id or tabName is missing
      setColumns([]);
      setCount(0);
    }
  }, [id, tabName, noRowCount]); // CRITICAL: Include tabName in dependencies so it refreshes after save
  return {
    columns,
    count,
  };
};
