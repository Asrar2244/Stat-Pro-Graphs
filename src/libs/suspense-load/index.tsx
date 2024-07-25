import { FC, Suspense, PropsWithChildren } from 'react';
import { Spinner } from '@fluentui/react-components';
import { useSuspenseClasses } from './styles-hook/use-style';
import { useTranslation } from 'react-i18next';
export const SuspenseLoad: FC<PropsWithChildren> = ({ children }) => {
  const classes = useSuspenseClasses();
  const { t } = useTranslation('common', { useSuspense: true });
  return (
    <Suspense
      fallback={
        <div className={classes.suspense}>
          <Spinner label={t('pleaseWaitLoading')} size="small" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
};
