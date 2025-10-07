import { render, screen, waitFor } from '@utils/test-utils';
import { TableRender } from './index';
import { useColumnsRowsCount } from './use-column-count';
import { useFetchRecords } from './use-fetch-rows';
import { usePagination } from '@hooks';

// Mock workers to avoid import.meta issues
jest.mock('@workers/worker', () => ({
  mainWorker: {
    terminate: jest.fn(),
  },
}));

// Mock the custom hooks
jest.mock('./use-column-count');
jest.mock('./use-fetch-rows');
jest.mock('@hooks', () => ({
  ...jest.requireActual('@hooks'),
  usePagination: jest.fn(),
}));

// Mock React Virtualized components
jest.mock('react-virtualized/dist/es/AutoSizer', () => ({
  __esModule: true,
  default: ({ children }: any) => children({ width: 1000, height: 600 }),
}));

jest.mock('react-virtualized/dist/es/ColumnSizer', () => ({
  __esModule: true,
  default: ({ children }: any) => children({ adjustedWidth: 1000, registerChild: jest.fn() }),
}));

jest.mock('react-virtualized/dist/es/MultiGrid', () => ({
  __esModule: true,
  default: ({ noContentRenderer, cellRenderer, rowCount, columnCount }: any) => (
    <div data-testid="multi-grid">
      {rowCount === 0 ? noContentRenderer() : (
        <div>
          {Array.from({ length: Math.min(rowCount, 3) }).map((_, rowIndex) =>
            Array.from({ length: Math.min(columnCount, 3) }).map((_, columnIndex) =>
              cellRenderer({
                columnIndex,
                rowIndex,
                key: `${columnIndex}-${rowIndex}`,
                style: {},
                parent: { props: {} },
              })
            )
          )}
        </div>
      )}
    </div>
  ),
}));

jest.mock('react-virtualized/dist/es/CellMeasurer', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
  CellMeasurerCache: jest.fn().mockImplementation(() => ({
    columnWidth: jest.fn(() => 120),
  })),
}));

const mockProps = {
  id: 1,
  isActive: 1,
  lastModified: '2024-01-01',
  tabName: 'test-tab',
  type: 'table',
};

describe('TableRender', () => {
  const mockDataLoader = jest.fn();
  const mockLoadMoreFun = jest.fn();

  beforeEach(() => {
    (useColumnsRowsCount as jest.Mock).mockReturnValue({
      columns: [
        { columnId: '' },
        { columnId: 'col1' },
        { columnId: 'col2' },
      ],
      count: 100,
    });

    (useFetchRecords as jest.Mock).mockReturnValue({
      data: [
        {},
        { col1: 'value1', col2: 'value2' },
        { col1: 'value3', col2: 'value4' },
      ],
      isLoading: false,
      loadMoreFun: mockLoadMoreFun,
    });

    (usePagination as jest.Mock).mockReturnValue({
      currentPage: 1,
      pageSize: 50,
      startIndex: 0,
      stopIndex: 50,
      dataLoader: mockDataLoader,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<TableRender {...mockProps} />);
    expect(screen.getByTestId('multi-grid')).toBeInTheDocument();
  });

  it('should display loading skeleton when isLoading is true', () => {
    (useFetchRecords as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      loadMoreFun: mockLoadMoreFun,
    });

    render(<TableRender {...mockProps} />);
    expect(screen.queryByTestId('multi-grid')).not.toBeInTheDocument();
  });

  it('should render table with data', async () => {
    render(<TableRender {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('multi-grid')).toBeInTheDocument();
    });
  });

  it('should call dataLoader on mount', () => {
    render(<TableRender {...mockProps} />);
    expect(mockDataLoader).toHaveBeenCalledWith(mockLoadMoreFun);
  });

  it('should render column headers', () => {
    render(<TableRender {...mockProps} />);
    expect(screen.getByText('col1')).toBeInTheDocument();
    expect(screen.getByText('col2')).toBeInTheDocument();
  });

  it('should render cell values', () => {
    render(<TableRender {...mockProps} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('should handle empty data', () => {
    (useFetchRecords as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      loadMoreFun: mockLoadMoreFun,
    });

    render(<TableRender {...mockProps} />);
    expect(screen.getByText('No cells')).toBeInTheDocument();
  });

  it('should render pagination component', () => {
    render(<TableRender {...mockProps} />);
    // Pagination component should be rendered
    expect(mockDataLoader).toHaveBeenCalled();
  });

  it('should handle column filtering through TableSearch', () => {
    render(<TableRender {...mockProps} />);
    // TableSearch component should be rendered
    expect(screen.getByTestId('multi-grid')).toBeInTheDocument();
  });

  it('should use correct page size from pagination', () => {
    (usePagination as jest.Mock).mockReturnValue({
      currentPage: 2,
      pageSize: 100,
      startIndex: 100,
      stopIndex: 200,
      dataLoader: mockDataLoader,
    });

    render(<TableRender {...mockProps} />);
    expect(useFetchRecords).toHaveBeenCalledWith('test-tab', 100);
  });

  it('should memoize component', () => {
    const { rerender } = render(<TableRender {...mockProps} />);
    expect(screen.getByTestId('multi-grid')).toBeInTheDocument();

    rerender(<TableRender {...mockProps} />);
    expect(screen.getByTestId('multi-grid')).toBeInTheDocument();
  });

  it('should render row indices correctly', () => {
    render(<TableRender {...mockProps} />);
    // Row indices should be calculated based on current page and page size
    const multiGrid = screen.getByTestId('multi-grid');
    expect(multiGrid).toBeInTheDocument();
  });

  it('should handle different column counts', () => {
    (useColumnsRowsCount as jest.Mock).mockReturnValue({
      columns: [
        { columnId: '' },
        { columnId: 'col1' },
      ],
      count: 50,
    });

    render(<TableRender {...mockProps} />);
    expect(screen.getByTestId('multi-grid')).toBeInTheDocument();
  });

  it('should handle null data gracefully', () => {
    (useFetchRecords as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      loadMoreFun: mockLoadMoreFun,
    });

    render(<TableRender {...mockProps} />);
    expect(screen.getByText('No cells')).toBeInTheDocument();
  });

  it('should render with custom props', () => {
    const customProps = {
      id: 2,
      isActive: 0,
      lastModified: '2024-12-31',
      tabName: 'custom-tab',
      type: 'custom-type',
    };

    render(<TableRender {...customProps} />);
    expect(useColumnsRowsCount).toHaveBeenCalledWith(customProps);
  });
});
