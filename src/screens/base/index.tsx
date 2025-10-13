import { FC, useEffect, lazy, useRef, KeyboardEvent, useState } from 'react';
import { SuspenseLoad } from '@libs';
import { useTheme, useGetInitialConfig, useNodeActions, useLicense, useModal } from '@hooks';
import { useLicenseStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { useDropdownState } from '../top-menu/use-dropdown-state';
const TopMenu = lazy(() => import('../top-menu').then((modules) => ({ default: modules.TopMenu })));
const AppBodyArea = lazy(() =>
  import('./app-body-area').then((modules) => ({ default: modules.AppBodyArea })),
);
const TestsDropdownPanel = lazy(() => 
  import('../top-menu/tests').then((modules) => ({ default: modules.TestsDropdownPanel })),
);
const GraphsDropdownPanel = lazy(() => 
  import('../top-menu/graphs').then((modules) => ({ default: modules.GraphsDropdownPanel })),
);
import { useLayout } from './styles-hook/use-layout-style';
const OpenDevTools = lazy(() =>
  import('../top-menu/open-dev-tools').then((module) => ({ default: module.OpenDevTools })),
);
const MenuSelector = lazy(() =>
  import('../top-menu/executer').then(({ MenuSelector }) => ({ default: MenuSelector })),
);
export const BaseComponent: FC = () => {
  const classes = useLayout();
  const { closeActiveTab } = useNodeActions();
  const bodyRef = useRef(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  useTheme();
  const { getConfigurations } = useGetInitialConfig();
  const { getSystemData } = useLicense();
  const { setLicenseState } = useLicenseStore(
    useShallow((state) => ({ setLicenseState: state.setLicenseState })),
  );
  const modal = useModal({});
  
  // Dropdown state management
  const {
    testsOpen,
    graphsOpen,
    toggleTests,
    toggleGraphs,
    closeTests,
    closeGraphs,
    closeAllDropdowns,
  } = useDropdownState();

  // Menu selection state management (similar to withMenuEvents)
  const [selectedMenu, setSelectedMenu] = useState<string>('');
  const menuModal = useModal({});
  
  const setMenuItem = (item: string): void => {
    setSelectedMenu(item);
    menuModal.openModal();
  };
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
    const attemptLicenseCheck = () => {
      // Skip license check in production if no API is configured
      if (!import.meta.env.VITE_API) {
        console.log('No API configured, skipping license check');
        setLicenseState({ state: '30Days', type: 'xa' });
        return;
      }

      // Add a race condition with timeout
      const licensePromise = getSystemData();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('License check timeout')), 5000)
      );

      Promise.race([licensePromise, timeoutPromise])
        .then((res: any) => {
          console.log('License check successful:', res);
          setLicenseState({ state: '30Days', type: res.msg });
          if (res.msg === 'expired') modal.openModal();
        })
        .catch((err) => {
          console.log('License check failed or timed out, continuing with default state:', err);
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
  // Dynamically set ribbon offset = 42px (ribbon) + measured open panel height
  useEffect(() => {
    const rootEl = (bodyRef.current as unknown as HTMLElement) ?? undefined;
    if (!rootEl) return;
    const setOffset = () => {
      const panelHeight = panelRef.current ? panelRef.current.offsetHeight : 0;
      rootEl.style.setProperty('--ribbon-offset', `${42 + panelHeight}px`);
    };
    setOffset();
    const ResizeObs = (window as any).ResizeObserver;
    const ro = ResizeObs ? new ResizeObs(() => setOffset()) : undefined;
    if (ro && panelRef.current) ro.observe(panelRef.current);
    return () => {
      if (ro && panelRef.current) ro.unobserve(panelRef.current);
    };
  }, [testsOpen, graphsOpen]);

  return (
    <div className={classes.root} ref={bodyRef}>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 400px;
          }
        }
      `}</style>
      <SuspenseLoad>
        {modal.open && <OpenDevTools {...modal} showCloseButton={false} />}
        <TopMenu 
          setMenuItem={setMenuItem}
          toggleTests={toggleTests}
          toggleGraphs={toggleGraphs}
          closeAllDropdowns={closeAllDropdowns}
        />
        {/* Dropdown panels positioned between ribbon and workspace */}
        <div ref={panelRef} style={{ 
          width: '100%', 
          overflow: 'hidden'
        }}>
          {testsOpen && (
            <div style={{
              animation: 'slideDown 0.3s ease-out'
            }}>
              <TestsDropdownPanel 
                open={testsOpen} 
                onClose={closeTests} 
                setMenuItem={setMenuItem} 
              />
            </div>
          )}
          {graphsOpen && (
            <div style={{
              animation: 'slideDown 0.3s ease-out'
            }}>
              <GraphsDropdownPanel 
                open={graphsOpen} 
                onClose={closeGraphs} 
                setMenuItem={setMenuItem} 
              />
            </div>
          )}
        </div>
        {/* Menu selection modal */}
        {selectedMenu && (
          <MenuSelector 
            modal={menuModal} 
            selector={selectedMenu} 
            translationNs="menus" 
          />
        )}
        <AppBodyArea />
      </SuspenseLoad>
    </div>
  );
};
