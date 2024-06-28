import { FC, memo } from 'react';
import { useFormatter } from '@hooks';
interface IColumnCreator {
  label?: string;
  key: string;
  width?: string;
  height?: string;
  cellStyles?: (item: any, rowIndex: number, columnIndex: number) => object;
}
/**
 * Table creator component that renders a table based on provided columns and data.
 *
 * @param {ITableCreator} showHeaders - Whether to show the table headers
 * @param {ITableCreator} columns - Array of column configurations
 * @param {ITableCreator} data - Array of data to be rendered in the table
 * @return {ReactNode} The JSX for rendering the table component
 */
export interface ITableCreator {
  showHeaders?: boolean;
  showCaption?: boolean;
  columns: IColumnCreator[];
  data: any[];
}

const TableCreatorComponent: FC<ITableCreator> = ({ showHeaders, columns, data }) => {
  const { numberFormat } = useFormatter();
  const headers = showHeaders ?? true;

  return (
    <table>
      {headers && (
        <thead>
          <tr>
            {columns?.map((col, cIndex) => (
              <th
                key={cIndex}
                style={{ width: col?.width ?? 'auto', height: col.height ?? 'fit-content' }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {data?.map((row, rIndex) => (
          <tr key={rIndex}>
            {columns?.map((col, cIndex) => {
              const style =
                typeof col.cellStyles === 'function' && col.cellStyles(row, rIndex, cIndex);
              return (
                <td key={cIndex} style={{ ...style }}>
                  {numberFormat(row[col.key])}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const TableCreator = memo(TableCreatorComponent);
