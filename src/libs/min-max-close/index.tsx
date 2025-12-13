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
  

  const onHandleMinimize = async () => {
    try {
      await getCurrentWindow().minimize();
    } catch (e) {
      console.warn('Minimize failed:', e);
    }
  };

  const onHandleClose = async () => {
    try {
      await getCurrentWindow().close();
    } catch (e) {
      console.warn('Close failed:', e);
    }
  };

  const onHandleToggleMaximize = async () => {
    try {
      await getCurrentWindow().toggleMaximize();
    } catch (e) {
      console.warn('Toggle maximize failed:', e);
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
      {/* Custom window controls for non-macOS */}
      {!platformIsMac && (
        <>
          <Divider vertical />
          <ul className={classMerge}>
            <li onClick={onHandleMinimize}>
              <Minimize />
            </li>
            <li onClick={onHandleToggleMaximize}>
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
