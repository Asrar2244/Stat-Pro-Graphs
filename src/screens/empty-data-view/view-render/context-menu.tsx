import { Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from '@fluentui/react-components';
import { IUseContextMenu } from './hooks/use-context-menu';
import { FC } from 'react';
import {
  TbRowInsertBottom,
  TbRowInsertTop,
  TbColumnInsertLeft,
  TbColumnInsertRight,
} from 'react-icons/tb';
import { RiDeleteRow, RiDeleteColumn } from 'react-icons/ri';

export const ContextMenuComponent: FC<IUseContextMenu> = ({
  menuOpen,
  setMenuOpen,
  anchorPoint,
  clickedHeader,
  type,
}) => {
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
            <MenuItem
              icon={<TbRowInsertTop />}
              onClick={() => alert(`Sort ${clickedHeader} Ascending`)}
            >
              Insert Row Above
            </MenuItem>
            <MenuItem
              icon={<TbRowInsertBottom />}
              onClick={() => alert(`Sort ${clickedHeader} Ascending`)}
            >
              Insert Row Below
            </MenuItem>
            <MenuItem
              icon={<RiDeleteRow />}
              onClick={() => alert(`Sort ${clickedHeader} Ascending`)}
            >
              Delete Row
            </MenuItem>
          </MenuList>
        ) : (
          <MenuList>
            <MenuItem
              icon={<TbColumnInsertLeft />}
              onClick={() => alert(`Sort ${clickedHeader} Ascending`)}
            >
              Insert Column Left
            </MenuItem>
            <MenuItem
              icon={<TbColumnInsertRight />}
              onClick={() => alert(`Sort ${clickedHeader} Ascending`)}
            >
              Insert Column Right
            </MenuItem>
            <MenuItem
              icon={<RiDeleteColumn />}
              onClick={() => alert(`Sort ${clickedHeader} Ascending`)}
            >
              Delete Column
            </MenuItem>
          </MenuList>
        )}
      </MenuPopover>
    </Menu>
  );
};
