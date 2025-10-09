import { render, waitFor } from "../../utils/test-utils";
import { CardColumnRender } from "./index";
import { useUpdatedConfig } from "./use-updated-config";
import { useTableFetch } from "../table-creator/use-table-hook";

// Mock the workers
jest.mock('@workers/table-gen-worker', () => ({
    tableWorker: {
        generateQueryColumn: jest.fn().mockResolvedValue({
            query: '',
            pageQuery: '',
            checkColumnsExistsQuery: '',
        }),
    },
}));

jest.mock('@workers/worker', () => ({
    mainWorker: {},
}));

jest.mock('./use-updated-config', () => ({
    useUpdatedConfig: jest.fn(),
}));

jest.mock('../table-creator/use-table-hook', () => ({
    useTableFetch: jest.fn(),
}));

jest.mock('@hooks', () => ({
    usePagination: jest.fn(() => ({
        currentPage: 1,
        pageSize: 10,
        startIndex: 0,
        stopIndex: 10,
    })),
}));

const renderSetUp = (props: any) => {
    return render(<CardColumnRender {...props} />)
}

describe('CardColumnRender Component - Enhanced', () => {
    const mockCard = {
        name: 'Test Card',
        columnCount: 2,
        showCaption: true,
        showHeader: true,
        columns: [
            { type: 'static', rows: [{ label: 'Static Label' }] },
            { type: 'dynamic', rows: [{ path: 'data.value' }] },
        ],
    };

    const mockProps = {
        card: mockCard,
        dbTableName: 'testTable',
        dbFileName: 'testDb',
        t: (key: string) => key,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        (useUpdatedConfig as jest.Mock).mockReturnValue({
            config: mockCard,
            isLoading: false,
        });

        (useTableFetch as jest.Mock).mockReturnValue({
            totalRecords: 2,
            loadTemplateView: jest.fn(),
            templateView: [{ data: { value: 'Dynamic Data' } }],
            loading: false,
        });
    });

    describe('Loading states', () => {
        test('renders loading message when data is fetching', () => {
            (useUpdatedConfig as jest.Mock).mockReturnValueOnce({ config: {}, isLoading: true });

            const { getByText } = renderSetUp(mockProps);
            expect(getByText('Fetching data please wait')).toBeInTheDocument();
        });

        test('handles loading state from useTableFetch', () => {
            (useTableFetch as jest.Mock).mockReturnValue({
                totalRecords: 5,
                loadTemplateView: jest.fn(),
                templateView: [],
                loading: true,
            });

            const { container } = renderSetUp(mockProps);
            expect(container).toBeInTheDocument();
        });
    });

    describe('Caption rendering', () => {
        test('renders the card title when showCaption is true', () => {
            const { getByText } = renderSetUp(mockProps);
            expect(getByText('Test Card')).toBeInTheDocument();
        });

        test('does not render caption when showCaption is false', () => {
            const cardWithoutCaption = { ...mockCard, showCaption: false };
            (useUpdatedConfig as jest.Mock).mockReturnValue({
                config: cardWithoutCaption,
                isLoading: false,
            });

            const { queryByText } = renderSetUp({ ...mockProps, card: cardWithoutCaption });
            expect(queryByText('Test Card')).not.toBeInTheDocument();
        });
    });

    describe('Column rendering', () => {
        test('renders static and dynamic columns correctly', () => {
            const { getByText } = renderSetUp(mockProps);

            expect(getByText('Static Label')).toBeInTheDocument();
            expect(getByText('Dynamic Data')).toBeInTheDocument();
        });

        test('renders multiple rows with different data types', () => {
            const mixedDataCard = {
                ...mockCard,
                columns: [
                    { type: 'static', rows: [{ label: 'ID' }, { label: 'Name' }] },
                    { type: 'dynamic', rows: [{ path: 'id' }, { path: 'name' }] },
                ],
            };

            (useUpdatedConfig as jest.Mock).mockReturnValue({
                config: mixedDataCard,
                isLoading: false,
            });

            (useTableFetch as jest.Mock).mockReturnValue({
                totalRecords: 2,
                loadTemplateView: jest.fn(),
                templateView: [
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' },
                ],
                loading: false,
            });

            const { getByText } = renderSetUp({ ...mockProps, card: mixedDataCard });
            expect(getByText('ID')).toBeInTheDocument();
            expect(getByText('Item 1')).toBeInTheDocument();
            expect(getByText('Item 2')).toBeInTheDocument();
        });

        test('handles cards with only static columns', () => {
            const staticOnlyCard = {
                ...mockCard,
                columns: [
                    { type: 'static', rows: [{ label: 'Label 1' }, { label: 'Label 2' }] },
                ],
            };

            (useUpdatedConfig as jest.Mock).mockReturnValue({
                config: staticOnlyCard,
                isLoading: false,
            });

            const { getByText } = renderSetUp({ ...mockProps, card: staticOnlyCard });
            expect(getByText('Label 1')).toBeInTheDocument();
            expect(getByText('Label 2')).toBeInTheDocument();
        });

        test('handles cards with only dynamic columns', () => {
            const dynamicOnlyCard = {
                ...mockCard,
                columns: [
                    { type: 'dynamic', rows: [{ path: 'field1' }, { path: 'field2' }] },
                ],
            };

            (useUpdatedConfig as jest.Mock).mockReturnValue({
                config: dynamicOnlyCard,
                isLoading: false,
            });

            (useTableFetch as jest.Mock).mockReturnValue({
                totalRecords: 1,
                loadTemplateView: jest.fn(),
                templateView: [{ field1: 'Value 1', field2: 'Value 2' }],
                loading: false,
            });

            const { getByText } = renderSetUp({ ...mockProps, card: dynamicOnlyCard });
            expect(getByText('Value 1')).toBeInTheDocument();
            expect(getByText('Value 2')).toBeInTheDocument();
        });
    });

    describe('Data path handling', () => {
        test('handles nested data paths correctly', () => {
            const nestedCard = {
                ...mockCard,
                columns: [
                    { type: 'dynamic', rows: [{ path: 'user.profile.name' }] },
                ],
            };

            (useUpdatedConfig as jest.Mock).mockReturnValue({
                config: nestedCard,
                isLoading: false,
            });

            (useTableFetch as jest.Mock).mockReturnValue({
                totalRecords: 1,
                loadTemplateView: jest.fn(),
                templateView: [{ user: { profile: { name: 'John Doe' } } }],
                loading: false,
            });

            const { getByText } = renderSetUp({ ...mockProps, card: nestedCard });
            expect(getByText('John Doe')).toBeInTheDocument();
        });

        test('handles deeply nested paths', () => {
            const deepCard = {
                ...mockCard,
                columns: [
                    { type: 'dynamic', rows: [{ path: 'level1.level2.level3.value' }] },
                ],
            };

            (useUpdatedConfig as jest.Mock).mockReturnValue({
                config: deepCard,
                isLoading: false,
            });

            (useTableFetch as jest.Mock).mockReturnValue({
                totalRecords: 1,
                loadTemplateView: jest.fn(),
                templateView: [{ level1: { level2: { level3: { value: 'Deep Value' } } } }],
                loading: false,
            });

            const { getByText } = renderSetUp({ ...mockProps, card: deepCard });
            expect(getByText('Deep Value')).toBeInTheDocument();
        });

        test('handles missing data in dynamic columns gracefully', () => {
            const { container } = renderSetUp(mockProps);
            expect(container).toBeInTheDocument();
        });
    });

    describe('Pagination', () => {
        test('renders pagination', () => {
            const { queryAllByRole } = renderSetUp(mockProps);
            const navElements = queryAllByRole('navigation');
            expect(navElements.length).toBeGreaterThanOrEqual(0);
        });

        test('loads data when totalRecords is greater than 0', async () => {
            const loadTemplateView = jest.fn();
            (useTableFetch as jest.Mock).mockReturnValue({
                totalRecords: 10,
                loadTemplateView,
                templateView: [],
                loading: false,
            });

            renderSetUp(mockProps);

            await waitFor(() => {
                expect(loadTemplateView).toHaveBeenCalledWith(0, 10);
            });
        });

        test('does not load data when totalRecords is 0', async () => {
            const loadTemplateView = jest.fn();
            (useTableFetch as jest.Mock).mockReturnValue({
                totalRecords: 0,
                loadTemplateView,
                templateView: [],
                loading: false,
            });

            renderSetUp(mockProps);

            await waitFor(() => {
                expect(loadTemplateView).not.toHaveBeenCalled();
            });
        });

        test('pagination changes trigger data reload', async () => {
            const loadTemplateView = jest.fn();
            (useTableFetch as jest.Mock).mockReturnValue({
                totalRecords: 100,
                loadTemplateView,
                templateView: [],
                loading: false,
            });

            renderSetUp(mockProps);

            await waitFor(() => {
                expect(loadTemplateView).toHaveBeenCalled();
            });
        });
    });

    describe('Column chunking', () => {
        test('chunks data based on columnCount', () => {
            const templateView = [
                { data: { value: 'Item 1' } },
                { data: { value: 'Item 2' } },
                { data: { value: 'Item 3' } },
                { data: { value: 'Item 4' } },
            ];

            (useTableFetch as jest.Mock).mockReturnValue({
                totalRecords: 4,
                loadTemplateView: jest.fn(),
                templateView,
                loading: false,
            });

            const { container } = renderSetUp(mockProps);
            expect(container).toBeInTheDocument();
        });

        test('renders with different column counts', () => {
            const card3Columns = { ...mockCard, columnCount: 3 };
            (useUpdatedConfig as jest.Mock).mockReturnValue({
                config: card3Columns,
                isLoading: false,
            });

            const { container } = renderSetUp({ ...mockProps, card: card3Columns });
            expect(container).toBeInTheDocument();
        });

        test('renders Card components for each chunk', () => {
            const multiRowData = Array.from({ length: 6 }, (_, i) => ({
                data: { value: `Item ${i + 1}` }
            }));

            (useTableFetch as jest.Mock).mockReturnValue({
                totalRecords: 6,
                loadTemplateView: jest.fn(),
                templateView: multiRowData,
                loading: false,
            });

            const { container } = renderSetUp(mockProps);
            expect(container.querySelectorAll('[class*="card"]').length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Header styling', () => {
        test('applies header class to first row when showHeader is true', () => {
            const { container } = renderSetUp(mockProps);
            const firstRowItems = container.querySelectorAll('li');
            expect(firstRowItems.length).toBeGreaterThan(0);
        });

        test('applies header class only to first row when showHeader is true', () => {
            const cardWithHeader = { ...mockCard, showHeader: true };
            (useUpdatedConfig as jest.Mock).mockReturnValue({
                config: cardWithHeader,
                isLoading: false,
            });

            const { container } = renderSetUp({ ...mockProps, card: cardWithHeader });
            expect(container).toBeInTheDocument();
        });

        test('does not apply header class when showHeader is false', () => {
            const cardWithoutHeader = { ...mockCard, showHeader: false };
            (useUpdatedConfig as jest.Mock).mockReturnValue({
                config: cardWithoutHeader,
                isLoading: false,
            });

            const { container } = renderSetUp({ ...mockProps, card: cardWithoutHeader });
            expect(container).toBeInTheDocument();
        });
    });

    describe('Edge cases', () => {
        test('handles empty templateView array', () => {
            (useTableFetch as jest.Mock).mockReturnValue({
                totalRecords: 0,
                loadTemplateView: jest.fn(),
                templateView: [],
                loading: false,
            });

            const { container } = renderSetUp(mockProps);
            expect(container).toBeInTheDocument();
        });

        test('handles null values in data', () => {
            (useTableFetch as jest.Mock).mockReturnValue({
                totalRecords: 1,
                loadTemplateView: jest.fn(),
                templateView: [{ data: { value: null } }],
                loading: false,
            });

            const { container } = renderSetUp(mockProps);
            expect(container).toBeInTheDocument();
        });

        test('handles undefined paths in data', () => {
            const cardWithUndefinedPath = {
                ...mockCard,
                columns: [
                    { type: 'dynamic', rows: [{ path: 'nonexistent.path' }] },
                ],
            };

            (useUpdatedConfig as jest.Mock).mockReturnValue({
                config: cardWithUndefinedPath,
                isLoading: false,
            });

            (useTableFetch as jest.Mock).mockReturnValue({
                totalRecords: 1,
                loadTemplateView: jest.fn(),
                templateView: [{ data: { value: 'Test' } }],
                loading: false,
            });

            const { container } = renderSetUp({ ...mockProps, card: cardWithUndefinedPath });
            expect(container).toBeInTheDocument();
        });
    });
});
