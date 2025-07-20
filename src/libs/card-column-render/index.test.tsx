import { render } from "../../utils/test-utils";
import { CardColumnRender } from "./index";
import { useUpdatedConfig } from "./use-updated-config";
import { useTableFetch } from "../table-creator/use-table-hook";

jest.mock('./use-updated-config', () => ({
    useUpdatedConfig: jest.fn(),
}));

jest.mock('../table-creator/use-table-hook', () => ({
    useTableFetch: jest.fn(),
}));
const renderSetUp = (props: any) => {
    return render(<CardColumnRender {...props} />)
}
describe('CardColumnRender Component', () => {
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

    test('renders loading message when data is fetching', () => {
        (useUpdatedConfig as jest.Mock).mockReturnValueOnce({ config: {}, isLoading: true });

        const { getByText } = renderSetUp(mockProps);
        expect(getByText('Fetching data please wait')).toBeInTheDocument();
    });

    test('renders the card title when showCaption is true', () => {
        const { getByText } = renderSetUp(mockProps);
        expect(getByText('Test Card')).toBeInTheDocument();
    });

    test('renders static and dynamic columns correctly', () => {
        const { getByText } = renderSetUp(mockProps);

        expect(getByText('Static Label')).toBeInTheDocument();

        expect(getByText('Dynamic Data')).toBeInTheDocument();
    });

    test('renders pagination', () => {
        const { getByRole } = renderSetUp(mockProps);
        expect(getByRole('navigation')).toBeInTheDocument();
    });
});
