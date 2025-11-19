import { FC, memo, useEffect, useState } from 'react';
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
  setHeaderClass?: (x: "show" | "hide") => void
}
const TableCreatorComponent: FC<ITableComp> = ({ table, dbFileName, dbTableName, t, setHeaderClass }) => {
  const { showHeaders, view, recordType, appendColumn, postfix, prefix, type, translationColumns } =
    table;

  const { numberFormat, snitizedSpecialChar } = useFormatter();
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
    setHeaderClass
  });
  const [jsonData, updateJsonData] = useState({})
  const pageContext = usePagination(totalRecords, DEFAULT_OUTPUT_TABLE_PAGE_SIZE);
  useEffect(() => {
    if (typeof recordType !== 'boolean' && recordType?.pageSize && totalRecords > 0) {
      loadTemplateView(pageContext.startIndex, pageContext.stopIndex);
    } else if (!recordType || typeof recordType === 'boolean') {
      loadTemplateView(0, 0);
    }
  }, [totalRecords, pageContext.startIndex, pageContext.stopIndex]);
  useEffect(() => {
    updateJsonData(Object.fromEntries(templateView));
  }, [templateView])

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
                  <TableHeaderCell key={col} className="cell header">
                    {col && col.startsWith('t-') ? t(col) : snitizedSpecialChar(col)}
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
                <TableRow key={rIndex} className='test-table'>
                  {row?.map((col, cIndex) => {
                    const transCell =
                      Array.isArray(translationColumns) && translationColumns[cIndex];
                    const cellType = col.startsWith('t-') || row.length > 2 ? "left" : "right";
                    return (
                      <TableCell key={cIndex} className={cellType === "right" ? "cell-type-right" : "cell-type-left"}>
                        <div data-celltype={cellType}>
                          {col && (col.startsWith('t-') || transCell !== undefined)
                            ? t(numberFormat(col), { ...jsonData })
                            : numberFormat(col)}
                        </div>
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