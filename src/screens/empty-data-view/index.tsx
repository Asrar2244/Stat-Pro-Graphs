import { FC, useCallback, useState } from 'react';
import { useContainerLayout } from './styles-hook/use-container-layout';
import { ToolStrip } from './tool-strip';
import { ViewRender } from './view-render';
import { EmptyDataContext } from './context';
import { Matrix, CellBase } from 'react-spreadsheet';

export const EmptyDataView: FC = () => {
  const [data, setData] = useState<Matrix<CellBase>>([]);
  const [selectedCell, setSelectedCell] = useState<Selection | undefined>();
  const [columns, setColumnsState] = useState<Record<string, string>>({});
  const [dataState, setDataState] = useState<undefined | 'draft' | 'published'>(undefined);
  const classes = useContainerLayout();

  const setColumns = useCallback((column: Record<string, string>) => {
    setColumnsState((cols: Record<string, string>) => {
      return { ...cols, ...column };
    });
  }, []);

  return (
    <div className={classes.layoutContainer}>
      <EmptyDataContext.Provider
        value={{
          data,
          selectedCell,
          columns,
          setData,
          setSelectedCell,
          setColumns,
          dataState,
          setDataState,
        }}
      >
        <ToolStrip />
        <ViewRender />
      </EmptyDataContext.Provider>
    </div>
  );
};
