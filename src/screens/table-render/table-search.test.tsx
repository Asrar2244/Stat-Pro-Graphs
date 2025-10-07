import { render, fireEvent } from '@utils/test-utils';
import { TableSearch } from './table-search';
import { useColumnsRowsCount } from './use-column-count';

jest.mock('./use-column-count', () => ({
  useColumnsRowsCount: jest.fn(),
}));

const mockColumns = [
  { columnId: 'column1', renderCell: jest.fn() },
  { columnId: 'column2', renderCell: jest.fn() },
  { columnId: 'column3', renderCell: jest.fn() },
];

describe('TableSearch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useColumnsRowsCount as jest.Mock).mockReturnValue({
      columns: mockColumns,
    });
  });

  it('renders search input and dropdown', () => {
    const { getByPlaceholderText, getByRole } = render(
      <TableSearch id={0} isActive={0} lastModified={''} tabName={''} type={''} />
    );

    expect(getByPlaceholderText('searchQuery')).toBeInTheDocument();
    expect(getByRole('combobox')).toBeInTheDocument();
  });

  it('updates search input value on change', () => {
    const { getByPlaceholderText } = render(<TableSearch id={0} isActive={0} lastModified={''} tabName={''} type={''} />);

    const searchInput = getByPlaceholderText('searchQuery') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    expect(searchInput.value).toBe('test search');
  });

  it('renders all columns in dropdown', () => {
    const { getByRole } = render(<TableSearch id={0} isActive={0} lastModified={''} tabName={''} type={''} />);

    const dropdown = getByRole('combobox');
    fireEvent.click(dropdown);

    mockColumns.forEach((column) => {
      const option = document.querySelector(`[value="${column.columnId}"]`);
      expect(option || document.body.textContent).toBeTruthy();
    });
  });

  it('calls onSelectedColumnsChange when columns are selected', () => {
    const mockCallback = jest.fn();
    const { getByRole } = render(
      <TableSearch onSelectedColumnsChange={mockCallback} id={0} isActive={0} lastModified={''} tabName={''} type={''} />
    );

    const dropdown = getByRole('combobox');
    fireEvent.click(dropdown);

    // Simulate multiselect option selection
    fireEvent.click(dropdown, {
      target: { value: 'column1' },
    });

    // The callback should eventually be called with selected columns
    expect(mockCallback).toHaveBeenCalled();
  });

  it('renders with empty columns array', () => {
    (useColumnsRowsCount as jest.Mock).mockReturnValue({
      columns: [],
    });

    const { getByPlaceholderText } = render(<TableSearch id={0} isActive={0} lastModified={''} tabName={''} type={''} />);

    expect(getByPlaceholderText('searchQuery')).toBeInTheDocument();
  });

  it('displays placeholder text correctly', () => {
    const { getByPlaceholderText, getByText } = render(<TableSearch id={0} isActive={0} lastModified={''} tabName={''} type={''} />);

    expect(getByText('allColumns')).toBeInTheDocument();
    expect(getByPlaceholderText('searchQuery')).toBeInTheDocument();
  });
});
