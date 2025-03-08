import { FC, useEffect, useState } from 'react';
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
} from '@fluentui/react-components';
import { Modal, ITranslate } from '@libs';
import { IModal } from '@hooks';
import { app } from '@tauri-apps/api';
import { useOpenDevToolsLayout } from './styles-hook/use-open-dev-tools-style';
import logo from '../../assets/Square44x44Logo.png';

export const OpenDevTools: FC<IModal & ITranslate> = ({ t, ...modal }) => {
  const [version, setVersion] = useState('');
  const classes = useOpenDevToolsLayout();
  useEffect(() => {
    app.getVersion().then((version) => {
      setVersion(version);
    });
  }, []);
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
          image={<img src={logo} alt="Elvia Atkins avatar picture" />}
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
            <div>eee-ggff-333-lglk</div>
            <div className={classes.license}>
              <Caption1>
                {t('buildNumber', { ns: 'common' })}: {version}
              </Caption1>
              <Caption1>
                {t('releaseDate', { ns: 'common' })}: {new Date().toLocaleDateString()}
              </Caption1>
              <Caption1>{t('copyright', { ns: 'common' })}: statPro</Caption1>
              <Caption1>{t('licenseTo', { ns: 'common' })}: MIT</Caption1>
            </div>
          </div>
          <Caption1>
            {t('reportIssueUrl', { ns: 'common' })}:{' '}
            <Link href="https://github.com/statPro/start-pro/issues">start-pro/issues</Link>
          </Caption1>
        </CardPreview>
        <CardFooter className={classes.footerButton}>
          <Button appearance="primary" onClick={modal.closeModal}>
            {t('yes', { ns: 'common' })}
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  );
};
