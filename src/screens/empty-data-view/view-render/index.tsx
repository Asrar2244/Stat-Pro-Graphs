import { useEffect, useContext } from 'react';
import Spreadsheet, { CellBase, Matrix, Selection } from 'react-spreadsheet';
import { DivShowScrollOnHover } from '@libs';
import { useViewRenderLayout } from '../styles-hook/use-view-render';
import { EmptyDataContext } from '../context';
import { ColumnCreate } from './columns';
import { RowHeaderCreate } from './rows';
import { useContextMenu } from './hooks/use-context-menu';
import { ContextMenuComponent } from './context-menu';
import { ExcelView } from "@excel-view/library";

export const ViewRender = () => {
  const { data, /*columns,*/ setData, setSelectedCell, setDataState } =
    useContext(EmptyDataContext);
  const contextMenu = useContextMenu();
  const classes = useViewRenderLayout();



  const updateData = (noOfRows: number = 50, noOfColumns: number = 10) => {
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

  const onSelectHandler = (cell: Selection) => {
    if (setSelectedCell) {
      setSelectedCell(cell as any);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, header: string, type: 'row' | 'column') => {
    e.preventDefault();
    contextMenu.setType(type);
    contextMenu.setClickedHeader(header);
    contextMenu.setAnchorPoint({ x: e.clientX, y: e.clientY });
    contextMenu.setMenuOpen(true);
  };

  const handleOnChange = (state: Matrix<CellBase<any>>) => {
    setDataState?.('draft');
    setData?.(state);
  };
  console.log(data, "===========data")
  return (
    <DivShowScrollOnHover customClass={classes.layoutToolStrip} key={`${JSON.stringify(data)}`}>
      {/* <Spreadsheet
        data={data}
        onChange={handleOnChange}
        onSelect={onSelectHandler}
        RowIndicator={(props) => RowHeaderCreate({ ...props, handleContextMenu })}
        ColumnIndicator={(props) => ColumnCreate({ ...props, handleContextMenu })}
        darkMode
      /> */}
      <ExcelView
        showTabs={false}
        showToolbar={true}
        sheets={[{ data } as any]}
      // sheets={[
      //   {
      //     columns: [
      //       { type: "numeric", title: "Id" },
      //       { type: "text", width: "350px", title: "Title" },
      //       { type: "text", width: "250px", title: "Artist" },
      //       { type: "text", title: "Service" },
      //       { type: "text", title: "IPO" },
      //     ],
      //     data: [
      //       ["1", "DIVINELY UNINSPIRED TO A HELLISH EXTENT", "LEWIS CAPALDI"],
      //       ["2", "NO 6 COLLABORATIONS PROJECT", "ED SHEERAN"],
      //       ["3", "THE GREATEST SHOWMAN", "MOTION PICTURE CAST RECORDING"],
      //       ["4", "WHEN WE ALL FALL ASLEEP WHERE DO WE GO", "BILLIE EILISH"],
      //       ["5", "What are there", "Book"],
      //     ],
      //   },
      // ]}
      />
      <ContextMenuComponent {...contextMenu} />
    </DivShowScrollOnHover>
  );
};
