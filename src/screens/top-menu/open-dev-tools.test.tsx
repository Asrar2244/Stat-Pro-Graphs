import { render, fireEvent, waitFor } from '@utils/test-utils';
import { OpenDevTools } from './open-dev-tools';
import { useLicense, useModal } from '@hooks';
import { app } from '@tauri-apps/api';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useLicenseStore } from '@store';

const mockCloseModal = jest.fn();
const mockApplyLicense = jest.fn();
const mockGetSystemData = jest.fn();

jest.mock('../../assets/Square44x44Logo.png', () => 'logo.png');

jest.mock('@hooks', () => ({
  useModal: jest.fn(() => ({})),
  useLicense: jest.fn(),
}));

jest.mock('@tauri-apps/api', () => ({
  app: {
    getVersion: jest.fn(),
  },
}));

jest.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: jest.fn(() => ({
    close: jest.fn(),
  })),
}));

jest.mock('@store', () => ({
  useLicenseStore: jest.fn(),
}));

const TestComponent = () => {
  const modal = useModal({});
  return <OpenDevTools {...modal} open={true} closeModal={mockCloseModal} />;
};

describe('OpenDevTools Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (app.getVersion as jest.Mock).mockResolvedValue('1.0.0');
    (useLicense as jest.Mock).mockReturnValue({
      applyLicense: mockApplyLicense,
      getSystemData: mockGetSystemData,
    });
    (useLicenseStore as unknown as jest.Mock).mockReturnValue({
      licenseStatus: { type: '', state: 'unlicensed' },
    });
  });

  it('renders the component with correct version', async () => {
    const { getByText } = render(<TestComponent />);

    await waitFor(() => {
      expect(getByText(/V1.0.0/)).toBeInTheDocument();
    });
  });

  it('renders activate button', () => {
    const { getByRole } = render(<TestComponent />);

    const activateButton = getByRole('button', { name: /activate/i });
    expect(activateButton).toBeInTheDocument();
  });

  it('handles system token fetch', async () => {
    mockGetSystemData.mockResolvedValue({ msg: 'test-token-123' });
    const { getByText } = render(<TestComponent />);

    const tokenButton = getByText(/systemToken/i);
    fireEvent.click(tokenButton);

    await waitFor(() => {
      expect(mockGetSystemData).toHaveBeenCalled();
    });
  });

  it('calls closeModal when close button is clicked', () => {
    const { getByText } = render(<TestComponent />);

    const closeButton = getByText(/close/i);
    fireEvent.click(closeButton);

    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('closes window when exit app button is clicked', () => {
    const mockClose = jest.fn();
    (getCurrentWindow as jest.Mock).mockReturnValue({ close: mockClose });

    const { getByText } = render(
      <OpenDevTools
        open={true}
        closeModal={mockCloseModal}
        showCloseButton={false}
        toggleModal={jest.fn()}
        openModal={jest.fn()} />
    );

    const exitButton = getByText(/exitApp/i);
    fireEvent.click(exitButton);

    expect(mockClose).toHaveBeenCalled();
  });

  it('renders card with license information', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText(/productLicense/i)).toBeInTheDocument();
  });
});
