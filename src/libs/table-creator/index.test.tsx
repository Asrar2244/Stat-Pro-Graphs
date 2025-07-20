import { render, act, fireEvent } from '@utils/test-utils';
import { TableCreator } from './index';
// import { DEFAULT_OUTPUT_TABLE_PAGE_SIZE } from '@constants';

const renderSetUp = (props = {}) => {
    const defaultProps = {
        table: {
            showHeaders: true,
            view: [],
            recordType: false,
            appendColumn: [],
            postfix: '',
            prefix: '',
            type: 'columns', // Ensure correct type
            translationColumns: [],
        },
        dbFileName: 'testFile',
        dbTableName: 'testTable',
        t: jest.fn((key) => key), // Mock translation function
        setHeaderClass: jest.fn(),
        ...props,
    };

    return {
        ...render(<TableCreator {...defaultProps} />),
        props: defaultProps,
    };
};

describe('TableCreator Component', () => {
    it('renders table with headers', async () => {
        const { getByText } = renderSetUp({
            table: {
                showHeaders: true,
                view: [['t-header1', 't-header2']],
                recordType: false,
            },
        });

        expect(getByText('t-header1')).toBeInTheDocument();
        expect(getByText('t-header2')).toBeInTheDocument();
    });

    it('renders table rows correctly', async () => {
        const { getByText } = renderSetUp({
            table: {
                showHeaders: true,
                view: [['t-header1', 't-header2'], ['row1col1', 'row1col2'], ['row2col1', 'row2col2']],
                recordType: false,
            },
        });

        expect(getByText('row1col1')).toBeInTheDocument();
        expect(getByText('row1col2')).toBeInTheDocument();
        expect(getByText('row2col1')).toBeInTheDocument();
        expect(getByText('row2col2')).toBeInTheDocument();
    });

    it('displays loading state when fetching records', async () => {
        const { getByText } = renderSetUp({
            table: { showHeaders: true, view: [] },
            loading: true,
        });

        expect(getByText('Fetching Records')).toBeInTheDocument();
    });

    it('calls setHeaderClass on render', async () => {
        const setHeaderClassMock = jest.fn();
        renderSetUp({ setHeaderClass: setHeaderClassMock });

        expect(setHeaderClassMock).toHaveBeenCalled();
    });

    it('renders pagination when recordType has a pageSize', async () => {
        const { getByRole } = renderSetUp({
            table: {
                showHeaders: true,
                view: [['t-header1', 't-header2']],
                recordType: { pageSize: 500 },
            },
        });

        expect(getByRole('navigation')).toBeInTheDocument();
    });

    it('calls loadTemplateView on pagination change', async () => {
        const loadTemplateViewMock = jest.fn();
        const { getByRole } = renderSetUp({
            table: {
                showHeaders: true,
                view: [['t-header1', 't-header2']],
                recordType: { pageSize: 500 },
            },
            loadTemplateView: loadTemplateViewMock,
        });

        act(() => {
            fireEvent.click(getByRole('button', { name: /next/i }));
        });

        expect(loadTemplateViewMock).toHaveBeenCalled();
    });
});
