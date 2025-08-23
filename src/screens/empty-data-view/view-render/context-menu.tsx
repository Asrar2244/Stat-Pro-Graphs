import { FC, useContext } from 'react';
import { Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from '@fluentui/react-components';
import {
  TbRowInsertBottom,
  TbRowInsertTop,
  TbColumnInsertLeft,
  TbColumnInsertRight,
} from 'react-icons/tb';
import { RiDeleteRow, RiDeleteColumn } from 'react-icons/ri';
import { CellBase } from 'react-spreadsheet';

import { IUseContextMenu } from './hooks/use-context-menu';
import { EmptyDataContext } from '../context';

export const ContextMenuComponent: FC<IUseContextMenu> = ({
  menuOpen,
  setMenuOpen,
  anchorPoint,
  clickedHeader,
  type,
}) => {
  const { data, setData, setDataState } = useContext(EmptyDataContext);

  const getHeaderIndex = () => {
    return parseInt(clickedHeader as string, 10);
  };

  const handleInsertRow = (direction: 'above' | 'below') => {
    if (!data || !setData) return;

    const rowIndex = getHeaderIndex();
    if (rowIndex < 0) return;
    const numCols = data[0]?.length || 0;
    const newRow: CellBase[] = Array(numCols).fill({ value: '' });

    const insertIndex = direction === 'above' ? rowIndex : rowIndex + 1;

    const newData = [...data];
    newData.splice(insertIndex, 0, newRow);
    setData(newData);
    setDataState?.('draft');
    setMenuOpen(false);
  };

  const handleDeleteRow = () => {
    if (!data || !setData) return;

    const rowIndex = getHeaderIndex();
    if (rowIndex < 0) return;
    const newData = [...data];
    newData.splice(rowIndex, 1);
    setData(newData);
    setDataState?.('draft');
    setMenuOpen(false);
  };

  const handleInsertColumn = (direction: 'left' | 'right') => {
    if (!data || !setData) return;

    const colIndex = getHeaderIndex();
    if (colIndex < 0) return;
    const insertIndex = direction === 'left' ? colIndex : colIndex + 1;

    const newData = data.map((row) => {
      const newRow = [...row];
      newRow.splice(insertIndex, 0, { value: '' });
      return newRow;
    });
    setData(newData);
    setDataState?.('draft');
    setMenuOpen(false);
  };

  const handleDeleteColumn = () => {
    if (!data || !setData) return;

    const colIndex = getHeaderIndex();
    if (colIndex < 0) return;
    const newData = data.map((row) => {
      const newRow = [...row];
      newRow.splice(colIndex, 1);
      return newRow;
    });
    setData(newData);
    setDataState?.('draft');
    setMenuOpen(false);
  };

  return (
    <Menu open={menuOpen} onOpenChange={(_, data) => setMenuOpen(data.open)}>
      <MenuTrigger disableButtonEnhancement>
        <div
          style={{
            position: 'fixed',
            top: anchorPoint.y,
            left: anchorPoint.x,
            zIndex: 1000,
            width: 1,
            height: 1,
          }}
        />
      </MenuTrigger>

      <MenuPopover>
        {type === 'row' ? (
          <MenuList>
            <MenuItem icon={<TbRowInsertTop />} onClick={() => handleInsertRow('above')}>
              Insert Row Above
            </MenuItem>
            <MenuItem icon={<TbRowInsertBottom />} onClick={() => handleInsertRow('below')}>
              Insert Row Below
            </MenuItem>
            <MenuItem icon={<RiDeleteRow />} onClick={handleDeleteRow}>
              Delete Row
            </MenuItem>
          </MenuList>
        ) : (
          <MenuList>
            <MenuItem icon={<TbColumnInsertLeft />} onClick={() => handleInsertColumn('left')}>
              Insert Column Left
            </MenuItem>
            <MenuItem icon={<TbColumnInsertRight />} onClick={() => handleInsertColumn('right')}>
              Insert Column Right
            </MenuItem>
            <MenuItem icon={<RiDeleteColumn />} onClick={handleDeleteColumn}>
              Delete Column
            </MenuItem>
          </MenuList>
        )}
      </MenuPopover>
    </Menu>
  );
};
