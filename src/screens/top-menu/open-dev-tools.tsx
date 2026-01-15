import React, { FC, useEffect, useState } from 'react';
import {
  Caption1,
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
  Body1,
  Link,
  Body1Stronger,
  Button,
  Text,
  Tooltip,
} from '@fluentui/react-components';
import { Modal } from '@libs';
import { IModal, useLicense } from '@hooks';
import { app } from '@tauri-apps/api';
import { useOpenDevToolsLayout } from './styles-hook/use-open-dev-tools-style';
import logo from '../../assets/Square44x44Logo.png';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useLicenseStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { VscCopy, VscMailRead } from 'react-icons/vsc';
import { IoLogoGoogle } from 'react-icons/io5';
import { logger } from '@utils/logger';

// Note: localStorage persists across app uninstalls/reinstalls in Tauri apps
// because it's stored in the browser's app data directory.
// We should always verify license status against the backend (licenseStatus.state),
// not just rely on localStorage flags.
const SYSTEM_TOKEN_STORAGE_KEY = 'statpro_system_token';
const LICENSE_KEY_STORAGE_KEY = 'statpro_license_key';
const LICENSE_ACTIVATED_STATUS_KEY = 'statpro_license_activated';

export const OpenDevTools: FC<IModal & { showCloseButton?: boolean }> = ({
  showCloseButton = true,
  ...modal
}) => {
  const [version, setVersion] = useState('');
  const [status, setStatus] = useState<
    'fetch' | 'verifying' | 'activating' | 'notValid' | 'activated' | undefined
  >(undefined);
  // Load system token from localStorage on mount
  const [systemToken, setSystemToken] = useState<string>(() => {
    try {
      return localStorage.getItem(SYSTEM_TOKEN_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const classes = useOpenDevToolsLayout();
  const { t } = useTranslation('common');
  const { applyLicense, getSystemData } = useLicense();

  const { licenseStatus } = useLicenseStore(
    useShallow((state) => ({
      licenseStatus: state.licenseStatus,
      setLicenseState: state.setLicenseState,
    })),
  );
  // Load license key from localStorage if license is active
  const [licenseKey, setLicenseKey] = useState('');

  // Initialize version on mount
  useEffect(() => {
    app.getVersion().then((version) => {
      setVersion(version);
    });
  }, []);

  // Load persisted data when modal opens
  useEffect(() => {
    if (modal.open) {
      // Always load system token from localStorage if it exists
      try {
        const savedToken = localStorage.getItem(SYSTEM_TOKEN_STORAGE_KEY);
        if (savedToken) {
          setSystemToken(savedToken);
        }
      } catch {
        // Ignore localStorage errors
      }

      // Always load license key from localStorage if it exists (regardless of activation status)
      try {
        const savedLicenseKey = localStorage.getItem(LICENSE_KEY_STORAGE_KEY);
        if (savedLicenseKey) {
          setLicenseKey(savedLicenseKey);
        }
      } catch {
        // Ignore localStorage errors
      }

      // Check if license is actually active based on licenseStatus.state (not localStorage flag)
      const licenseState = licenseStatus.state;
      const isActuallyActive = licenseState === '30Days' || licenseState === 'lifetime';

      // Set status based on actual license state, not localStorage flag
      if (isActuallyActive) {
        setStatus('activated');
      } else {
        // Check localStorage flag as fallback (for cases where license was just activated but store not updated yet)
        const savedActivatedStatus = localStorage.getItem(LICENSE_ACTIVATED_STATUS_KEY);
        if (savedActivatedStatus === 'true') {
          setStatus('activated');
        } else {
          setStatus(undefined);
        }
      }
    }
  }, [modal.open, licenseStatus.state]);
  const onHandleExitApp = () => {
    getCurrentWindow().close();
  };
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Don't allow changes if license is already active
    const licenseState = licenseStatus.state;
    const hasLicenseKey = licenseKey.trim().length > 0;
    const isActive = (licenseState === '30Days' || licenseState === 'lifetime' || status === 'activated') && hasLicenseKey;
    if (isActive) {
      e.preventDefault();
      return;
    }
    const upperCasedValue = e.target.value;
    setLicenseKey(upperCasedValue);
  };
  const onClickActivate = () => {
    setStatus('activating');
    applyLicense({ license_key: licenseKey }).then((res) => {
      if (!res.license_applied) {
        setStatus('notValid');
        return;
      }
      setStatus('activated');
      // Save license key and activation status to localStorage
      try {
        localStorage.setItem(LICENSE_KEY_STORAGE_KEY, licenseKey);
        localStorage.setItem(LICENSE_ACTIVATED_STATUS_KEY, 'true');
      } catch (error) {
        logger.error('Error saving license key to localStorage: ' + error);
      }
    });
  };
  const onClickGetToken = () => {
    setStatus('fetch');
    getSystemData()
      .then((res) => {
        logger.info('NOOR res: ' + JSON.stringify(res));
        // Display the msg field from the response
        const msgValue = res.msg || res.message || '';
        setSystemToken(msgValue);
        // Save system token to localStorage for persistence
        try {
          localStorage.setItem(SYSTEM_TOKEN_STORAGE_KEY, msgValue);
        } catch (error) {
          logger.error('Error saving system token to localStorage: ' + error);
        }

        if (process.env.NODE_ENV === 'development') {
          logger.info('System token response msg: ' + msgValue);
        }
      })
      .catch((error) => {
        logger.error('Error fetching system data: ' + JSON.stringify(error));
        // Display error message if available
        const errorMsg = error?.response?.data?.msg || error?.message || 'Error fetching system token';
        setSystemToken(errorMsg);
        // Don't save error messages to localStorage

      })
      .finally(() => {
        logger.info('NOOR finally');
        setStatus(undefined);
      });
  };
  const copyToClipboard = async () => {
    logger.info('NOOR copyToClipboard value of systemToken: ' + systemToken);
    await navigator.clipboard.writeText(`
      mail id: support@statpro.in \n
      token: ${systemToken}`);
  };
  const sendViaConfiguredMail = () => {
    if (!systemToken) return;
    const mailBody = encodeURIComponent(`System Token:\n${systemToken}`);
    const mailtoLink = `mailto:support@statpro.in?subject=${encodeURIComponent('System Token Request')}&body=${mailBody}`;
    // Create a temporary anchor element and click it to open mail client
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const sendViaGoogleMail = () => {
    if (!systemToken) return;
    const mailBody = encodeURIComponent(`System Token:\n${systemToken}`);
    // Gmail compose URL format
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=support@statpro.org&su=${encodeURIComponent('System Token Request')}&body=${mailBody}`;
    // Use window.open as fallback, but create anchor element first to avoid popup blockers
    const link = document.createElement('a');
    link.href = gmailLink;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    // Clean up after a short delay
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 100);
  };

  // Helper function to check if license is active
  const isLicenseActive = (): boolean => {
    const state = licenseStatus.state;
    // License is active if state is '30Days' or 'lifetime'
    if (state === '30Days' || state === 'lifetime') {
      return true;
    }

    // Also check if license was just activated (status === 'activated') AND we have a license key
    const hasLicenseKey = licenseKey.trim().length > 0;
    return status === 'activated' && hasLicenseKey;
  };

  // Helper function to get license display text
  const getLicenseDisplayText = (): string => {
    if (!licenseStatus.state) {
      return t('lookingProductLicense', { ns: 'common' });
    }

    // Use displayText if available (computed from license check)
    if (licenseStatus.displayText) {
      if (licenseStatus.displayText === 'lifetime') {
        return t('lifetime', { ns: 'common' });
      }
      if (licenseStatus.displayText === 'expired') {
        return t('expired', { ns: 'common' });
      }
      if (licenseStatus.displayText === 'noValidLicense') {
        return t('noValidLicense', { ns: 'common' });
      }
      if (licenseStatus.displayText === 'lookingProductLicense') {
        return t('lookingProductLicense', { ns: 'common' });
      }
      // Handle days remaining
      if (licenseStatus.displayText === 'daysRemaining') {
        const days = licenseStatus.daysRemaining ?? 0;
        return t('daysRemaining', { ns: 'common', days });
      }
    }

    // Fallback to state-based display
    if (licenseStatus.state === 'lifetime') {
      return t('lifetime', { ns: 'common' });
    }
    if (licenseStatus.state === 'expired') {
      return t('expired', { ns: 'common' });
    }
    if (licenseStatus.state === 'lookingProductLicense') {
      return t('lookingProductLicense', { ns: 'common' });
    }
    if (licenseStatus.state === '30Days') {
      // Show actual days remaining if available
      if (licenseStatus.daysRemaining !== null && licenseStatus.daysRemaining !== undefined) {
        return t('daysRemaining', { ns: 'common', days: licenseStatus.daysRemaining });
      }
      // Fallback to default message
      return t('30Days', { ns: 'common' });
    }

    return t('noValidLicense', { ns: 'common' });
  };

  return (
    <Modal
      modalType="modal"
      showTitle={false}
      okLabel={t('yes', { ns: 'common' })}
      cancelLabel={t('no', { ns: 'common' })}
      showOk={false}
      size="large"
      preventOutsideClick={!isLicenseActive()}
      {...modal}
    >
      <Card className={classes.card}>
        <CardHeader
          image={<img src={logo} alt="Stat Pro" />}
          header={
            <Body1>
              <b>{t('appName', { ns: 'common' })}</b>
              <Text font="monospace" size={100}>
                &nbsp;(V{version})
              </Text>
            </Body1>
          }
          description={<Caption1>{t('aboutDesc', { ns: 'common' })}</Caption1>}
        />
        <CardPreview>
          <div className={classes.description}>
            <Body1Stronger>
              {t('productLicense', { ns: 'common' })} (
              <small className={classes.small}>Commercial</small>)
            </Body1Stronger>
          </div>

          {/* Section 1: System Token Generation */}
          {/* If license is activated, skip the button and show token display directly */}
          {!isLicenseActive() && (
            <div className={classes.tokenSection}>
              <Body1Stronger className={classes.sectionTitle}>
                {t('systemToken', { ns: 'common' })}
              </Body1Stronger>
              <div className={classes.tokenArea}>
                {!systemToken ? (
                  <div className={classes.tokenButtonContainer}>
                    <Button
                      shape="square"
                      className={classes.activeButton}
                      disabled={status === 'fetch'}
                      onClick={onClickGetToken}
                    >
                      {status === 'fetch' ? t('fetch', { ns: 'common' }) : t('systemToken', { ns: 'common' })}
                    </Button>
                  </div>
                ) : (
                  <div className={classes.tokenDisplayArea}>
                    <textarea
                      className={classes.textArea}
                      rows={6}
                      value={systemToken}
                      readOnly
                    />
                    <div className={classes.tokenActions}>
                      <Text font="monospace" size={200} weight="regular" className={classes.successMessage}>
                        System token generated successfully
                      </Text>
                      <ul className={classes.ulInfo}>
                        <li>
                          <Tooltip content={t('copy', { ns: 'common' })} relationship="label">
                            <Button
                              icon={<VscCopy />}
                              shape="square"
                              onClick={copyToClipboard}
                            />
                          </Tooltip>
                        </li>
                        <li>
                          <Tooltip content={t('defaultMail', { ns: 'common' })} relationship="label">
                            <Button
                              icon={<VscMailRead />}
                              shape="square"
                              onClick={sendViaConfiguredMail}
                            />
                          </Tooltip>
                        </li>
                        <li>
                          <Tooltip content={t('googleMail', { ns: 'common' })} relationship="label">
                            <Button
                              icon={<IoLogoGoogle />}
                              shape="square"
                              onClick={sendViaGoogleMail}
                            />
                          </Tooltip>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Show token display if license is activated (even if token exists) */}
          {isLicenseActive() && systemToken && (
            <div className={classes.tokenSection}>
              <Body1Stronger className={classes.sectionTitle}>
                {t('systemToken', { ns: 'common' })}
              </Body1Stronger>
              <div className={classes.tokenArea}>
                <div className={classes.tokenDisplayArea}>
                  <textarea
                    className={classes.textArea}
                    rows={6}
                    value={systemToken}
                    readOnly
                  />
                  <div className={classes.tokenActions}>
                    <Text font="monospace" size={200} weight="regular" className={classes.successMessage}>
                      System token generated successfully
                    </Text>
                    <ul className={classes.ulInfo}>
                      <li>
                        <Tooltip content={t('copy', { ns: 'common' })} relationship="label">
                          <Button
                            icon={<VscCopy />}
                            shape="square"
                            onClick={copyToClipboard}
                          />
                        </Tooltip>
                      </li>
                      <li>
                        <Tooltip content={t('defaultMail', { ns: 'common' })} relationship="label">
                          <Button
                            icon={<VscMailRead />}
                            shape="square"
                            onClick={sendViaConfiguredMail}
                          />
                        </Tooltip>
                      </li>
                      <li>
                        <Tooltip content={t('googleMail', { ns: 'common' })} relationship="label">
                          <Button
                            icon={<IoLogoGoogle />}
                            shape="square"
                            onClick={sendViaGoogleMail}
                          />
                        </Tooltip>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: License Activation (Shown if token exists OR license is activated) */}
          {(systemToken || isLicenseActive()) && (
            <div className={classes.activationSection}>
              <Body1Stronger className={classes.sectionTitle}>
                {t('activate', { ns: 'common' })}
              </Body1Stronger>
              <div className={classes.activationArea}>
                <textarea
                  className={classes.textArea}
                  rows={6}
                  value={licenseKey}
                  onChange={handleChange}
                  placeholder="Enter your license activation key here..."
                  readOnly={isLicenseActive()}
                  disabled={isLicenseActive()}
                />
                <div className={classes.activationActions}>
                  <Text font="monospace" align="start" size={200} weight="regular">
                    {getLicenseDisplayText()}
                  </Text>
                  {!isLicenseActive() && (
                    <Button
                      shape="square"
                      appearance="primary"
                      className={classes.activeBtn}
                      onClick={onClickActivate}
                      disabled={licenseKey === '' || status === 'activating'}
                    >
                      {status === 'activating' ? t('activating', { ns: 'common' }) || 'Activating...' : t('activate', { ns: 'common' })}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <Caption1 align="start" className={classes.reportIssue}>
            <Text font="monospace" size={100}>
              {t('reportIssueUrl', { ns: 'common' })}:{' '}
            </Text>
            <Link
              appearance="subtle"
              style={{ fontSize: '10px' }}
              href="mailto:support@statpro.org"
              target="_blank"
            >
              support@statpro.org
            </Link>
          </Caption1>

        </CardPreview>
        <CardFooter className={classes.footerButton}>
          <Text font="monospace" align="end" weight="regular" className={status}>
            {t(status as string, { ns: 'common' })}
          </Text>
          {isLicenseActive() || showCloseButton ? (
            <Button
              appearance="secondary"
              onClick={modal.closeModal}
              shape="square"
            >
              {t('close', { ns: 'common' })}
            </Button>
          ) : (
            <Button
              appearance="secondary"
              onClick={onHandleExitApp}
              shape="square"
            >
              {t('exitApp', { ns: 'common' })}
            </Button>
          )}
        </CardFooter>
      </Card>
    </Modal>
  );
};