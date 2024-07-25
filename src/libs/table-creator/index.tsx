import { FC, memo } from 'react';
import { useFormatter } from '@hooks';
import { useTableFetch } from './use-table-hook';
import { ITranslate, ITableCreator } from '@utils';

/**
 * Table creator component that renders a table based on provided columns and data.
 *
 * @param {ITableCreator} showHeaders - Whether to show the table headers
 * @param {ITableCreator} columns - Array of column configurations
 * @param {ITableCreator} data - Array of data to be rendered in the table
 * @return {ReactNode} The JSX for rendering the table component
 */

interface ITableComp extends ITranslate {
  table: ITableCreator;
  dbFileName: string;
  dbTableName: string;
}
const TableCreatorComponent: FC<ITableComp> = ({ table, dbFileName, dbTableName, t }) => {
  const { showHeaders, view, recordType } = table;
  const { numberFormat } = useFormatter();
  const { templateView } = useTableFetch({
    dbName: dbFileName,
    tableName: dbTableName,
    t,
    view: view as any,
    recordType,
  });
  const headers = showHeaders ?? true;

  return (
    <table>
      {headers && (
        <thead>
          <tr>
            {templateView[0]?.map((col) => (
              <th
                key={col}
                // style={{ width: col?.width ?? 'auto', height: col.height ?? 'fit-content' }}
              >
                {col && col.startsWith('t-') ? t(col) : col}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {templateView.slice(headers ? 1 : 0, templateView.length).map((row, rIndex) => (
          <tr key={rIndex}>
            {row?.map((col, cIndex) => {
              // const style =
              //   typeof col.cellStyles === 'function' && col.cellStyles(row, rIndex, cIndex);
              return (
                <td key={cIndex}>{col && col.startsWith('t-') ? t(col) : numberFormat(col)}</td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const TableCreator = memo(TableCreatorComponent);
