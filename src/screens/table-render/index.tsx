import { Tooltip } from '@fluentui/react-components';
import { FC, ReactNode, memo, useEffect } from 'react';
import { useColumnsRowsCount } from './use-column-count';
import { useFetchRecords } from './use-fetch-rows';
import { ListSkeleton, DivShowScrollOnHover, Pagination } from '@libs';
import ColumnSizer from 'react-virtualized/dist/es/ColumnSizer';
import CellMeasurer, { CellMeasurerCache } from 'react-virtualized/dist/es/CellMeasurer';
import MultiGrid from 'react-virtualized/dist/es/MultiGrid';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import { useTableStyles } from './styles-hook/use-table-style';
import { usePagination } from '@hooks';
import { TableSearch } from './table-search';

export interface ITableProps {
  id: number;
  isActive: number;
  lastModified: string;
  tabName: string;
  type: string;
}

const noContentRenderer = (): ReactNode => {
  return <div>No cells</div>;
};
const TableDataRender: FC<ITableProps> = (props) => {
  const classes = useTableStyles();
  const { columns, count } = useColumnsRowsCount(props);
  const pageContext = usePagination(count);
  const { data, isLoading, loadMoreFun } = useFetchRecords(props.tabName, pageContext.pageSize);
  useEffect(() => {
    pageContext.dataLoader(loadMoreFun);
  }, [pageContext.startIndex, pageContext.stopIndex]);

  const CellHelper: FC<{
    columnIndex: number;
    rowIndex: number;
  }> = ({ columnIndex, rowIndex }) => {
    if (!data || !Array.isArray(data)) {
      return null;
    }
    if (rowIndex === 0) {
      if (columnIndex === 0) return <div>&nbsp;</div>;
      return (
        <Tooltip content={columns[columnIndex].columnId} relationship="label" withArrow>
          <span> {columns[columnIndex].columnId}</span>
        </Tooltip>
      );
    }
    if (columnIndex === 0) {
      return (
        <div className={classes.rowIndex}>
          {rowIndex + (pageContext.currentPage - 1) * pageContext.pageSize}
        </div>
      );
    }
    return (
      <input
        type="text"
        className={classes.textBoxCss}
        defaultValue={data[rowIndex][columns[columnIndex].columnId]}
      />
    );
  };
  const cellRenderer = ({ columnIndex, key, rowIndex, style, parent }: any) => {
    const _width = rowIndex !== 0 ? { width: 'auto' } : {};
    return (
      <CellMeasurer
        cache={cache}
        parent={parent}
        key={`${columnIndex}-${rowIndex}`}
        columnIndex={columnIndex}
        rowIndex={rowIndex}
      >
        <div
          key={key}
          className={rowIndex === 0 || columnIndex === 0 ? classes.cellHeaders : classes.cellStyle}
          style={{
            ...style,
            ..._width,
            display: 'flex',
          }}
        >
          <CellHelper rowIndex={rowIndex} columnIndex={columnIndex} />
        </div>
      </CellMeasurer>
    );
  };
  const cache = new CellMeasurerCache({
    defaultHeight: 44,
    defaultWidth: 120,
    minWidth: 60,
    fixedHeight: true,
  });
  return (
    <div className={classes.completeLayout}>
      <TableSearch {...props} />
      <DivShowScrollOnHover>
        {isLoading ? (
          <ListSkeleton skeletonCount={20} />
        ) : (
          <AutoSizer>
            {({ width, height }): ReactNode => (
              <ColumnSizer columnMinWidth={44} columnCount={columns.length} width={width}>
                {({ adjustedWidth, registerChild }): ReactNode => (
                  <MultiGrid
                    className={classes.cellStyle}
                    ref={registerChild}
                    fixedColumnCount={1}
                    fixedRowCount={1}
                    columnWidth={cache.columnWidth}
                    columnCount={columns.length}
                    height={height - 95}
                    noContentRenderer={noContentRenderer}
                    cellRenderer={cellRenderer}
                    rowHeight={35}
                    rowCount={data.length}
                    width={isNaN(adjustedWidth) ? 0 : adjustedWidth}
                  />
                )}
              </ColumnSizer>
            )}
          </AutoSizer>
        )}
      </DivShowScrollOnHover>
      <div className={classes.footerLayout}>
        <Pagination {...pageContext} />
      </div>
    </div>
  );
};

export const TableRender = memo(TableDataRender);
