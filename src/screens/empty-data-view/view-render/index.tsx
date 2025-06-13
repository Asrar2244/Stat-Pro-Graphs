import { useEffect, useContext, useMemo } from 'react';
import Spreadsheet, { CellBase, Matrix, Selection } from 'react-spreadsheet';
import { DivShowScrollOnHover } from '@libs';
import { useViewRenderLayout } from '../styles-hook/use-view-render';
import { EmptyDataContext } from '../context';
import { ColumnCreate } from './columns';
import { RowHeaderCreate } from './rows';
import { useContextMenu } from './hooks/use-context-menu';
import { ContextMenuComponent } from './context-menu';
import { useNodeActions, useActiveNode } from '@hooks';
import { useEmptyDataStore } from '@store';

export const ViewRender = () => {
  const { data, /*columns,*/ setData, setSelectedCell, setDataState } =
    useContext(EmptyDataContext);
  const contextMenu = useContextMenu();
  const classes = useViewRenderLayout();
  const { config } = useActiveNode([]);
  const { updateNodeAttributes } = useNodeActions();
  const id: string = useMemo(() => {
    return `${config?.bareType}-${config?.id}`;
  }, [config?.id]);
  const { nodes } = useEmptyDataStore();

  useEffect(() => {
    updateData();
  }, [setData]);

  useEffect(() => {
    if (nodes?.nodeId === id) console.log('Here details==>', nodes);
  }, [nodes?.nodeId]);

  const updateData = (noOfRows: number = 50, noOfColumns: number = 36) => {
    if (setData) {
      const data: Matrix<CellBase> = [];
      for (let i = 0; i < noOfRows; i++) {
        const row: CellBase[] = [];
        for (let j = 0; j < noOfColumns; j++) {
          row.push({ value: '' });
        }
        data.push(row);
      }
      setData(data);
    }
  };
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
    updateNodeAttributes(id as string, {
      config: {
        ...config,
        dataState: 'draft',
      },
    });
    setData?.(state);
  };

  return (
    <DivShowScrollOnHover customClass={classes.layoutToolStrip}>
      <Spreadsheet
        data={data}
        onChange={handleOnChange}
        onSelect={onSelectHandler}
        RowIndicator={(props) => RowHeaderCreate({ ...props, handleContextMenu })}
        ColumnIndicator={(props) => ColumnCreate({ ...props, handleContextMenu })}
        darkMode
      />
      <ContextMenuComponent {...contextMenu} />
    </DivShowScrollOnHover>
  );
};
