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
import MaskedInput from 'react-text-mask';
import { Modal } from '@libs';
import { IModal, useLicense } from '@hooks';
import { app } from '@tauri-apps/api';
import { useOpenDevToolsLayout } from './styles-hook/use-open-dev-tools-style';
import logo from '../../assets/Square44x44Logo.png';
import { VscArrowRight } from 'react-icons/vsc';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { mask } from '@constants';
import { useLicenseStore } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
export const OpenDevTools: FC<IModal & { showCloseButton?: boolean }> = ({
  showCloseButton = true,
  ...modal
}) => {
  const [version, setVersion] = useState('');
  const [status, setStatus] = useState<
    'fetch' | 'verifying' | 'activating' | 'notValid' | undefined
  >(undefined);
  const classes = useOpenDevToolsLayout();
  const { t } = useTranslation('common');
  const { applyLicense, checkLicense, getSystemData } = useLicense();
  //setLicenseState
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upperCasedValue = e.target.value.toUpperCase();
    setLicenseKey(upperCasedValue);
  };
  const onClickActivate = () => {
    setStatus('verifying');
    checkLicense().then((resCheckLicense) => {
      if (!resCheckLicense.license_valid) {
        setStatus('notValid');
        return;
      }
      setStatus('activating');
      applyLicense().then((res) => {
        if (!res.license_applied) {
          setStatus('notValid');
          return;
        }
        setStatus(undefined);
      });
    });
  };
  const onClickGetToken = () => {
    setStatus('fetch');
    getSystemData()
      .then((res) => {
        const a = document.createElement('a');
        a.href = `mailto:support@statpro.org?subject=System Token Request&body=${res.msg}`;
        a.click();
      })
      .finally(() => {
        setStatus(undefined);
      });
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
            <div className={classes.activateLicense}>
              <Button
                size="small"
                shape="square"
                className={classes.activeButton}
                disabled={status === 'fetch'}
                onClick={onClickGetToken}
              >
                {t('systemToken', { ns: 'common' })}
              </Button>
              <div className={classes.maskInputButton}>
                <MaskedInput
                  mask={mask}
                  value={licenseKey}
                  onChange={handleChange}
                  placeholder="XXXX-XXXX-XXXX"
                  style={{
                    textTransform: 'uppercase',
                    height: '32px',
                    outline: 'none',
                    borderRadius: 0,
                    width: '80%',
                  }}
                />
                <Tooltip content={t('activate', { ns: 'common' })} relationship="label">
                  <Button
                    icon={<VscArrowRight />}
                    shape="square"
                    appearance="outline"
                    className={classes.activeButton}
                    onClick={onClickActivate}
                  />
                </Tooltip>
              </div>

              <Text font="monospace" align="start" weight="regular">
                {t(licenseStatus.state as string, { ns: 'common' })}
              </Text>

              <Caption1 align="start">
                <Text font="monospace">{t('reportIssueUrl', { ns: 'common' })}: </Text>
                <Link
                  style={{ fontSize: '10px' }}
                  href="mailto:support@statpro.org"
                  target="_blank"
                >
                  support@statpro.org
                </Link>
              </Caption1>
            </div>
            <div className={classes.license}>
              <Text font="monospace">
                {t('version', { ns: 'common' })}: {version}
              </Text>
              <Text font="monospace">
                {t('releaseDate', { ns: 'common' })}: {new Date().toLocaleDateString()}
              </Text>
              <Text font="monospace">{t('copyright', { ns: 'common' })}:&copy;statPro</Text>
            </div>
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
