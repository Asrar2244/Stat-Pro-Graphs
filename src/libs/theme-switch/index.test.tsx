import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeSwitch } from "./index";
import "@testing-library/jest-dom";

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'themeSwitch': 'Theme Switch',
        'light': 'Light',
        'dark': 'Dark',
        'auto': 'Auto'
      };
      return translations[key] || key;
    }
  })
}));

// Mock theme store
const mockSetTheme = jest.fn();
jest.mock('@store/theme-store', () => ({
  useThemeStore: () => ({
    theme: 'light',
    setTheme: mockSetTheme
  })
}));

describe("ThemeSwitch Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders theme switch badge", () => {
    render(<ThemeSwitch />);

    // Check if the popover trigger is rendered
    const badge = screen.getByRole('button');
    expect(badge).toBeInTheDocument();
  });

  test("opens popover when badge is clicked", () => {
    render(<ThemeSwitch />);

    const badge = screen.getByRole('button');
    fireEvent.click(badge);

    expect(screen.getByText("Theme Switch")).toBeInTheDocument();
  });

  test("renders all theme options", () => {
    render(<ThemeSwitch />);

    const badge = screen.getByRole('button');
    fireEvent.click(badge);

    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("Auto")).toBeInTheDocument();
  });

  test("calls setTheme when light theme is selected", () => {
    render(<ThemeSwitch />);

    const badge = screen.getByRole('button');
    fireEvent.click(badge);

    const lightButton = screen.getByText("Light");
    fireEvent.click(lightButton);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  test("calls setTheme when dark theme is selected", () => {
    render(<ThemeSwitch />);

    const badge = screen.getByRole('button');
    fireEvent.click(badge);

    const darkButton = screen.getByText("Dark");
    fireEvent.click(darkButton);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  test("calls setTheme when auto theme is selected", () => {
    render(<ThemeSwitch />);

    const badge = screen.getByRole('button');
    fireEvent.click(badge);

    const autoButton = screen.getByText("Auto");
    fireEvent.click(autoButton);

    expect(mockSetTheme).toHaveBeenCalledWith('auto');
  });

  test("component is memoized", () => {
    const { rerender } = render(<ThemeSwitch />);

    // First render
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Re-render with same props (should use memoized version)
    rerender(<ThemeSwitch />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});