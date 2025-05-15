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

export const OpenDevTools: FC<IModal & { showCloseButton?: boolean }> = ({
  showCloseButton = true,
  ...modal
}) => {
  const [version, setVersion] = useState('');
  const [status, setStatus] = useState<
    'fetch' | 'verifying' | 'activating' | 'notValid' | undefined
  >(undefined);
  const [licenseMessage, setLicenseMessage] = useState<string>('');
  const classes = useOpenDevToolsLayout();
  const { t } = useTranslation('common');
  const { applyLicense, getSystemData } = useLicense();

  const { licenseStatus } = useLicenseStore(
    useShallow((state) => ({
      licenseStatus: state.licenseStatus,
      setLicenseState: state.setLicenseState,
    })),
  );
  const [licenseKey, setLicenseKey] = useState('');
  useEffect(() => {
    app.getVersion().then((version) => {
      setVersion(version);
    });
    setLicenseKey(licenseStatus.type as string);
  }, []);
  const onHandleExitApp = () => {
    getCurrentWindow().close();
  };
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      setStatus(undefined);
    });
  };
  const onClickGetToken = () => {
    setStatus('fetch');
    getSystemData()
      .then((res) => {
        setLicenseMessage(res.msg);
      })
      .finally(() => {
        setStatus(undefined);
      });
  };
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(`
      mail id: support@statpro.org \n
      token: ${licenseKey}`);
  };
  const sendViaConfiguredMail = () => {
    window.open(`mailto:support@statpro.org?subject=System Token Request&body=${licenseKey}`);
  };
  const sendViaGoogleMail = () => {
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=support@statpro.org&su=System Token Request&body=${licenseKey}`,
    );
  };

  return (
    <Modal
      modalType="alert"
      showTitle={false}
      okLabel={t('yes', { ns: 'common' })}
      cancelLabel={t('no', { ns: 'common' })}
      showOk={false}
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
          <div className={classes.details}>
            <div className={classes.informationList}>
              <Button
                shape="square"
                className={classes.activeButton}
                disabled={status === 'fetch'}
                onClick={onClickGetToken}
              >
                {t('systemToken', { ns: 'common' })}
              </Button>
              <ul className={classes.ulInfo}>
                <li>
                  <Tooltip content={t('copy', { ns: 'common' })} relationship="label">
                    <Button
                      disabled={!!!licenseMessage}
                      icon={<VscCopy />}
                      shape="square"
                      onClick={copyToClipboard}
                    />
                  </Tooltip>
                </li>
                <li>
                  <Tooltip content={t('defaultMail', { ns: 'common' })} relationship="label">
                    <Button
                      disabled={!!!licenseMessage}
                      icon={<VscMailRead />}
                      shape="square"
                      onClick={sendViaConfiguredMail}
                    />
                  </Tooltip>
                </li>
                <li>
                  <Tooltip content={t('googleMail', { ns: 'common' })} relationship="label">
                    <Button
                      onClick={sendViaGoogleMail}
                      disabled={!!!licenseMessage}
                      icon={<IoLogoGoogle />}
                      shape="square"
                    />
                  </Tooltip>
                </li>
              </ul>
            </div>
            <div className={classes.maskInputButton}>
              <textarea className={classes.textArea} rows={10} onChange={handleChange}>
                {licenseKey}
              </textarea>
              <div className={classes.informationList}>
                <Text font="monospace" align="start" size={200} weight="regular">
                  {t(licenseStatus.state as string, { ns: 'common' })}
                </Text>
                <Button
                  shape="square"
                  appearance="primary"
                  className={classes.activeBtn}
                  onClick={onClickActivate}
                  disabled={licenseKey === ''}
                >
                  {t('activate', { ns: 'common' })}
                </Button>
              </div>
            </div>

            <Caption1 align="start">
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
          </div>
        </CardPreview>
        <CardFooter className={classes.footerButton}>
          <Text font="monospace" align="end" weight="regular">
            {t(status as string, { ns: 'common' })}
          </Text>
          {showCloseButton ? (
            <Button appearance="secondary" onClick={modal.closeModal} shape="square">
              {t('close', { ns: 'common' })}
            </Button>
          ) : (
            <Button appearance="secondary" onClick={onHandleExitApp} shape="square">
              {t('exitApp', { ns: 'common' })}
            </Button>
          )}
        </CardFooter>
      </Card>
    </Modal>
  );
};
