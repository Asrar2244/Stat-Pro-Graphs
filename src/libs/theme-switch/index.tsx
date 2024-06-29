import { FC, memo, useEffect, useState, useMemo } from 'react';
import {
  Badge,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Caption1Stronger,
  ToggleButton,
} from '@fluentui/react-components';
import { IoSunny, IoMoon } from 'react-icons/io5';
import { useThemeStore } from '@store/theme-store';
import { useThemeSwitchStyles } from './styles-hook/use-theme-switch';
import { useTranslation } from 'react-i18next';
import { VscColorMode } from 'react-icons/vsc';

//Icon selection
const icons = {
  light: <IoSunny />,
  dark: <IoMoon />,
  auto: <VscColorMode />,
};

export const ThemeSwitch: FC = memo(() => {
  const { t } = useTranslation('common');
  const { theme, setTheme } = useThemeStore();
  const classes = useThemeSwitchStyles();
  const [isAuto, setIsAuto] = useState<boolean>(theme === 'auto');
  const platformIsMac = useMemo(() => {
    return navigator.userAgent.indexOf('Mac') != -1;
  }, []);
  // useEffect(() => {
  //   const updateDarkMode = (_event: any, isDarkTheme: boolean): void => {
  //     setTheme(isDarkTheme === true ? 'dark' : 'light');
  //   };
  //   // if (isAuto || theme === 'auto') {
  //   //   window.api.setSystemTheme('auto');
  //   //   window.api.systemTheme(updateDarkMode);
  //   // } else {
  //   //   window.api.removeSystemTheme(updateDarkMode);
  //   // }
  // }, [theme, isAuto]);
  const onClickHandler = (e: any): void => {
    // window.api.setSystemTheme(e.target.name as 'light' | 'dark' | 'auto');
    setTheme(e.target.name as 'light' | 'dark' | 'auto');
  };
  const onClickAutoChange = (): void => {
    setIsAuto(!isAuto);
  };

  return (
    <Popover withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <Badge appearance="ghost" icon={icons[theme]} />
      </PopoverTrigger>
      <PopoverSurface tabIndex={-1}>
        <div className={classes.wrapper}>
          <div className={classes.title}>
            <Caption1Stronger>{t('themeSwitch')}</Caption1Stronger>
          </div>

          <div className={classes.themeSelection}>
            <ul className={classes.ul}>
              <li>
                <ToggleButton
                  appearance="transparent"
                  name="light"
                  icon={<IoSunny color="#efb839" />}
                  size="small"
                  onClick={onClickHandler}
                  disabled={isAuto}
                  checked={theme === 'light'}
                >
                  {t('light')}
                </ToggleButton>
              </li>
              <li>
                <ToggleButton
                  appearance="transparent"
                  name="dark"
                  icon={<IoMoon color="#292929" />}
                  onClick={onClickHandler}
                  size="small"
                  disabled={isAuto}
                  checked={theme === 'dark'}
                >
                  {t('dark')}
                </ToggleButton>
              </li>
            </ul>
            <ToggleButton
              appearance="transparent"
              name="auto"
              icon={<VscColorMode />}
              size="small"
              onClick={onClickAutoChange}
              checked={isAuto}
            >
              {t('auto')}
            </ToggleButton>
          </div>
        </div>
      </PopoverSurface>
    </Popover>
  );
});
