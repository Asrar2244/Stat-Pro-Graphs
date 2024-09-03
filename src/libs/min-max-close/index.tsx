import { getCurrentWindow } from '@tauri-apps/api/window';
import { mergeClasses, Divider } from '@fluentui/react-components';
import { useMinMaxCloseStyles } from './styles-hook/use-min-max-close';
import { FC, memo, useMemo } from 'react';
import { StatusList } from './status-list';
import { ThemeSwitch } from '../theme-switch';
import { Minimize } from './minimize';
import { Maximize } from './maximize';
import { Close } from './close';
import { platformInfo } from '@utils';
const MinMaxCloseComponent: FC = () => {
  const classes = useMinMaxCloseStyles();
  const classMerge = mergeClasses(classes.ul, classes.liCloseMaxMin);
  const platformIsMac = useMemo(() => {
    return platformInfo() === 'mac';
  }, []);
  const onHandleMaximize = () => {
    getCurrentWindow().toggleMaximize();
  };

  const onHandleMinimize = () => {
    getCurrentWindow().minimize();
  };

  const onHandleClose = () => {
    getCurrentWindow().close();
  };
  return (
    <div className={classes.minMaxClose}>
      <ul className={classes.ul}>
        <li>
          <StatusList />
        </li>
        <li>
          <ThemeSwitch />
        </li>
      </ul>
      {!platformIsMac && (
        <>
          <Divider vertical />
          <ul className={classMerge}>
            <li onClick={onHandleMinimize}>
              <Minimize />
            </li>
            <li onClick={onHandleMaximize}>
              <Maximize />
            </li>
            <li data-close-window="true" onClick={onHandleClose}>
              <Close />
            </li>
          </ul>
        </>
      )}
    </div>
  );
};
export const MinMaxClose = memo(MinMaxCloseComponent);
