import {
  Menu,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MenuItem,
  Text,
  MenuDivider,
} from '@fluentui/react-components';
import { FC, Fragment, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { topMenuConfig, IMenuItem } from './configuration';
import { withMenuEvents } from './executer';
import { useMenuCodeExecutor } from '@hooks';
import * as VscIcons from 'react-icons/vsc';
const CommonMessages = lazy(() =>
  import('@libs').then(({ CommonMessages }) => ({ default: CommonMessages })),
);
const MinMaxClose = lazy(() =>
  import('@libs').then(({ MinMaxClose }) => ({ default: MinMaxClose })),
);
import { useMenuLayout } from './styles-hook/use-status-list-style';
interface DynamicIconProps {
  iconName?: string;
  size?: number;
  color?: string;
}
const GetDynamicIcon: FC<DynamicIconProps> = ({ iconName, size, color }) => {
  if (!iconName) {
    return null;
  }
  const IconComponent = (VscIcons as Record<string, FC<{ size?: number; color?: string }>>)[
    iconName
  ];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent size={size} color={color} />;
};

const CreateSubMenu: FC<{ menu: IMenuItem; translateNs: string }> = ({
  menu,
  translateNs,
  ...props
}) => {
  const classes = useMenuLayout();
  const { t } = useTranslation(['menus']);
  const codeExecuter = useMenuCodeExecutor();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  // eslint-disable-next-line react/prop-types
  const { setMenuItem } = props;

  const onSelectMenu = (item: IMenuItem) => () => {
    if (item.execute) {
      setMenuItem(item.execute);
    } else if (item.codeExecute) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      if (codeExecuter[item.codeExecute]) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        codeExecuter[item.codeExecute]({ id: item.id, isEmptyDataView: item.isEmptyDataView });
      }
      // openNewTabForGraph({ id: menu.id });
    }
  };
  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <MenuItem
          onClick={onSelectMenu(menu)}
          {...(menu.icon ? { icon: <GetDynamicIcon iconName={menu.icon} /> } : {})}
        >
          <Text font="numeric" className={classes.menuText}>
            {t(menu.label, { ns: translateNs })}
          </Text>
        </MenuItem>
      </MenuTrigger>
      <MenuPopover>
        <MenuList className={classes.menuItems}>
          {menu.submenu?.map((item: IMenuItem) => {
            const hasSubMenu = item.submenu;
            const icon = item.icon ? { icon: <GetDynamicIcon iconName={item.icon} /> } : {};
            if (!hasSubMenu) {
              return (
                <Fragment key={item.id}>
                  <MenuItem key={item.id} onClick={onSelectMenu(item)} {...icon}>
                    <Text font="numeric" className={classes.menuText}>
                      {t(item.label, { ns: translateNs })}
                    </Text>
                  </MenuItem>
                  <MenuDivider />
                </Fragment>
              );
            } else {
              return (
                <Fragment key={item.id}>
                  <CreateSubMenu key={item.id} menu={item} translateNs={translateNs} {...props} />
                  <MenuDivider />
                </Fragment>
              );
            }
          })}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};
const TopMenus: FC = (props) => {
  const classes = useMenuLayout();
  const { t } = useTranslation(['menus']);
  const { menus, translateNs } = topMenuConfig;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { setMenuItem } = props;
  const codeExecuter = useMenuCodeExecutor();
  const onSelectMenu = (item: IMenuItem) => () => {
    if (item.execute) {
      setMenuItem(item.execute);
    } else if (item.codeExecute) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      if (codeExecuter[item.codeExecute]) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        codeExecuter[item.codeExecute]({ id: item.id });
      }
      // openNewTabForGraph({ id: item.id });
    }
  };
  return (
    <div data-tauri-drag-region className={classes.wrapper}>
      <div className={classes.layout}>
        {menus.map((menu: IMenuItem) => (
          <Menu key={menu.id}>
            <MenuTrigger disableButtonEnhancement>
              <Text font="numeric" className={classes.menuText}>
                {t(menu.label, { ns: translateNs })}
              </Text>
            </MenuTrigger>
            {menu.submenu ? (
              <MenuPopover>
                <MenuList>
                  {menu.submenu.map((item: IMenuItem) => {
                    const hasSubMenu = item.submenu;
                    const icon = item.icon ? { icon: <GetDynamicIcon iconName={item.icon} /> } : {};
                    if (!hasSubMenu) {
                      return (
                        <Fragment key={item.id}>
                          <MenuItem
                            key={item.id}
                            className={classes.menuItems}
                            onClick={onSelectMenu(item)}
                            {...icon}
                          >
                            <Text className={classes.menuText}>
                              {t(item.label, { ns: translateNs })}
                            </Text>
                          </MenuItem>
                          <MenuDivider />
                        </Fragment>
                      );
                    } else {
                      return (
                        <Fragment key={item.id}>
                          <CreateSubMenu
                            key={item.id}
                            menu={item}
                            translateNs={translateNs}
                            {...props}
                          />
                          <MenuDivider />
                        </Fragment>
                      );
                    }
                  })}
                </MenuList>
              </MenuPopover>
            ) : (
              <></>
            )}
          </Menu>
        ))}
      </div>
      <div className={classes.tools}>
        <CommonMessages />
        <MinMaxClose />
      </div>
      {/* {window.electron.process.platform !== 'darwin' && <div className={classes.nonDarwin}></div>} */}
    </div>
  );
};

export const TopMenu = withMenuEvents(topMenuConfig.translateNs, TopMenus);
