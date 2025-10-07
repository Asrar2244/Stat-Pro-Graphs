import { render } from '@utils/test-utils';
import { WelcomePage } from './index';
import { useThemeStore } from '@store';

jest.mock('@store', () => ({
  useThemeStore: jest.fn(),
}));

jest.mock('zustand/react/shallow', () => ({
  useShallow: jest.fn((fn) => fn),
}));

jest.mock('@constants', () => ({
  WELCOME_URL: 'https://example.com/welcome',
}));

describe('WelcomePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders iframe with correct src URL', () => {
    (useThemeStore as unknown as jest.Mock).mockReturnValue({ theme: 'light' });

    const { container } = render(<WelcomePage />);
    const iframe = container.querySelector('iframe');

    expect(iframe).toBeInTheDocument();
    expect(iframe?.src).toContain('?theme=light');
  });

  it('applies correct iframe styles', () => {
    (useThemeStore as unknown as jest.Mock).mockReturnValue({ theme: 'dark' });

    const { container } = render(<WelcomePage />);
    const iframe = container.querySelector('iframe');

    expect(iframe).toHaveStyle({ width: '100%', height: '100%' });
  });

  it('updates theme in URL when theme changes', () => {
    (useThemeStore as unknown as jest.Mock).mockReturnValue({ theme: 'dark' });

    const { container } = render(<WelcomePage />);
    const iframe = container.querySelector('iframe');

    expect(iframe?.src).toContain('?theme=dark');
  });

  it('should handle custom theme values', () => {
    (useThemeStore as unknown as jest.Mock).mockReturnValue({ theme: 'custom-theme' });

    const { container } = render(<WelcomePage />);
    const iframe = container.querySelector('iframe');
    expect(iframe?.src).toContain('?theme=custom-theme');
  });

  it('should render without crashing', () => {
    (useThemeStore as unknown as jest.Mock).mockReturnValue({ theme: 'light' });

    const { container } = render(<WelcomePage />);
    expect(container).toBeInTheDocument();
  });

  it('should update iframe src when theme changes', () => {
    (useThemeStore as unknown as jest.Mock).mockReturnValue({ theme: 'light' });

    const { container, rerender } = render(<WelcomePage />);
    let iframe = container.querySelector('iframe');
    expect(iframe?.src).toContain('?theme=light');

    (useThemeStore as unknown as jest.Mock).mockReturnValue({ theme: 'dark' });

    rerender(<WelcomePage />);
    iframe = container.querySelector('iframe');
    expect(iframe?.src).toContain('?theme=dark');
  });
});
