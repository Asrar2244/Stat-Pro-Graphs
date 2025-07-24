import { FC, useCallback, useState, useEffect } from 'react';
import { useContainerLayout } from './styles-hook/use-container-layout';
import { ToolStrip } from './tool-strip';
import { ViewRender } from './view-render';
import { EmptyDataContext } from './context';
import { Matrix, CellBase } from 'react-spreadsheet';
import { useEmptyDataStore } from '@store';

export const EmptyDataView: FC = () => {
  const [data, setData] = useState<Matrix<CellBase>>([]);
  const [selectedCell, setSelectedCell] = useState<Selection | undefined>();
  const [columns, setColumnsState] = useState<Record<string, string>>({});
  const [dataState, setDataState] = useState<undefined | 'draft' | 'published'>(undefined);
  const classes = useContainerLayout();
  
  // Global store for data access
  const { setSpreadsheetData, setColumns: setGlobalColumns } = useEmptyDataStore();

  const setColumns = useCallback((column: Record<string, string>) => {
    setColumnsState((cols: Record<string, string>) => {
      const newColumns = { ...cols, ...column };
      // Sync with global store
      setGlobalColumns(newColumns);
      return newColumns;
    });
  }, [setGlobalColumns]);

  // Sync data with global store whenever it changes
  useEffect(() => {
    setSpreadsheetData(data);
  }, [data, setSpreadsheetData]);

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
