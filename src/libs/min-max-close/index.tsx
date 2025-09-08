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
import { safeTauriCall, isTauriEnvironment } from '@utils/tauri-utils';

const MinMaxCloseComponent: FC = () => {
  const classes = useMinMaxCloseStyles();
  const classMerge = mergeClasses(classes.ul, classes.liCloseMaxMin);
  const platformIsMac = useMemo(() => {
    const platform = platformInfo();
    const isMac = platform === 'mac';
    console.log('Platform Info:', platform, 'Is Mac:', isMac);
    return isMac;
  }, []);
  
  const onHandleMaximize = () => {
    safeTauriCall(
      () => getCurrentWindow().toggleMaximize(),
      async () => { console.log('Development mode: Maximize not available'); }
    );
  };

  const onHandleMinimize = () => {
    safeTauriCall(
      () => getCurrentWindow().minimize(),
      async () => { console.log('Development mode: Minimize not available'); }
    );
  };

  const onHandleClose = () => {
    safeTauriCall(
      () => getCurrentWindow().close(),
      async () => { console.log('Development mode: Close not available'); }
    );
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
{(() => {
        const isTauri = isTauriEnvironment();
        const shouldShow = !platformIsMac && isTauri;
        console.log('Tauri Environment:', isTauri, 'Platform is Mac:', platformIsMac, 'Should show buttons:', shouldShow);
        // Temporarily show buttons always for debugging
        return true; // Change this back to shouldShow after testing
      })() && (
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
