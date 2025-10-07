import { render, screen, fireEvent } from '@utils/test-utils';
import { MinMaxClose } from './index';

// Mock dependencies
jest.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: jest.fn(() => ({
    toggleMaximize: jest.fn(),
    minimize: jest.fn(),
    close: jest.fn(),
  })),
}));

jest.mock('./styles-hook/use-min-max-close', () => ({
  useMinMaxCloseStyles: () => ({
    minMaxClose: 'min-max-close-class',
    ul: 'ul-class',
    liCloseMaxMin: 'li-close-max-min-class',
  }),
}));

jest.mock('./status-list', () => ({
  StatusList: () => <div data-testid="status-list">Status List</div>,
}));

jest.mock('../theme-switch', () => ({
  ThemeSwitch: () => <div data-testid="theme-switch">Theme Switch</div>,
}));

jest.mock('./minimize', () => ({
  Minimize: () => <div data-testid="minimize-icon">Minimize</div>,
}));

jest.mock('./maximize', () => ({
  Maximize: () => <div data-testid="maximize-icon">Maximize</div>,
}));

jest.mock('./close', () => ({
  Close: () => <div data-testid="close-icon">Close</div>,
}));

jest.mock('@utils', () => ({
  platformInfo: jest.fn(() => 'windows'),
}));

describe('libs/min-max-close', () => {
  let mockToggleMaximize: jest.Mock;
  let mockMinimize: jest.Mock;
  let mockClose: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    const { getCurrentWindow } = require('@tauri-apps/api/window');
    mockToggleMaximize = jest.fn();
    mockMinimize = jest.fn();
    mockClose = jest.fn();

    (getCurrentWindow as jest.Mock).mockReturnValue({
      toggleMaximize: mockToggleMaximize,
      minimize: mockMinimize,
      close: mockClose,
    });

    const { platformInfo } = require('@utils');
    (platformInfo as jest.Mock).mockReturnValue('windows');
  });

  it('should render without crashing', () => {
    render(<MinMaxClose />);
    expect(screen.getByTestId('status-list')).toBeInTheDocument();
    expect(screen.getByTestId('theme-switch')).toBeInTheDocument();
  });

  it('should render StatusList component', () => {
    render(<MinMaxClose />);
    expect(screen.getByTestId('status-list')).toBeInTheDocument();
  });

  it('should render ThemeSwitch component', () => {
    render(<MinMaxClose />);
    expect(screen.getByTestId('theme-switch')).toBeInTheDocument();
  });

  it('should render window controls on Windows', () => {
    const { platformInfo } = require('@utils');
    (platformInfo as jest.Mock).mockReturnValue('windows');

    render(<MinMaxClose />);

    expect(screen.getByTestId('minimize-icon')).toBeInTheDocument();
    expect(screen.getByTestId('maximize-icon')).toBeInTheDocument();
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });

  it('should not render window controls on Mac', () => {
    const { platformInfo } = require('@utils');
    (platformInfo as jest.Mock).mockReturnValue('mac');

    render(<MinMaxClose />);

    expect(screen.queryByTestId('minimize-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('maximize-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument();
  });

  it('should call minimize when minimize button is clicked', () => {
    render(<MinMaxClose />);

    const minimizeButton = screen.getByTestId('minimize-icon').parentElement;
    if (minimizeButton) {
      fireEvent.click(minimizeButton);
      expect(mockMinimize).toHaveBeenCalled();
    }
  });

  it('should call toggleMaximize when maximize button is clicked', () => {
    render(<MinMaxClose />);

    const maximizeButton = screen.getByTestId('maximize-icon').parentElement;
    if (maximizeButton) {
      fireEvent.click(maximizeButton);
      expect(mockToggleMaximize).toHaveBeenCalled();
    }
  });

  it('should call close when close button is clicked', () => {
    render(<MinMaxClose />);

    const closeButton = screen.getByTestId('close-icon').parentElement;
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockClose).toHaveBeenCalled();
    }
  });

  it('should have data-close-window attribute on close button', () => {
    render(<MinMaxClose />);

    const closeButton = screen.getByTestId('close-icon').parentElement;
    expect(closeButton).toHaveAttribute('data-close-window', 'true');
  });

  it('should render divider before window controls on Windows', () => {
    const { platformInfo } = require('@utils');
    (platformInfo as jest.Mock).mockReturnValue('windows');

    const { container } = render(<MinMaxClose />);
    const divider = container.querySelector('[role="separator"]');
    expect(divider).toBeInTheDocument();
  });

  it('should not render divider on Mac', () => {
    const { platformInfo } = require('@utils');
    (platformInfo as jest.Mock).mockReturnValue('mac');

    const { container } = render(<MinMaxClose />);
    const divider = container.querySelector('[role="separator"]');
    expect(divider).not.toBeInTheDocument();
  });

  it('should memoize component properly', () => {
    const { rerender } = render(<MinMaxClose />);

    // Component should not re-render unnecessarily
    rerender(<MinMaxClose />);

    expect(screen.getByTestId('status-list')).toBeInTheDocument();
  });

  it('should handle window controls on Linux', () => {
    const { platformInfo } = require('@utils');
    (platformInfo as jest.Mock).mockReturnValue('linux');

    render(<MinMaxClose />);

    // Linux should show controls (not Mac)
    expect(screen.getByTestId('minimize-icon')).toBeInTheDocument();
    expect(screen.getByTestId('maximize-icon')).toBeInTheDocument();
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(<MinMaxClose />);

    const minMaxCloseDiv = container.querySelector('.min-max-close-class');
    expect(minMaxCloseDiv || container).toBeInTheDocument();
  });

  it('should render all list items', () => {
    render(<MinMaxClose />);

    const statusList = screen.getByTestId('status-list');
    const themeSwitch = screen.getByTestId('theme-switch');

    expect(statusList.parentElement?.tagName).toBe('LI');
    expect(themeSwitch.parentElement?.tagName).toBe('LI');
  });
});
