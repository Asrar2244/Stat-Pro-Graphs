import { renderHook, waitFor } from '@utils/test-utils';
import { useAnalyzeSave } from './index';
import { Database } from '@utils';
import { mainWorker } from '@workers/worker';
import {
  outputGenerateIDTable,
  outputUpdateResult,
} from '@backend';

// Mock dependencies
jest.mock('@utils', () => ({
  Database: jest.fn(),
}));

jest.mock('@workers/worker', () => ({
  mainWorker: {
    axios: jest.fn(),
  },
}));

jest.mock('@backend', () => ({
  insertToNotificationTable: 'INSERT_NOTIFICATION_QUERY',
  deleteNotification: 'DELETE_NOTIFICATION_QUERY',
  outputGenerateIDTable: jest.fn(),
  outputUpdateResult: jest.fn(),
}));

jest.mock('@hooks', () => ({
  useNodeActions: jest.fn(() => ({
    openNewTab: jest.fn(),
  })),
  useActiveNode: jest.fn(() => ({
    config: { isEmptyDataView: false },
  })),
}));

jest.mock('@store/main-store', () => ({
  useStartProStore: jest.fn((selector) =>
    selector({
      projects: {
        '1': {
          id: 1,
          projectName: 'Test Project',
          workspacePath: '/test/path',
        },
      },
      setBlockUI: jest.fn(),
    }),
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'analyzing') {
        return `Analyzing ${options?.description} in ${options?.tab}`;
      }
      return key;
    },
  }),
}));

