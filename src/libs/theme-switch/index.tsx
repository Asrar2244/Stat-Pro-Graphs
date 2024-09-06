import { FC, memo, useState } from 'react';
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

  const onClickHandler = (e: any): void => {
    setTheme(e.target.name as 'light' | 'dark' | 'auto');
  };
  const onClickAutoChange = (): void => {
    setIsAuto(!isAuto);
    setTheme('auto');
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
              <li data-theme-selected={!isAuto && theme === 'light'}>
                <ToggleButton
                  appearance="transparent"
                  name="light"
                  icon={<IoSunny />}
                  size="small"
                  onClick={onClickHandler}
                  checked={theme === 'light'}
                  disabled={isAuto}
                >
                  {t('light')}
                </ToggleButton>
              </li>
              <li data-theme-selected={!isAuto && theme === 'dark'}>
                <ToggleButton
                  appearance="transparent"
                  name="dark"
                  icon={<IoMoon />}
                  onClick={onClickHandler}
                  size="small"
                  checked={theme === 'dark'}
                  disabled={isAuto}
                >
                  {t('dark')}
                </ToggleButton>
              </li>
              <li data-theme-selected={isAuto}>
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
              </li>
            </ul>
          </div>
        </div>
      </PopoverSurface>
    </Popover>
  );
});
