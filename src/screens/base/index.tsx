import { FC, useEffect, lazy, useRef, KeyboardEvent } from 'react';
import { SuspenseLoad } from '@libs';
import { useTheme, useGetInitialConfig, useNodeActions, useLicense, useModal } from '@hooks';
import { useLicenseStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
const TopMenu = lazy(() => import('../top-menu').then((modules) => ({ default: modules.TopMenu })));
const AppBodyArea = lazy(() =>
  import('./app-body-area').then((modules) => ({ default: modules.AppBodyArea })),
);
import { useLayout } from './styles-hook/use-layout-style';
const OpenDevTools = lazy(() =>
  import('../top-menu/open-dev-tools').then((module) => ({ default: module.OpenDevTools })),
);
export const BaseComponent: FC = () => {
  const classes = useLayout();
  const { closeActiveTab } = useNodeActions();
  const bodyRef = useRef(null);
  useTheme();
  const { getConfigurations } = useGetInitialConfig();
  const { getSystemData } = useLicense();
  const { setLicenseState } = useLicenseStore(
    useShallow((state) => ({ setLicenseState: state.setLicenseState })),
  );
  const modal = useModal({});
  useEffect(() => {
    getConfigurations();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'w') {
        event.preventDefault();
        closeActiveTab();
      }
    };
    const body: any = bodyRef?.current;
    body?.addEventListener('keydown', handleKeyDown);
    setLicenseState({ state: 'lookingProductLicense' });
    //TODO: This has to change when backend starts.
    const intervalCounter = setInterval(() => {
      getSystemData()
        .then((res) => {
          clearInterval(intervalCounter);
          console.log('res 30Days hardcoded===', res);
          //TODO: Hardcoded remove it
          setLicenseState({ state: '30Days', type: res.msg });
          //TODO: popup license based on license status
          if (res.msg === 'expired') modal.openModal();
        })
        .catch((err) => {
          console.log('err===', err);
        });
    }, 10000);

    return () => {
      body?.removeEventListener('keydown', handleKeyDown);
      clearInterval(intervalCounter);
    };
  }, []);
  return (
    <div className={classes.root} ref={bodyRef}>
      <SuspenseLoad>
        {modal.open && <OpenDevTools {...modal} showCloseButton={false} />}
        <TopMenu />
        <AppBodyArea />
      </SuspenseLoad>
    </div>
  );
};
