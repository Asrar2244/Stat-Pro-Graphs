import { renderHook, waitFor } from '@utils/test-utils';
import { useColumnsRowsCount } from './index';
import { Database } from '@utils';
import { EXCEL } from '@constants';

jest.mock('@utils', () => ({
  Database: jest.fn(),
}));

jest.mock('@store/main-store', () => ({
  useStartProStore: jest.fn(() => ({
    setBlockUI: jest.fn(),
  })),
}));

describe('hooks/columns-row-count', () => {
  let mockDb: any;
  let mockSetBlockUI: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      selectQuery: jest.fn(),
    };
    (Database as jest.Mock).mockImplementation(() => mockDb);

    mockSetBlockUI = jest.fn();
    const { useStartProStore } = require('@store/main-store');
    useStartProStore.mockReturnValue({
      setBlockUI: mockSetBlockUI,
    });
  });

  it('should fetch columns and count successfully', async () => {
    const mockColumns = [
      { name: 'column1' },
      { name: 'column2' },
      { name: 'xxx_start_pro_id' }, // Should be filtered out
      { name: 'column3' },
    ];

    const mockCount = [{ count: 100 }];

    mockDb.selectQuery
      .mockResolvedValueOnce(mockColumns)
      .mockResolvedValueOnce(mockCount);

    const { result } = renderHook(() =>
      useColumnsRowsCount({
        id: 1,
        tabName: 'test-db',
        isActive: 1,
        lastModified: '2024-01-01',
        type: 'data',
      }),
    );

    await waitFor(() => {
      expect(result.current.columns).toHaveLength(4); // Includes empty column at start
      expect(result.current.count).toBe(100);
    });

    expect(Database).toHaveBeenCalledWith('test-db');
    expect(mockDb.selectQuery).toHaveBeenCalledWith(`PRAGMA table_info(${EXCEL});`);
    expect(mockDb.selectQuery).toHaveBeenCalledWith(`SELECT COUNT(*) as count from ${EXCEL};`);

    // Verify xxx_start_pro_id is filtered
    const columnIds = result.current.columns.map((c) => c.columnId);
    expect(columnIds).not.toContain('xxx_start_pro_id');
    expect(columnIds).toContain('column1');
    expect(columnIds).toContain('column2');
    expect(columnIds).toContain('column3');
    expect(columnIds[0]).toBe(''); // First column should be empty
  });

  it('should skip row count when noRowCount is true', async () => {
    const mockColumns = [{ name: 'col1' }, { name: 'col2' }];

    mockDb.selectQuery.mockResolvedValueOnce(mockColumns);

    const { result } = renderHook(() =>
      useColumnsRowsCount({
        id: 1,
        tabName: 'test-db',
        isActive: 1,
        lastModified: '2024-01-01',
        type: 'data',
        noRowCount: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.columns).toHaveLength(2);
    });

    expect(mockDb.selectQuery).toHaveBeenCalledTimes(1);
    expect(mockDb.selectQuery).toHaveBeenCalledWith(`PRAGMA table_info(${EXCEL});`);
    expect(result.current.count).toBe(0);

    // Should not add empty column when noRowCount is true
    expect(result.current.columns[0].columnId).not.toBe('');
  });

  it('should handle empty results', async () => {
    mockDb.selectQuery.mockResolvedValueOnce([]).mockResolvedValueOnce([{ count: 0 }]);

    const { result } = renderHook(() =>
      useColumnsRowsCount({
        id: 1,
        tabName: 'test-db',
        isActive: 1,
        lastModified: '2024-01-01',
        type: 'data',
      }),
    );

    await waitFor(() => {
      expect(result.current.columns).toHaveLength(0);
    });
  });

  it('should filter out xxx_start_pro_id column', async () => {
    const mockColumns = [
      { name: 'id' },
      { name: 'xxx_start_pro_id' },
      { name: 'name' },
    ];

    mockDb.selectQuery
      .mockResolvedValueOnce(mockColumns)
      .mockResolvedValueOnce([{ count: 50 }]);

    const { result } = renderHook(() =>
      useColumnsRowsCount({
        id: 1,
        tabName: 'test-db',
        isActive: 1,
        lastModified: '2024-01-01',
        type: 'data',
      }),
    );

    await waitFor(() => {
      const columnIds = result.current.columns.map((c) => c.columnId);
      expect(columnIds).not.toContain('xxx_start_pro_id');
      expect(columnIds).toHaveLength(3); // '', 'id', 'name'
    });
  });

  it('should handle database errors', async () => {
    mockDb.selectQuery.mockRejectedValue(new Error('Database connection failed'));

    const { result } = renderHook(() =>
      useColumnsRowsCount({
        id: 1,
        tabName: 'test-db',
        isActive: 1,
        lastModified: '2024-01-01',
        type: 'data',
      }),
    );

    await waitFor(() => {
      expect(mockSetBlockUI).toHaveBeenCalledWith({
        value: true,
        msg: 'Database connection failed',
      });
    });

    expect(result.current.columns).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('should not fetch data when id is 0', async () => {
    const { result } = renderHook(() =>
      useColumnsRowsCount({
        id: 0,
        tabName: 'test-db',
        isActive: 1,
        lastModified: '2024-01-01',
        type: 'data',
      }),
    );

    expect(mockDb.selectQuery).not.toHaveBeenCalled();
    expect(result.current.columns).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('should not fetch data when id is null/undefined', async () => {
    const { result } = renderHook(() =>
      useColumnsRowsCount({
        id: null as any,
        tabName: 'test-db',
        isActive: 1,
        lastModified: '2024-01-01',
        type: 'data',
      }),
    );

    expect(mockDb.selectQuery).not.toHaveBeenCalled();
    expect(result.current.columns).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('should re-fetch when id changes', async () => {
    const mockColumns = [{ name: 'col1' }];
    mockDb.selectQuery
      .mockResolvedValueOnce(mockColumns)
      .mockResolvedValueOnce([{ count: 10 }])
      .mockResolvedValueOnce(mockColumns)
      .mockResolvedValueOnce([{ count: 20 }]);

    const { result, rerender } = renderHook(
      ({ id }) =>
        useColumnsRowsCount({
          id,
          tabName: 'test-db',
          isActive: 1,
          lastModified: '2024-01-01',
          type: 'data',
        }),
      { initialProps: { id: 1 } },
    );

    await waitFor(() => {
      expect(result.current.count).toBe(10);
    });

    rerender({ id: 2 });

    await waitFor(() => {
      expect(result.current.count).toBe(20);
    });

    expect(mockDb.selectQuery).toHaveBeenCalledTimes(4);
  });

  it('should handle count query returning no results', async () => {
    const mockColumns = [{ name: 'col1' }];
    mockDb.selectQuery.mockResolvedValueOnce(mockColumns).mockResolvedValueOnce([]);

    const { result } = renderHook(() =>
      useColumnsRowsCount({
        id: 1,
        tabName: 'test-db',
        isActive: 1,
        lastModified: '2024-01-01',
        type: 'data',
      }),
    );

    await waitFor(() => {
      expect(result.current.columns).toHaveLength(0);
    });
  });

  it('should handle multiple columns with same name property', async () => {
    const mockColumns = [
      { name: 'id', other: 'data1' },
      { name: 'name', other: 'data2' },
      { name: 'value', other: 'data3' },
    ];

    mockDb.selectQuery
      .mockResolvedValueOnce(mockColumns)
      .mockResolvedValueOnce([{ count: 5 }]);

    const { result } = renderHook(() =>
      useColumnsRowsCount({
        id: 1,
        tabName: 'test-db',
        isActive: 1,
        lastModified: '2024-01-01',
        type: 'data',
      }),
    );

    await waitFor(() => {
      expect(result.current.columns).toHaveLength(4); // '', 'id', 'name', 'value'
    });

    // Only columnId should be mapped, not other properties
    result.current.columns.forEach((col) => {
      expect(col).toHaveProperty('columnId');
    });
  });
});
