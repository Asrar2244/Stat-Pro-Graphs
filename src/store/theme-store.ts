import { create } from 'zustand';
interface IThemeStore {
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

export const useThemeStore = create<IThemeStore>((set) => ({
  theme: 'dark',
  setTheme(theme): void {
    set(() => {
      return { theme };
    });
  },
}));
