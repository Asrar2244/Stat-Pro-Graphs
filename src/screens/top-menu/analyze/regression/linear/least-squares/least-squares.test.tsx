import { render, fireEvent } from '@utils/test-utils';
import { LeastSquare } from './least-squares';
import { useActiveNode, useModal } from '@hooks';
import { usePrepareAnalysis } from './use-anayse-hook';
import { useStartProStore } from '@store/main-store';

const mockCloseModal = jest.fn();
const mockExecuteAnalysis = jest.fn();
const mockSetBlockUI = jest.fn();
jest.mock('@hooks', () => ({
    useActiveNode: jest.fn(),
}));

jest.mock('./use-anayse-hook', () => ({
    usePrepareAnalysis: jest.fn(),
}));

jest.mock('@store/main-store', () => ({
    useStartProStore: jest.fn(),
}));

jest.mock('vite', () => ({
    importMetaEnv: {},
}));

const renderTest = () => {
    return render(<LeastSquareTestComponent />)
}

const LeastSquareTestComponent = () => {
    const modal = useModal({});
    return <LeastSquare {...modal} open={true} closeModal={mockCloseModal} />
}

describe('LeastSquare Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        (useActiveNode as jest.Mock).mockReturnValue({ id: 'test-id', config: {} });
        (usePrepareAnalysis as jest.Mock).mockReturnValue({ executeAnalysis: mockExecuteAnalysis });
        (useStartProStore as unknown as jest.Mock).mockReturnValue({ setBlockUI: mockSetBlockUI });
    });

    it('renders the modal correctly', () => {
        const { getByText } = renderTest();
        expect(getByText('title')).toBeInTheDocument();
    });

    it('calls executeAnalysis and closes modal on OK button click', () => {
        const { getByText } = renderTest();
        fireEvent.click(getByText('ok'));
        expect(mockExecuteAnalysis).toHaveBeenCalledWith('test-id');
        expect(mockCloseModal).toHaveBeenCalled();
        expect(mockSetBlockUI).toHaveBeenCalledWith({ value: true, msg: 'processRequest', hideOk: true });
    });

    it('switches tabs correctly', () => {
        const { getByText } = renderTest();
        fireEvent.click(getByText('estimation'));
        expect(getByText('estimation')).toBeInTheDocument();
    });
});