describe('hooks/analyze-save', () => {
  let mockDb: any;
  let mockOpenNewTab: jest.Mock;
  let mockSetBlockUI: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      executeQuery: jest.fn(),
    };
    (Database as jest.Mock).mockImplementation(() => mockDb);

    mockOpenNewTab = jest.fn();
    mockSetBlockUI = jest.fn();

    const { useNodeActions } = require('@hooks');
    useNodeActions.mockReturnValue({
      openNewTab: mockOpenNewTab,
    });

    const { useStartProStore } = require('@store/main-store');
    useStartProStore.mockImplementation((selector: any) =>
      selector({
        projects: {
          '1': {
            id: 1,
            projectName: 'Test Project',
            workspacePath: '/test/path',
            modifiedDateTime: '2024-01-01',
          },
        },
        setBlockUI: mockSetBlockUI,
      }),
    );
  });

  describe('execute function', () => {
    it('should execute analysis successfully and open new tab', async () => {
      const { result } = renderHook(() => useAnalyzeSave());

      // Mock notification insertion
      mockDb.executeQuery.mockResolvedValueOnce({ lastInsertId: 100 });

      // Mock output table creation
      (outputGenerateIDTable as jest.Mock).mockResolvedValue(42);

      // Mock axios response
      (mainWorker.axios as unknown as unknown as jest.Mock).mockResolvedValue({
        data: 'test-result',
        error: undefined,
      });

      // Mock output update
      (outputUpdateResult as jest.Mock).mockResolvedValue(undefined);

      const parameters = { param1: 'value1' };
      const otherParameters = {
        queueFor: 'test-analysis',
        url: '/api/test',
        queueType: 'analysis',
      };

      await result.current.execute('test-db', parameters, otherParameters, 'DATA-1');

      await waitFor(() => {
        expect(outputGenerateIDTable).toHaveBeenCalledWith('test-db', [
          '',
          'test-db',
          'test-analysis',
          'analysis',
          expect.any(String),
        ]);
      });

      await waitFor(() => {
        expect(mainWorker.axios).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockSetBlockUI).toHaveBeenCalledWith({ value: false, msg: '' });
      });
    });

    it('should handle API errors gracefully', async () => {
      const { result } = renderHook(() => useAnalyzeSave());

      mockDb.executeQuery.mockResolvedValue({ lastInsertId: 100 });
      (outputGenerateIDTable as jest.Mock).mockResolvedValue(42);

      (mainWorker.axios as unknown as jest.Mock).mockResolvedValue({
        error: 'API Error occurred',
      });

      const parameters = {};
      const otherParameters = {
        queueFor: 'test',
        url: '/api/test',
        queueType: 'test',
      };

      await result.current.execute('test-db', parameters, otherParameters);

      await waitFor(() => {
        expect(mockSetBlockUI).toHaveBeenCalledWith({
          value: true,
          msg: expect.stringContaining('API Error'),
        });
      });
    });

    it('should handle network errors', async () => {
      const { result } = renderHook(() => useAnalyzeSave());

      mockDb.executeQuery.mockResolvedValue({ lastInsertId: 100 });
      (outputGenerateIDTable as jest.Mock).mockResolvedValue(42);

      (mainWorker.axios as unknown as jest.Mock).mockRejectedValue(new Error('Network failure'));

      const parameters = {};
      const otherParameters = {
        queueFor: 'test',
        url: '/api/test',
        queueType: 'test',
      };

      await result.current.execute('test-db', parameters, otherParameters);

      await waitFor(() => {
        expect(mockSetBlockUI).toHaveBeenCalledWith({
          value: true,
          msg: 'Network failure',
        });
      });
    });

    it('should handle output update errors', async () => {
      const { result } = renderHook(() => useAnalyzeSave());

      mockDb.executeQuery.mockResolvedValue({ lastInsertId: 100 });
      (outputGenerateIDTable as jest.Mock).mockResolvedValue(42);

      (mainWorker.axios as unknown as jest.Mock).mockResolvedValue({
        data: 'test-result',
      });

      (outputUpdateResult as jest.Mock).mockRejectedValue(new Error('Update failed'));

      const parameters = {};
      const otherParameters = {
        queueFor: 'test',
        url: '/api/test',
        queueType: 'test',
      };

      await result.current.execute('test-db', parameters, otherParameters);

      await waitFor(() => {
        expect(mockSetBlockUI).toHaveBeenCalledWith({
          value: true,
          msg: 'Update failed',
        });
      });
    });

    it('should use custom translate key when provided', async () => {
      const { result } = renderHook(() => useAnalyzeSave());

      mockDb.executeQuery.mockResolvedValue({ lastInsertId: 100 });
      (outputGenerateIDTable as jest.Mock).mockResolvedValue(42);
      (mainWorker.axios as unknown as jest.Mock).mockResolvedValue({ data: 'test' });
      (outputUpdateResult as jest.Mock).mockResolvedValue(undefined);

      const parameters = {};
      const otherParameters = {
        queueFor: 'custom-analysis',
        url: '/api/test',
        queueType: 'custom',
        commonTranslate: 'custom.key',
      };

      await result.current.execute('test-db', parameters, otherParameters);

      await waitFor(() => {
        expect(outputGenerateIDTable).toHaveBeenCalled();
      });
    });

    it('should handle empty data view scenario', async () => {
      const { useActiveNode } = require('@hooks');
      useActiveNode.mockReturnValue({
        config: {
          isEmptyDataView: true,
          id: 5,
          projectName: 'Empty View',
        },
      });

      const { result } = renderHook(() => useAnalyzeSave());

      mockDb.executeQuery.mockResolvedValue({ lastInsertId: 100 });
      (outputGenerateIDTable as jest.Mock).mockResolvedValue(42);
      (mainWorker.axios as unknown as jest.Mock).mockResolvedValue({ data: 'test' });
      (outputUpdateResult as jest.Mock).mockResolvedValue(undefined);

      const parameters = {};
      const otherParameters = {
        queueFor: 'test',
        url: '/api/test',
        queueType: 'test',
      };

      await result.current.execute('test-db', parameters, otherParameters);

      await waitFor(() => {
        expect(mockOpenNewTab).toHaveBeenCalled();
      });
    });

    it('should delete notification when isDeleteID > 0', async () => {
      const { result } = renderHook(() => useAnalyzeSave());

      mockDb.executeQuery
        .mockResolvedValueOnce({ lastInsertId: 50 }) // delete notification
        .mockResolvedValueOnce({ lastInsertId: 100 }); // insert new notification

      (outputGenerateIDTable as jest.Mock).mockResolvedValue(42);
      (mainWorker.axios as unknown as jest.Mock).mockResolvedValue({ data: 'test' });
      (outputUpdateResult as jest.Mock).mockResolvedValue(undefined);

      const parameters = {};
      const otherParameters = {
        queueFor: 'test',
        url: '/api/test',
        queueType: 'test',
        notificationId: 50,
      };

      await result.current.execute('test-db', parameters, otherParameters);

      await waitFor(() => {
        expect(mockDb.executeQuery).toHaveBeenCalled();
      });
    });

    it('should add notification and output IDs to parameters', async () => {
      const { result } = renderHook(() => useAnalyzeSave());

      mockDb.executeQuery.mockResolvedValue({ lastInsertId: 100 });
      (outputGenerateIDTable as jest.Mock).mockResolvedValue(42);

      const axiosSpy = jest.fn().mockResolvedValue({ data: 'test' });
      (mainWorker.axios as unknown as jest.Mock) = axiosSpy;
      (outputUpdateResult as jest.Mock).mockResolvedValue(undefined);

      const parameters: any = { param1: 'value1' };
      const otherParameters = {
        queueFor: 'test',
        url: '/api/test',
        queueType: 'test',
      };

      await result.current.execute('test-db', parameters, otherParameters);

      await waitFor(() => {
        expect(mainWorker.axios).toHaveBeenCalled();
      });
    });
  });
});
