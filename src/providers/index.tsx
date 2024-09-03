import { FC, PropsWithChildren, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import {
  FluentProvider,
  teamsLightTheme,
  teamsDarkTheme,
  Toaster,
} from '@fluentui/react-components';
import { useInitialConfig, useThemeChange } from '@hooks';
import i18n from './i18';

export const StartProProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
  useInitialConfig();
  useThemeChange(setIsDarkTheme);
  return (
    <FluentProvider theme={isDarkTheme ? teamsDarkTheme : teamsLightTheme}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      <Toaster limit={4} position="bottom-end" pauseOnHover timeout={5000} />
    </FluentProvider>
  );
};
