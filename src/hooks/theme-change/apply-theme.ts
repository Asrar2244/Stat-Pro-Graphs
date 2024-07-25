import { useThemeClassName } from '@fluentui/react-components';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useTheme = (): void => {
  const classes = useThemeClassName();
  const { t } = useTranslation('common');

  useEffect(() => {
    const classList = classes.split(' ');
    document.body.classList.add(...classList);
    document.title = t('appName');
    return () => {
      document.body.classList.remove(...classList);
    };
  }, [classes]);
};
