import { FC, useEffect, lazy } from 'react';
import { SuspenseLoad } from '@libs';
import { useTheme, useGetInitialConfig } from '@hooks';
const TopMenu = lazy(() => import('../top-menu').then((modules) => ({ default: modules.TopMenu })));
const AppBodyArea = lazy(() =>
  import('./app-body-area').then((modules) => ({ default: modules.AppBodyArea })),
);
import { useLayout } from './styles-hook/use-layout-style';

export const BaseComponent: FC = () => {
  const classes = useLayout();
  useTheme();
  const { getConfigurations } = useGetInitialConfig();
  useEffect(() => {
    getConfigurations();
  }, []);
  return (
    <div className={classes.root}>
      <SuspenseLoad>
        <TopMenu />
        <AppBodyArea />
      </SuspenseLoad>
    </div>
  );
};
