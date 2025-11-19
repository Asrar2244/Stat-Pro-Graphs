import { getCurrentWindow } from '@tauri-apps/api/window';
import { useThemeStore } from '@store';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { safeTauriCall, isTauriEnvironment } from '@utils/tauri-utils';

export const useThemeChange = (setIsDarkTheme: (isDark: boolean) => void) => {
  const { theme } = useThemeStore(useShallow((state) => ({ theme: state.theme })));

  useEffect(() => {
    let unListen: any;
    
    if (isTauriEnvironment()) {
      (async () => {
        unListen = await safeTauriCall(
          async () => {
            return await getCurrentWindow().onThemeChanged(({ payload }) => {
              if (theme === 'auto') {
                setIsDarkTheme(payload === 'dark');
              }
            });
          },
          () => {
            console.log('Development mode: Theme change listener not available');
            return () => {}; // Return empty cleanup function
          }
        );
      })();
    }

    if (theme !== 'auto') {
      setIsDarkTheme(theme === 'dark');
    }

    return () => {
      if (typeof unListen === 'function') unListen();
    };
  }, [theme]);
};
