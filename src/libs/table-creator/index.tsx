import { FC, memo, useEffect } from 'react';
import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
  mergeClasses,
  CardPreview,
  CardFooter,
} from '@fluentui/react-components';
import { useFormatter, usePagination } from '@hooks';
import { useTableFetch } from './use-table-hook';
import { ITranslate, ITableCreator } from '@utils';
import { Pagination } from '@libs';
import { DEFAULT_OUTPUT_TABLE_PAGE_SIZE } from '@constants';
import { useCreateTableStyles } from './styles-hook/use-table-create-style';
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
  const { showHeaders, view, recordType, appendColumn, postfix, prefix, type, translationColumns } =
    table;
  const { numberFormat } = useFormatter();
  const { templateView, totalRecords, loadTemplateView, loading } = useTableFetch({
    dbName: dbFileName,
    tableName: dbTableName,
    t,
    view: view as any,
    recordType,
    appendColumn,
    postfix,
    prefix,
    type,
  });
  const pageContext = usePagination(totalRecords, DEFAULT_OUTPUT_TABLE_PAGE_SIZE);
  useEffect(() => {
    if (typeof recordType !== 'boolean' && recordType?.pageSize && totalRecords > 0) {
      loadTemplateView(pageContext.startIndex, pageContext.stopIndex);
    } else if (!recordType || typeof recordType === 'boolean') {
      loadTemplateView(0, 0);
    }
  }, [totalRecords, pageContext.startIndex, pageContext.stopIndex]);
  const classes = useCreateTableStyles();
  const headers = showHeaders ?? true;
  const tableBodyClass = mergeClasses(
    classes.tbody,
    typeof recordType !== 'boolean' && recordType?.pageSize ? classes.tbodyHeight : '',
  );
  return (
    <div className={classes.tableLayout}>
      <CardPreview>
        <Table noNativeElements className={classes.table}>
          {headers && (
            <TableHeader className="table-header">
              <TableRow>
                {templateView[0]?.map((col) => (
                  <TableHeaderCell key={col} className="cell">
                    {col && col.startsWith('t-') ? t(col) : col}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
          )}
          <TableBody className={tableBodyClass}>
            {loading ? (
              <TableRow>
                <TableCell>Fetching Records</TableCell>
              </TableRow>
            ) : (
              templateView.slice(headers ? 1 : 0, templateView.length).map((row, rIndex) => (
                <TableRow key={rIndex}>
                  {row?.map((col, cIndex) => {
                    const transCell =
                      Array.isArray(translationColumns) && translationColumns[cIndex];
                    return (
                      <TableCell key={cIndex}>
                        {col && (col.startsWith('t-') || transCell !== undefined)
                          ? t(col)
                          : numberFormat(col)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardPreview>
      {typeof recordType !== 'boolean' && recordType?.pageSize && (
        <div className={classes.pagingList}>
          <CardFooter>
            <Pagination {...pageContext} />
          </CardFooter>
        </div>
      )}
    </div>
  );
};

export const TableCreator = memo(TableCreatorComponent);
