import { getCurrentWindow } from '@tauri-apps/api/window';
import { useThemeStore } from '@store';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const useThemeChange = (setIsDarkTheme: (isDark: boolean) => void) => {
  const { theme } = useThemeStore(useShallow((state) => ({ theme: state.theme })));

  useEffect(() => {
    let unListen: any;
    (async () => {
      unListen = await getCurrentWindow().onThemeChanged(({ payload }) => {
        if (theme === 'auto') {
          setIsDarkTheme(payload === 'dark');
        }
      });
    })();

    if (theme !== 'auto') {
      setIsDarkTheme(theme === 'dark');
    }

    return () => {
      if (typeof unListen === 'function') unListen();
    };
  }, [theme]);
};
