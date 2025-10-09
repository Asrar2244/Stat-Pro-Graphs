import { useThemeStore } from './theme-store';
import { act, renderHook } from '@testing-library/react';

describe('store/theme-store', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useThemeStore.setState({ theme: 'dark' });
    });
  });

  it('should have default theme as dark', () => {
    const { result } = renderHook(() => useThemeStore());

    expect(result.current.theme).toBe('dark');
  });

  it('should set theme to light', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
  });

  it('should set theme to dark', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
  });

  it('should set theme to auto', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme('auto');
    });

    expect(result.current.theme).toBe('auto');
  });

  it('should handle rapid theme changes', () => {
    const { result } = renderHook(() => useThemeStore());

    const themes: Array<'light' | 'dark' | 'auto'> = [
      'light',
      'dark',
      'auto',
      'dark',
      'light',
      'auto',
    ];

    themes.forEach((theme) => {
      act(() => {
        result.current.setTheme(theme);
      });
      expect(result.current.theme).toBe(theme);
    });
  });

  it('should persist theme changes across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useThemeStore());
    const { result: result2 } = renderHook(() => useThemeStore());

    act(() => {
      result1.current.setTheme('light');
    });

    expect(result1.current.theme).toBe('light');
    expect(result2.current.theme).toBe('light');

    act(() => {
      result2.current.setTheme('auto');
    });

    expect(result1.current.theme).toBe('auto');
    expect(result2.current.theme).toBe('auto');
  });

  it('should only update theme state, not other properties', () => {
    const { result } = renderHook(() => useThemeStore());

    const initialSetTheme = result.current.setTheme;

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.setTheme).toBe(initialSetTheme);
    expect(result.current.theme).toBe('light');
  });

  it('should handle multiple subscribers', () => {
    const themes: Array<'light' | 'dark' | 'auto'> = [];
    const unsubscribe = useThemeStore.subscribe((state) => {
      themes.push(state.theme);
    });

    act(() => {
      useThemeStore.getState().setTheme('light');
    });

    act(() => {
      useThemeStore.getState().setTheme('dark');
    });

    act(() => {
      useThemeStore.getState().setTheme('auto');
    });

    expect(themes).toEqual(['light', 'dark', 'auto']);

    unsubscribe();
  });

  it('should maintain reactivity after multiple updates', () => {
    const { result } = renderHook(() => useThemeStore());

    for (let i = 0; i < 100; i++) {
      const theme: 'light' | 'dark' | 'auto' = i % 3 === 0 ? 'light' : i % 3 === 1 ? 'dark' : 'auto';
      act(() => {
        result.current.setTheme(theme);
      });
      expect(result.current.theme).toBe(theme);
    }
  });

  it('should handle setting same theme multiple times', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme('light');
    });
    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.setTheme('light');
    });
    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.setTheme('light');
    });
    expect(result.current.theme).toBe('light');
  });

  it('should be accessible via getState', () => {
    act(() => {
      useThemeStore.getState().setTheme('auto');
    });

    expect(useThemeStore.getState().theme).toBe('auto');
  });

  it('should be accessible via setState', () => {
    act(() => {
      useThemeStore.setState({ theme: 'light' });
    });

    expect(useThemeStore.getState().theme).toBe('light');
  });
});
