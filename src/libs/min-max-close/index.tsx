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
// import { isTauriEnvironment } from '@utils/tauri-utils';

const MinMaxCloseComponent: FC = () => {
  const classes = useMinMaxCloseStyles();
  const classMerge = mergeClasses(classes.ul, classes.liCloseMaxMin);
  const platformIsMac = useMemo(() => {
    const platform = platformInfo();
    const isMac = platform === 'mac';
    return isMac;
  }, []);
  
  const onHandleMaximize = async () => {
    try {
      await getCurrentWindow().toggleMaximize();
    } catch (err) {
      console.warn('Maximize not available in this environment', err);
    }
  };

  const onHandleMinimize = async () => {
    try {
      await getCurrentWindow().minimize();
    } catch (err) {
      console.warn('Minimize not available in this environment', err);
    }
  };

  const onHandleClose = async () => {
    try {
      await getCurrentWindow().close();
    } catch (err) {
      console.warn('Close not available in this environment', err);
    }
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
      {(!platformIsMac) && (
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
