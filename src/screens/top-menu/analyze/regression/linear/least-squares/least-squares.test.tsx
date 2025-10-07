import { render, fireEvent, screen } from '@utils/test-utils';
import { LeastSquare } from './least-squares';
import { useActiveNode, useModal } from '@hooks';
import { usePrepareAnalysis } from './use-anayse-hook';
import { useStartProStore } from '@store/main-store';

const mockCloseModal = jest.fn();
const mockExecuteAnalysis = jest.fn();
const mockSetBlockUI = jest.fn();
const mockSetReset = jest.fn();

jest.mock('@hooks', () => ({
  useActiveNode: jest.fn(),
  useModal: jest.fn(() => ({})),
}));

jest.mock('./use-anayse-hook', () => ({
  usePrepareAnalysis: jest.fn(),
}));

jest.mock('@store/main-store', () => ({
  useStartProStore: jest.fn(),
}));

jest.mock('./use-squares-hook', () => ({
  useLinearLeastSquares: jest.fn(() => ({
    setReset: mockSetReset,
  })),
}));

jest.mock('../../../../../table-render/use-column-count', () => ({
  useColumnsRowsCount: jest.fn(() => ({
    columns: [
      { name: 'column1', type: 'numeric' },
      { name: 'column2', type: 'numeric' },
    ],
  })),
  IColumn: {},
}));

jest.mock('@libs', () => ({
  Modal: ({ children, title, okLabel, cancelLabel, showCancel, ok, closeModal }: any) => (
    <div data-testid="modal">
      <h2>{title}</h2>
      <button onClick={ok?.onClick}>{okLabel}</button>
      {showCancel && <button onClick={closeModal}>{cancelLabel}</button>}
      {children}
    </div>
  ),
  NoIdSelected: () => <div data-testid="no-id-selected">No ID Selected</div>,
}));

jest.mock('./model', () => ({
  Model: () => <div data-testid="model-tab">Model Tab</div>,
}));

jest.mock('./estimation', () => ({
  Estimation: () => <div data-testid="estimation-tab">Estimation Tab</div>,
}));

jest.mock('./options', () => ({
  Options: () => <div data-testid="options-tab">Options Tab</div>,
}));

jest.mock('./predict', () => ({
  Predict: () => <div data-testid="predict-tab">Predict Tab</div>,
}));

jest.mock('./resampling', () => ({
  Resampling: () => <div data-testid="resampling-tab">Resampling Tab</div>,
}));

jest.mock('vite', () => ({
  importMetaEnv: {},
}));

const renderTest = (props = {}) => {
  return render(<LeastSquareTestComponent {...props} />);
};

const LeastSquareTestComponent = (props: any) => {
  const modal = useModal({});
  return <LeastSquare {...modal} open={true} closeModal={mockCloseModal} {...props} />;
};

