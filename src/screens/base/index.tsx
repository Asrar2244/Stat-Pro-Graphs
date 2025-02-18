import { FC, useEffect, lazy, useRef, KeyboardEvent } from 'react';
import { SuspenseLoad } from '@libs';
import { useTheme, useGetInitialConfig, useNodeActions } from '@hooks';
const TopMenu = lazy(() => import('../top-menu').then((modules) => ({ default: modules.TopMenu })));
const AppBodyArea = lazy(() =>
  import('./app-body-area').then((modules) => ({ default: modules.AppBodyArea })),
);
import { useLayout } from './styles-hook/use-layout-style';

export const BaseComponent: FC = () => {
  const classes = useLayout();
  const { closeActiveTab } = useNodeActions()
  const bodyRef = useRef(null)
  useTheme();
  const { getConfigurations } = useGetInitialConfig();
  useEffect(() => {
    getConfigurations();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "w") {
        event.preventDefault();
        closeActiveTab();
      }
    }
    const body: any = bodyRef?.current;
    body?.addEventListener("keydown", handleKeyDown);

    return () => body?.removeEventListener("keydown", handleKeyDown);
  }, []);
  return (
    <div className={classes.root} ref={bodyRef} >
      <SuspenseLoad>
        <TopMenu />
        <AppBodyArea />
      </SuspenseLoad>
    </div>
  );
};
