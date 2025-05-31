import { FC, PropsWithChildren } from 'react';
import { Spinner } from '@fluentui/react-components';
import { useExecuteProvider } from './use-execute-provider';
import { useExecuterProviderLayout } from '../styles-hook/use-executer-provider-style';
import { useThemeStore } from '@store';
import { useTranslation } from 'react-i18next';
export const ExecuteProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isProcessing } = useExecuteProvider();
  const classes = useExecuterProviderLayout();
  const { theme } = useThemeStore();
  const { t } = useTranslation('common');
  if (isProcessing)
    return (
      <div id="sample-id" className={classes.wrapper}>
        <img
          src={
            theme === 'light'
              ? '../splash-screen/images/white.svg'
              : '../splash-screen/images/black.svg'
          }
          alt="Stat Pro Logo"
          width="400"
          height="200"
        />
        <Spinner appearance="primary" label={t('verifyingAndProcessing')} />
      </div>
    );
  return children;
};