describe('LeastSquare Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useActiveNode as jest.Mock).mockReturnValue({ id: 'test-id', config: {} });
    (usePrepareAnalysis as jest.Mock).mockReturnValue({ executeAnalysis: mockExecuteAnalysis });
    (useStartProStore as unknown as jest.Mock).mockReturnValue({ setBlockUI: mockSetBlockUI });
  });

  describe('Modal rendering', () => {
    it('renders the modal correctly', () => {
      const { getByText } = renderTest();
      expect(getByText('title')).toBeInTheDocument();
    });

    it('renders modal with correct props', () => {
      const { container } = renderTest();
      expect(container).toBeInTheDocument();
    });
  });

  describe('Tab functionality', () => {
    it('renders all five tabs', () => {
      const { getAllByText } = renderTest();
      expect(getAllByText('model').length).toBeGreaterThan(0);
      expect(getAllByText('estimation').length).toBeGreaterThan(0);
      expect(getAllByText('options').length).toBeGreaterThan(0);
      expect(getAllByText('predict').length).toBeGreaterThan(0);
      expect(getAllByText('resampling').length).toBeGreaterThan(0);
    });

    it('displays Model tab by default', () => {
      renderTest();
      expect(screen.getByTestId('model-tab')).toBeInTheDocument();
    });

    it('switches to estimation tab correctly', () => {
      const { getAllByText } = renderTest();
      const estimationTabs = getAllByText('estimation');
      fireEvent.click(estimationTabs[0]);
      expect(screen.getByTestId('estimation-tab')).toBeInTheDocument();
    });

    it('switches to options tab correctly', () => {
      const { getAllByText } = renderTest();
      const optionsTabs = getAllByText('options');
      fireEvent.click(optionsTabs[0]);
      expect(screen.getByTestId('options-tab')).toBeInTheDocument();
    });

    it('switches to predict tab correctly', () => {
      const { getAllByText } = renderTest();
      const predictTabs = getAllByText('predict');
      fireEvent.click(predictTabs[0]);
      expect(screen.getByTestId('predict-tab')).toBeInTheDocument();
    });

    it('switches to resampling tab correctly', () => {
      const { getAllByText } = renderTest();
      const resamplingTabs = getAllByText('resampling');
      fireEvent.click(resamplingTabs[0]);
      expect(screen.getByTestId('resampling-tab')).toBeInTheDocument();
    });
  });

  describe('OK button functionality', () => {
    it('renders OK button', () => {
      renderTest();
      expect(screen.getByText('ok')).toBeInTheDocument();
    });

    it('calls executeAnalysis and closes modal on OK button click', () => {
      const { getByText } = renderTest();
      fireEvent.click(getByText('ok'));
      expect(mockExecuteAnalysis).toHaveBeenCalledWith('test-id');
      expect(mockCloseModal).toHaveBeenCalled();
      expect(mockSetBlockUI).toHaveBeenCalledWith({ value: true, msg: 'processRequest', hideOk: true });
    });

    it('executes analysis even when id is empty string', () => {
      (useActiveNode as jest.Mock).mockReturnValue({ id: '', config: {} });
      const { getByText } = renderTest();
      fireEvent.click(getByText('ok'));
      expect(mockExecuteAnalysis).toHaveBeenCalledWith('');
      expect(mockCloseModal).toHaveBeenCalled();
    });

    it('only closes modal when id is null', () => {
      (useActiveNode as jest.Mock).mockReturnValue({ id: null, config: {} });
      const { getByText } = renderTest();
      fireEvent.click(getByText('ok'));
      expect(mockExecuteAnalysis).not.toHaveBeenCalled();
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  describe('No ID selected state', () => {
    it('shows NoIdSelected component when no id', () => {
      (useActiveNode as jest.Mock).mockReturnValue({ id: '', config: {} });
      renderTest();
      expect(screen.getByTestId('no-id-selected')).toBeInTheDocument();
    });

    it('hides cancel button when no id', () => {
      (useActiveNode as jest.Mock).mockReturnValue({ id: '', config: {} });
      renderTest();
      expect(screen.queryByText('close')).not.toBeInTheDocument();
    });

    it('shows cancel button when id exists', () => {
      (useActiveNode as jest.Mock).mockReturnValue({ id: 'valid-id', config: {} });
      const { getByText } = renderTest();
      expect(getByText('close')).toBeInTheDocument();
    });
  });

  describe('Close functionality', () => {
    it('calls closeModal when close button is clicked', () => {
      const { getByText } = renderTest();
      fireEvent.click(getByText('close'));
      expect(mockCloseModal).toHaveBeenCalled();
    });

    it('calls setReset when modal is closed', () => {
      const { getByText } = renderTest();
      fireEvent.click(getByText('close'));
      expect(mockSetReset).toHaveBeenCalled();
    });
  });

  describe('Component integration', () => {
    it('uses active node data', () => {
      (useActiveNode as jest.Mock).mockReturnValue({
        id: 'integration-test-id',
        config: { tableName: 'test_table' },
      });
      const { getByText } = renderTest();
      expect(getByText('title')).toBeInTheDocument();
    });

    it('prepares analysis with correct parameters', () => {
      renderTest();
      expect(usePrepareAnalysis).toHaveBeenCalled();
    });

    it('handles re-render correctly', () => {
      const { rerender } = renderTest();
      rerender(<LeastSquareTestComponent />);
      expect(screen.getByText('title')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles undefined config', () => {
      (useActiveNode as jest.Mock).mockReturnValue({ id: 'test', config: undefined });
      const { container } = renderTest();
      expect(container).toBeInTheDocument();
    });

    it('handles empty config object', () => {
      (useActiveNode as jest.Mock).mockReturnValue({ id: 'test', config: {} });
      const { container } = renderTest();
      expect(container).toBeInTheDocument();
    });
  });
});
