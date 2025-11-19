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
    
    // Set a default license state immediately so the app can function
    setLicenseState({ state: '30Days', type: 'unknown' });
    
    // Make this non-blocking - don't wait for backend response to show the app
    let hasLoggedTimeout = false;
    const attemptLicenseCheck = () => {
      // Add a race condition with timeout
      const licensePromise = getSystemData();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('LICENSE_CHECK_TIMEOUT')), 5000)
      );

      Promise.race([licensePromise, timeoutPromise])
        .then((res: any) => {
          hasLoggedTimeout = false; // Reset on success
          if (process.env.NODE_ENV === 'development') {
            console.log('License check successful:', res);
          }
          setLicenseState({ state: '30Days', type: res.msg });
          if (res.msg === 'expired') modal.openModal();
        })
        .catch((err) => {
          // Only log timeouts once to reduce console noise, but always log actual errors
          const isTimeout = err?.message === 'LICENSE_CHECK_TIMEOUT';
          if (!isTimeout || !hasLoggedTimeout) {
            if (isTimeout) {
              hasLoggedTimeout = true;
              if (process.env.NODE_ENV === 'development') {
                console.log('License check timed out (non-blocking, using default state)');
              }
            } else {
              console.error('License check failed:', err);
            }
          }
          // Keep the default state we already set
        });
    };

    // Try once immediately, then set up interval for retries
    attemptLicenseCheck();
    
    const intervalCounter = setInterval(() => {
      attemptLicenseCheck();
    }, 60000); // Check every 60 seconds instead of 30

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
