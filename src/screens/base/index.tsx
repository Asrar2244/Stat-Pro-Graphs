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
import { TestsDropdownPanel } from '../top-menu/tests';
import { GraphsDropdownPanel } from '../top-menu/graphs';
import { HelpDropdownPanel } from '../top-menu/help';
import { SampleSizeModalWrapper } from '../top-menu/sample-size';
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
    helpOpen,
    pinned,
    setPinned,
    toggleTests,
    toggleGraphs,
    toggleHelp,
    closeTests,
    closeGraphs,
    closeHelp,
    closeAllDropdowns,
  } = useDropdownState();

  // Menu selection state management (similar to withMenuEvents)
  const [selectedMenu, setSelectedMenu] = useState<string>('');
  const menuModal = useModal({});
  
  // Sample Size modal state management (persists independently of dropdown panel)
  const [selectedSampleSizeTest, setSelectedSampleSizeTest] = useState<string>('');
  const sampleSizeModal = useModal({});
  
  const setMenuItem = (item: string): void => {
    console.log('setMenuItem called with:', item);
    setSelectedMenu(item);
    menuModal.openModal();
    console.log('Modal opened, selectedMenu:', item);
  };
  
  // Function to open Sample Size modal (called from TestsDropdownPanel)
  const openSampleSizeModal = (test: string) => {
    setSelectedSampleSizeTest(test);
    sampleSizeModal.openModal();
  };
  
  // Function to close Sample Size modal
  const closeSampleSizeModal = () => {
    setSelectedSampleSizeTest('');
    sampleSizeModal.closeModal();
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
  }, [testsOpen, graphsOpen, helpOpen]);

  // Handle clicks outside panels to close unpinned panels
  useEffect(() => {
    if (pinned) return; // Don't add listener if pinned
    
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Don't close if clicking on top menu
      if (target.closest('[data-tauri-drag-region]')) return;
      
      // Don't close if clicking on a modal
      if (target.closest('[role="dialog"]') || target.closest('.fui-DialogSurface')) return;
      
      // Don't close if a modal is being opened (check for modal opening state)
      // This prevents closing the panel when clicking to open a modal
      if (target.closest('[data-opening-modal]')) return;
      
      // Don't close if clicking on search inputs in dropdowns
      if (target.closest('[data-search-input]') || (target.tagName === 'INPUT' && target.closest('.dropdown-content'))) return;
      
      // Don't close if clicking inside any dropdown content (rendered via portal)
      if (target.closest('.dropdown-content')) return;
      
      // Don't close if clicking on dropdown triggers
      if (target.closest('[data-dropdown-trigger]')) return;
      
      // Check if click is outside the panel container
      if (panelRef.current && !panelRef.current.contains(target)) {
        // Close all unpinned panels
        if (testsOpen) closeTests();
        if (graphsOpen) closeGraphs();
        if (helpOpen) closeHelp();
      }
    };

    // Only add listener if any panel is open
    if (testsOpen || graphsOpen || helpOpen) {
      // Use a delay to avoid closing immediately when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleDocumentClick, true);
      }, 300);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleDocumentClick, true);
      };
    }
  }, [testsOpen, graphsOpen, helpOpen, pinned, closeTests, closeGraphs, closeHelp]);

  return (
    <div className={classes.root} ref={bodyRef}>
      <style>{`
        .panel-container {
          position: relative;
          width: 100%;
          overflow: visible;
          flex-shrink: 0;
          z-index: 999;
        }
        .panel-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          opacity: 0;
          transform: translateY(-4px);
          transition: opacity 0.12s cubic-bezier(0.4, 0, 0.2, 1), 
                      transform 0.12s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          max-height: calc(100vh - 42px);
          overflow-y: auto;
        }
        .panel-wrapper.active {
          position: relative;
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .panel-wrapper.exiting {
          opacity: 0;
          transform: translateY(-4px);
        }
      `}</style>
      <SuspenseLoad>
        {modal.open && <OpenDevTools {...modal} showCloseButton={false} />}
        <TopMenu 
          setMenuItem={setMenuItem}
          toggleTests={toggleTests}
          toggleGraphs={toggleGraphs}
          toggleHelp={toggleHelp}
          closeAllDropdowns={closeAllDropdowns}
          testsOpen={testsOpen}
          graphsOpen={graphsOpen}
          helpOpen={helpOpen}
        />
        {/* Dropdown panels positioned between ribbon and workspace */}
        <div 
          ref={panelRef} 
          className="panel-container" 
          style={{ 
            minHeight: testsOpen || graphsOpen || helpOpen ? 'auto' : 0,
            maxHeight: testsOpen || graphsOpen || helpOpen ? 'calc(100vh - 42px)' : 0,
            overflow: testsOpen || graphsOpen || helpOpen ? 'visible' : 'hidden',
            pointerEvents: testsOpen || graphsOpen || helpOpen ? 'auto' : 'none'
          }}
          onClick={(e) => {
            // Prevent clicks on container from closing panels
            e.stopPropagation();
          }}
        >
          <div className={`panel-wrapper ${testsOpen ? 'active' : ''}`}>
            {testsOpen && (
              <TestsDropdownPanel 
                open={testsOpen} 
                onClose={closeTests} 
                setMenuItem={setMenuItem}
                pinned={pinned}
                setPinned={setPinned}
                openSampleSizeModal={openSampleSizeModal}
              />
            )}
          </div>
          <div className={`panel-wrapper ${graphsOpen ? 'active' : ''}`}>
            {graphsOpen && (
              <GraphsDropdownPanel 
                open={graphsOpen} 
                onClose={closeGraphs} 
                setMenuItem={setMenuItem}
                pinned={pinned}
                setPinned={setPinned}
              />
            )}
          </div>
          <div className={`panel-wrapper ${helpOpen ? 'active' : ''}`}>
            {helpOpen && (
              <HelpDropdownPanel 
                open={helpOpen} 
                onClose={closeHelp} 
                setMenuItem={setMenuItem}
                pinned={pinned}
                setPinned={setPinned}
              />
            )}
          </div>
        </div>
        {/* Menu selection modal */}
        {selectedMenu && (
          <MenuSelector 
            modal={menuModal} 
            selector={selectedMenu} 
            translationNs="menus" 
          />
        )}
        {/* Sample Size Modal - rendered at BaseComponent level to persist independently */}
        <SampleSizeModalWrapper 
          open={sampleSizeModal.open}
          selectedTest={selectedSampleSizeTest}
          onClose={closeSampleSizeModal}
        />
        <AppBodyArea />
      </SuspenseLoad>
    </div>
  );
};
