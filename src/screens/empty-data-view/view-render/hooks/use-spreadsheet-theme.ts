import { useState, useEffect } from 'react';
import { useThemeStore } from '@store';
import { useShallow } from 'zustand/react/shallow';

/**
 * Hook to get dark mode state for ExcelSpreadsheet component
 * Synchronized with FluentUI theme store
 */
export const useSpreadsheetTheme = (): boolean => {
  const { theme } = useThemeStore(useShallow((state) => ({ theme: state.theme })));
  
  const getIsDarkMode = () => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  
  const [isDarkMode, setIsDarkMode] = useState(getIsDarkMode);

  useEffect(() => {
    setIsDarkMode(getIsDarkMode());
    
    // Listen to system theme changes when in 'auto' mode
              if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => setIsDarkMode(mediaQuery.matches);
      
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
          mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [theme]);

  return isDarkMode;
};

