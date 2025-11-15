import { useEffect, useContext } from 'react';
import { CellBase, Matrix } from 'react-spreadsheet';
import { DivShowScrollOnHover } from '@libs';
import { useViewRenderLayout } from '../styles-hook/use-view-render';
import { EmptyDataContext } from '../context';
import { useContextMenu } from './hooks/use-context-menu';
import { ContextMenuComponent } from './context-menu';
import { ExcelView } from "@excel-view/library";

export const ViewRender = () => {
  const { data, /*columns,*/ setData } =
    useContext(EmptyDataContext);
  const contextMenu = useContextMenu();
  const classes = useViewRenderLayout();

  const updateData = (noOfRows: number = 50, noOfColumns: number = 36) => {
    if (setData) {
      const data: Matrix<CellBase> = [];
      for (let i = 0; i < noOfRows; i++) {
        const row: CellBase[] = [];
        for (let j = 0; j < noOfColumns; j++) {
          row.push("" as any);
        }
        data.push(row);
      }
      setData(data);
    }
  };

  useEffect(() => {
    updateData();
  }, [setData]);


  return (
    <DivShowScrollOnHover customClass={classes.layoutToolStrip} key={`${JSON.stringify(data)}`}>
      <ExcelView
        showTabs={false}
        showToolbar={true}
        sheets={[{ data } as any]}
      />
      <ContextMenuComponent {...contextMenu} />
    </DivShowScrollOnHover>
  );
};
