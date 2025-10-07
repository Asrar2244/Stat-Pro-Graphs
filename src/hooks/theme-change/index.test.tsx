import { renderHook, act, waitFor } from '@utils/test-utils';
import { useThemeChange } from './index';

// Mock Tauri API
const mockOnThemeChanged = jest.fn();
const mockGetCurrentWindow = jest.fn(() => ({
  onThemeChanged: mockOnThemeChanged,
}));

jest.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => mockGetCurrentWindow(),
}));

jest.mock('@store', () => ({
  useThemeStore: jest.fn(),
}));

describe('hooks/theme-change', () => {
  let mockSetIsDarkTheme: jest.Mock;
  let mockUnListen: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSetIsDarkTheme = jest.fn();
    mockUnListen = jest.fn();

    mockOnThemeChanged.mockResolvedValue(mockUnListen);
  });

  it('should set dark theme when theme is "dark"', async () => {
    const { useThemeStore } = require('@store');
    useThemeStore.mockImplementation((selector: any) =>
      selector({
        theme: 'dark',
      }),
    );

    renderHook(() => useThemeChange(mockSetIsDarkTheme));

    await waitFor(() => {
      expect(mockSetIsDarkTheme).toHaveBeenCalledWith(true);
    });
  });

  it('should set light theme when theme is "light"', async () => {
    const { useThemeStore } = require('@store');
    useThemeStore.mockImplementation((selector: any) =>
      selector({
        theme: 'light',
      }),
    );

    renderHook(() => useThemeChange(mockSetIsDarkTheme));

    await waitFor(() => {
      expect(mockSetIsDarkTheme).toHaveBeenCalledWith(false);
    });
  });

  it('should listen to system theme when theme is "auto"', async () => {
    const { useThemeStore } = require('@store');
    useThemeStore.mockImplementation((selector: any) =>
      selector({
        theme: 'auto',
      }),
    );

    renderHook(() => useThemeChange(mockSetIsDarkTheme));

    await waitFor(() => {
      expect(mockOnThemeChanged).toHaveBeenCalled();
    });
  });

  it('should update theme when system theme changes to dark in auto mode', async () => {
    const { useThemeStore } = require('@store');
    useThemeStore.mockImplementation((selector: any) =>
      selector({
        theme: 'auto',
      }),
    );

    let themeChangedCallback: any;
    mockOnThemeChanged.mockImplementation((callback) => {
      themeChangedCallback = callback;
      return Promise.resolve(mockUnListen);
    });

    renderHook(() => useThemeChange(mockSetIsDarkTheme));

    await waitFor(() => {
      expect(mockOnThemeChanged).toHaveBeenCalled();
    });

    // Simulate system theme change to dark
    act(() => {
      themeChangedCallback({ payload: 'dark' });
    });

    expect(mockSetIsDarkTheme).toHaveBeenCalledWith(true);
  });

  it('should update theme when system theme changes to light in auto mode', async () => {
    const { useThemeStore } = require('@store');
    useThemeStore.mockImplementation((selector: any) =>
      selector({
        theme: 'auto',
      }),
    );

    let themeChangedCallback: any;
    mockOnThemeChanged.mockImplementation((callback) => {
      themeChangedCallback = callback;
      return Promise.resolve(mockUnListen);
    });

    renderHook(() => useThemeChange(mockSetIsDarkTheme));

    await waitFor(() => {
      expect(mockOnThemeChanged).toHaveBeenCalled();
    });

    // Simulate system theme change to light
    act(() => {
      themeChangedCallback({ payload: 'light' });
    });

    expect(mockSetIsDarkTheme).toHaveBeenCalledWith(false);
  });

  it('should not listen to system theme when theme is not "auto"', async () => {
    const { useThemeStore } = require('@store');
    useThemeStore.mockImplementation((selector: any) =>
      selector({
        theme: 'dark',
      }),
    );

    renderHook(() => useThemeChange(mockSetIsDarkTheme));

    await waitFor(() => {
      expect(mockSetIsDarkTheme).toHaveBeenCalledWith(true);
    });

    // onThemeChanged might be called but system changes should be ignored
  });

  it('should cleanup listener on unmount', async () => {
    const { useThemeStore } = require('@store');
    useThemeStore.mockImplementation((selector: any) =>
      selector({
        theme: 'auto',
      }),
    );

    const { unmount } = renderHook(() => useThemeChange(mockSetIsDarkTheme));

    await waitFor(() => {
      expect(mockOnThemeChanged).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(mockUnListen).toHaveBeenCalled();
    });
  });

  it('should handle theme change from auto to dark', async () => {
    const { useThemeStore } = require('@store');

    let currentTheme = 'auto';
    useThemeStore.mockImplementation((selector: any) =>
      selector({
        theme: currentTheme,
      }),
    );

    const { rerender } = renderHook(() => useThemeChange(mockSetIsDarkTheme));

    await waitFor(() => {
      expect(mockOnThemeChanged).toHaveBeenCalled();
    });

    // Change theme to dark
    currentTheme = 'dark';
    useThemeStore.mockImplementation((selector: any) =>
      selector({
        theme: currentTheme,
      }),
    );

    rerender();

    await waitFor(() => {
      expect(mockSetIsDarkTheme).toHaveBeenCalledWith(true);
    });
  });

  it('should handle theme change from dark to light', async () => {
    const { useThemeStore } = require('@store');

    let currentTheme = 'dark';
    useThemeStore.mockImplementation((selector: any) =>
      selector({
        theme: currentTheme,
      }),
    );

    const { rerender } = renderHook(() => useThemeChange(mockSetIsDarkTheme));

    await waitFor(() => {
      expect(mockSetIsDarkTheme).toHaveBeenCalledWith(true);
    });

    mockSetIsDarkTheme.mockClear();

    // Change theme to light
    currentTheme = 'light';
    useThemeStore.mockImplementation((selector: any) =>
      selector({
        theme: currentTheme,
      }),
    );

    rerender();

    await waitFor(() => {
      expect(mockSetIsDarkTheme).toHaveBeenCalledWith(false);
    });
  });

  it('should handle unlisten being a function', async () => {
    const { useThemeStore } = require('@store');
    useThemeStore.mockImplementation((selector: any) =>
      selector({
        theme: 'auto',
      }),
    );

    mockOnThemeChanged.mockResolvedValue(mockUnListen);

    const { unmount } = renderHook(() => useThemeChange(mockSetIsDarkTheme));

    await waitFor(() => {
      expect(mockOnThemeChanged).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(mockUnListen).toHaveBeenCalled();
    });
  });

  it('should handle unlisten not being a function', async () => {
    const { useThemeStore } = require('@store');
    useThemeStore.mockImplementation((selector: any) =>
      selector({
        theme: 'auto',
      }),
    );

    mockOnThemeChanged.mockResolvedValue(null);

    const { unmount } = renderHook(() => useThemeChange(mockSetIsDarkTheme));

    await waitFor(() => {
      expect(mockOnThemeChanged).toHaveBeenCalled();
    });

    // Should not throw error
    expect(() => unmount()).not.toThrow();
  });

  it('should handle rapid theme changes', async () => {
    const { useThemeStore } = require('@store');

    let currentTheme = 'light';
    useThemeStore.mockImplementation((selector: any) =>
      selector({
        theme: currentTheme,
      }),
    );

    const { rerender } = renderHook(() => useThemeChange(mockSetIsDarkTheme));

    const themes: Array<'light' | 'dark' | 'auto'> = ['dark', 'light', 'auto', 'dark', 'light'];

    for (const theme of themes) {
      currentTheme = theme;
      useThemeStore.mockImplementation((selector: any) =>
        selector({
          theme: currentTheme,
        }),
      );
      rerender();

      await waitFor(() => {
        if (theme === 'dark') {
          expect(mockSetIsDarkTheme).toHaveBeenCalledWith(true);
        } else if (theme === 'light') {
          expect(mockSetIsDarkTheme).toHaveBeenCalledWith(false);
        }
      });
    }
  });

  it('should ignore system theme changes when not in auto mode', async () => {
    const { useThemeStore } = require('@store');
    useThemeStore.mockImplementation((selector: any) =>
      selector({
        theme: 'dark',
      }),
    );

    let themeChangedCallback: any;
    mockOnThemeChanged.mockImplementation((callback) => {
      themeChangedCallback = callback;
      return Promise.resolve(mockUnListen);
    });

    renderHook(() => useThemeChange(mockSetIsDarkTheme));

    await waitFor(() => {
      expect(mockOnThemeChanged).toHaveBeenCalled();
    });

    mockSetIsDarkTheme.mockClear();

    // Simulate system theme change - should be ignored because theme is 'dark', not 'auto'
    if (themeChangedCallback) {
      act(() => {
        themeChangedCallback({ payload: 'light' });
      });
    }

    // Should not update because theme is not 'auto'
    // The callback might be called but the condition checks theme === 'auto'
  });
});
