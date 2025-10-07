import { render, screen } from '@utils/test-utils';
import { CardTableRender } from './index';
import { ITableCreator } from '@utils';

// Mock TableCreator component
jest.mock('../table-creator', () => ({
  TableCreator: ({ table, setHeaderClass }: any) => (
    <div data-testid="table-creator">
      Mock Table: {table.name}
      <button onClick={() => setHeaderClass('hidden')}>Toggle</button>
    </div>
  ),
}));

const mockTranslate = jest.fn((key: string | string[]) => {
  if (Array.isArray(key)) {
    return key[0];
  }
  return key;
});

const mockTable: ITableCreator = {
  name: 'Test Table',
  showCaption: true,
  view: [],
  recordType: undefined
};

const defaultProps = {
  t: mockTranslate,
  table: mockTable,
  dbFileName: 'test.db',
  dbTableName: 'test_table',
};

describe('CardTableRender', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<CardTableRender {...defaultProps} />);
    expect(screen.getByTestId('table-creator')).toBeInTheDocument();
  });

  it('should render card header when showCaption is true', () => {
    render(<CardTableRender {...defaultProps} />);
    expect(screen.getByText('Test Table')).toBeInTheDocument();
  });

  it('should not render card header when showCaption is false', () => {
    const propsWithoutCaption = {
      ...defaultProps,
      table: { ...mockTable, showCaption: false },
    };
    render(<CardTableRender {...propsWithoutCaption} />);
    expect(screen.queryByText('Test Table')).not.toBeInTheDocument();
  });

  it('should translate table name using t function', () => {
    render(<CardTableRender {...defaultProps} />);
    expect(mockTranslate).toHaveBeenCalledWith('Test Table');
  });

  it('should pass correct props to TableCreator', () => {
    render(<CardTableRender {...defaultProps} />);
    expect(screen.getByText(/Mock Table: Test Table/)).toBeInTheDocument();
  });

  it('should render with custom db file and table names', () => {
    const customProps = {
      ...defaultProps,
      dbFileName: 'custom.db',
      dbTableName: 'custom_table',
    };
    render(<CardTableRender {...customProps} />);
    expect(screen.getByTestId('table-creator')).toBeInTheDocument();
  });

  it('should handle different table configurations', () => {
    const differentTable: ITableCreator = {
      name: 'Different Table',
      showCaption: true,
      view: [],
      recordType: undefined
    };

    render(<CardTableRender {...defaultProps} table={differentTable} />);
    expect(screen.getByText('Different Table')).toBeInTheDocument();
  });

  it('should initialize with "show" header class', () => {
    const { container } = render(<CardTableRender {...defaultProps} />);
    const card = container.querySelector('.show');
    expect(card).toBeInTheDocument();
  });

  it('should handle empty table name', () => {
    const emptyNameTable = { ...mockTable, name: '' };
    render(<CardTableRender {...defaultProps} table={emptyNameTable} />);
    expect(screen.getByTestId('table-creator')).toBeInTheDocument();
  });

  it('should render with additional props passed to div', () => {
    const additionalProps = {
      ...defaultProps,
      'data-custom': 'test',
    };
    const { container } = render(<CardTableRender {...additionalProps as any} />);
    expect(container.querySelector('[data-custom="test"]')).toBeInTheDocument();
  });

  it('should handle table with multiple columns', () => {
    const multiColumnTable: ITableCreator = {
      name: 'Multi Column Table',
      showCaption: true,
      view: [],
      recordType: undefined
    };

    render(<CardTableRender {...defaultProps} table={multiColumnTable} />);
    expect(screen.getByText('Multi Column Table')).toBeInTheDocument();
  });

  it('should handle table with empty data', () => {
    const emptyDataTable = {
      ...mockTable,
      data: [],
    };
    render(<CardTableRender {...defaultProps} table={emptyDataTable} />);
    expect(screen.getByTestId('table-creator')).toBeInTheDocument();
  });
});
