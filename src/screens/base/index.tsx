import { FC, useEffect, lazy, useRef, KeyboardEvent, useState } from 'react';
import { SuspenseLoad } from '@libs';
import { useTheme, useGetInitialConfig, useNodeActions, useLicense, useModal } from '@hooks';
import { useLicenseStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { logger } from '@utils/logger';
import { useDropdownState } from '../top-menu/use-dropdown-state';
import { TopMenu } from '../top-menu';
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
  const { checkLicense } = useLicense();
  const { setLicenseState } = useLicenseStore(
    useShallow((state) => ({ setLicenseState: state.setLicenseState })),
  );
  const modal = useModal({});
  const licenseCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSuccessfulCheckRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0);
  const MAX_RETRIES = 10;

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

  // Selected menu item trigger (handles analysis/test modals via executers)
  const [selectedMenu, setSelectedMenu] = useState<string>('');
  const menuModal = useModal({});

  // Sample Size modal state management (persists independently of dropdown panel)
  const [selectedSampleSizeTest, setSelectedSampleSizeTest] = useState<string>('');
  const sampleSizeModal = useModal({});

  const setMenuItem = (item: string): void => {
    setSelectedMenu(item);
    menuModal.openModal();
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
    setLicenseState({
      state: 'lookingProductLicense',
      type: 'unknown',
      daysRemaining: null,
      displayText: 'lookingProductLicense',
    });

    // Constants for time calculations
    const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds

    // Helper function to extract expiry date from response
    const extractExpiryDate = (res: any): Date | null => {
      let expiryDate: Date | null = null;

      if (res.expiryDate) {
        expiryDate = new Date(res.expiryDate);
      } else if (res.expiry_date) {
        expiryDate = new Date(res.expiry_date);
      } else if (res.expiresAt) {
        expiryDate = new Date(res.expiresAt);
      } else if (res.expires_on) {
        expiryDate = new Date(res.expires_on);
      } else if (res.expiryTime) {
        expiryDate = new Date(res.expiryTime);
      } else if (res.expiry_time) {
        expiryDate = new Date(res.expiry_time);
      } else if (res.lic_expiry_days) {
        // If expiry is given in days from now, calculate the date
        const daysUntilExpiry = parseInt(res.lic_expiry_days, 10);
        if (!isNaN(daysUntilExpiry)) {
          expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);
        }
      }

      if (!expiryDate || isNaN(expiryDate.getTime())) {
        return null;
      }

      return expiryDate;
    };

    // Helper function to calculate days remaining and determine license state
    const calculateLicenseState = (res: any): { state: string; daysRemaining: number | null; displayText: string } => {
      const expiryDate = extractExpiryDate(res);

      // Check if license type indicates lifetime
      if (res.msg === 'lifetime' || res.licenseType === 'lifetime' || res.license_type === 'lifetime') {
        return {
          state: 'lifetime',
          daysRemaining: null,
          displayText: 'lifetime',
        };
      }

      // If no expiry date found, assume no valid license
      if (!expiryDate) {
        return {
          state: 'expired',
          daysRemaining: null,
          displayText: 'noValidLicense',
        };
      }

      const now = new Date();
      const timeUntilExpiry = expiryDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeUntilExpiry / (24 * 60 * 60 * 1000));

      // If already expired
      if (daysRemaining <= 0) {
        return {
          state: 'expired',
          daysRemaining: 0,
          displayText: 'expired',
        };
      }

      // Return trial license with days remaining
      return {
        state: '30Days',
        daysRemaining: daysRemaining,
        displayText: 'daysRemaining',
      };
    };

    // Helper function to calculate next check interval based on expiry time
    const calculateNextCheckInterval = (res: any): number | null => {
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const SIXTY_SECONDS = 60 * 1000; // 60 seconds in milliseconds (minimum check interval)

      const expiryDate = extractExpiryDate(res);

      // If no expiry date found, return null to indicate license not active
      if (!expiryDate) {
        logger.error('License expiry date not found. Assuming license is not active.');
        return null;
      }

      const now = new Date();
      const timeUntilExpiry = expiryDate.getTime() - now.getTime();

      // If already expired, check in 1 hour
      if (timeUntilExpiry <= 0) {
        return ONE_HOUR;
      }

      // If expiry is more than 24 hours away, check every 24 hours
      if (timeUntilExpiry > TWENTY_FOUR_HOURS) {
        return TWENTY_FOUR_HOURS;
      }

      // If expiry is less than 24 hours away, check at expiry time
      // Minimum interval of 60 seconds
      return Math.max(timeUntilExpiry, SIXTY_SECONDS);
    };

    // Make this non-blocking - don't wait for backend response to show the app
    let hasLoggedTimeout = false;
    const attemptLicenseCheck = () => {
      // Add a race condition with timeout
      const licensePromise = checkLicense();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('LICENSE_CHECK_TIMEOUT')), 5000)
      );

      Promise.race([licensePromise, timeoutPromise])
        .then((res: any) => {
          hasLoggedTimeout = false; // Reset on success
          retryCountRef.current = 0; // Reset retry count on success

          if (process.env.NODE_ENV === 'development') {
            logger.info('License check successful: ' + JSON.stringify(res));
          }

          // Calculate license state and days remaining
          const licenseInfo = calculateLicenseState(res);
          setLicenseState({
            state: licenseInfo.state as '30Days' | 'lifetime' | 'expired' | 'lookingProductLicense',
            type: res.msg,
            daysRemaining: licenseInfo.daysRemaining,
            displayText: licenseInfo.displayText,
          });

          if (res.msg === 'expired' || licenseInfo.state === 'expired') {
            modal.openModal();
          }

          // Clear any retry timeout
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
          }

          // Calculate next check interval based on expiry time
          logger.info('NOOR res in set: ' + JSON.stringify(res));
          const nextInterval = calculateNextCheckInterval(res);

          // If no expiry date found, assume license is not active
          if (nextInterval === null) {
            setLicenseState({
              state: 'expired',
              type: 'not_active',
              daysRemaining: null,
              displayText: 'noValidLicense',
            });
            modal.openModal();

            // Clear any existing interval
            if (licenseCheckIntervalRef.current) {
              clearInterval(licenseCheckIntervalRef.current);
            }

            // Check again in 1 hour to see if license becomes active
            licenseCheckIntervalRef.current = setInterval(() => {
              attemptLicenseCheck();
            }, ONE_HOUR);

            if (process.env.NODE_ENV === 'development') {
              logger.info('License expiry date not found. License assumed not active. Will check again in 1 hour.');
            }
            return;
          }

          // Clear any existing interval
          if (licenseCheckIntervalRef.current) {
            clearInterval(licenseCheckIntervalRef.current);
          }

          // Set up interval for next check
          licenseCheckIntervalRef.current = setInterval(() => {
            attemptLicenseCheck();
          }, nextInterval);

          if (process.env.NODE_ENV === 'development') {
            const hours = (nextInterval / (60 * 60 * 1000)).toFixed(2);
            logger.info(`Next license check scheduled in ${hours} hours (${nextInterval}ms)`);
          }

          // Mark as successfully checked
          if (!hasSuccessfulCheckRef.current) {
            hasSuccessfulCheckRef.current = true;
            if (process.env.NODE_ENV === 'development') {
              logger.info('Initial license check successful. Switching to expiry-based schedule.');
            }
          }
        })
        .catch((err) => {
          // Only log timeouts once to reduce console noise, but always log actual errors
          const isTimeout = err?.message === 'LICENSE_CHECK_TIMEOUT';
          if (!isTimeout || !hasLoggedTimeout) {
            if (isTimeout) {
              hasLoggedTimeout = true;
              if (process.env.NODE_ENV === 'development') {
                logger.info('License check timed out (non-blocking, using default state)');
              }
            } else {
              logger.error('License check failed: ' + JSON.stringify(err));
            }
          }

          // Only retry if we haven't had a successful check yet
          if (!hasSuccessfulCheckRef.current) {
            retryCountRef.current += 1;

            if (process.env.NODE_ENV === 'development') {
              logger.info(`License check failed. Retry attempt ${retryCountRef.current}/${MAX_RETRIES}`);
            }

            // If we've exceeded max retries, set error and close application
            if (retryCountRef.current >= MAX_RETRIES) {
              logger.error(`License check failed after ${MAX_RETRIES} retries. Opening license modal.`);
              setLicenseState({
                state: 'expired',
                type: 'error',
                daysRemaining: null,
                displayText: 'noValidLicense',
              });

              // Open the modal instead of closing the application
              modal.openModal();
              return;
            }

            // Retry after 60 seconds
            retryTimeoutRef.current = setTimeout(() => {
              attemptLicenseCheck();
            }, 60000);
          }
        });
    };

    // Try once immediately
    attemptLicenseCheck();

    return () => {
      body?.removeEventListener('keydown', handleKeyDown);
      if (licenseCheckIntervalRef.current) {
        clearInterval(licenseCheckIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);
  // Dynamically set ribbon offset = 42px (ribbon) + measured open panel height
  useEffect(() => {
    const rootEl = (bodyRef.current as unknown as HTMLElement) ?? undefined;
    if (!rootEl) return;
    const setOffset = () => {
      // Only add panel height to offset if it's pinned
      const panelHeight = (panelRef.current && pinned) ? panelRef.current.offsetHeight : 0;
      rootEl.style.setProperty('--ribbon-offset', `${42 + panelHeight}px`);
    };
    setOffset();
    const ResizeObs = (window as any).ResizeObserver;
    const ro = ResizeObs ? new ResizeObs(() => setOffset()) : undefined;
    if (ro && panelRef.current) ro.observe(panelRef.current);
    return () => {
      if (ro && panelRef.current) ro.unobserve(panelRef.current);
    };
  }, [testsOpen, graphsOpen, helpOpen, pinned]);

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
        closeAllDropdowns();
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
  }, [testsOpen, graphsOpen, helpOpen, pinned, closeAllDropdowns]);

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
        .panel-wrapper.active.pinned {
          position: relative;
        }
        .panel-wrapper.active {
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
      </SuspenseLoad>
      <SuspenseLoad>
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
          <div className={`panel-wrapper ${testsOpen ? 'active' : ''} ${pinned ? 'pinned' : ''}`}>
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
          <div className={`panel-wrapper ${graphsOpen ? 'active' : ''} ${pinned ? 'pinned' : ''}`}>
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
          <div className={`panel-wrapper ${helpOpen ? 'active' : ''} ${pinned ? 'pinned' : ''}`}>
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
        {/* Menu selection modals are handled internally by TopMenu's withMenuEvents HOC for better isolation */}
        {/* Sample Size Modal - rendered at BaseComponent level to persist independently */}
        <SampleSizeModalWrapper
          open={sampleSizeModal.open}
          selectedTest={selectedSampleSizeTest}
          onClose={closeSampleSizeModal}
        />
        {selectedMenu && (
          <MenuSelector modal={menuModal} selector={selectedMenu} translationNs={'menus'} />
        )}
        <AppBodyArea />
      </SuspenseLoad>
    </div>
  );
};
