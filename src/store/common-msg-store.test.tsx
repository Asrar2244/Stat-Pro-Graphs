import { useTasks } from './common-msg-store';
import { act, renderHook } from '@testing-library/react';
import { app } from '@tauri-apps/api';

jest.mock('@tauri-apps/api', () => ({
  app: {
    getVersion: jest.fn(),
  },
}));

describe('store/common-msg-store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    act(() => {
      useTasks.setState({
        commonMsg: undefined,
        tasks: undefined,
        queueTasks: undefined,
      });
    });

    (app.getVersion as jest.Mock).mockResolvedValue('1.0.0');
  });

  describe('setCommonMsg', () => {
    it('should set common message with content', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.setCommonMsg({ message: 'Test message' });
      });

      expect(result.current.commonMsg).toEqual({ message: 'Test message' });
    });

    it('should set common message with spinner', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.setCommonMsg({ message: 'Loading...', spinner: true });
      });

      expect(result.current.commonMsg).toEqual({ message: 'Loading...', spinner: true });
    });

    it('should set version message when message is empty', async () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.setCommonMsg({ message: '' }, 'Version');
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(app.getVersion).toHaveBeenCalled();
      expect(result.current.commonMsg?.message).toBe('Version:1.0.0');
    });

    // Note: Version retrieval tests are async and difficult to test reliably
    // The actual functionality is tested through integration tests
  });

  describe('setAddTask', () => {
    it('should add a new task', () => {
      const { result } = renderHook(() => useTasks());

      const task = {
        status: 'available' as const,
        description: 'Test task',
        queueType: 'analysis',
        tabId: 'tab-1',
      };

      act(() => {
        result.current.setAddTask(task);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks?.[0]).toEqual(task);
    });

    it('should not add duplicate task with same queueType and tabId', () => {
      const { result } = renderHook(() => useTasks());

      const task1 = {
        status: 'available' as const,
        queueType: 'analysis',
        tabId: 'tab-1',
      };

      const task2 = {
        status: 'away' as const,
        queueType: 'analysis',
        tabId: 'tab-1',
      };

      act(() => {
        result.current.setAddTask(task1);
      });

      act(() => {
        result.current.setAddTask(task2);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks?.[0]).toEqual(task1);
    });

    it('should add tasks with different queueType', () => {
      const { result } = renderHook(() => useTasks());

      const task1 = {
        status: 'available' as const,
        queueType: 'analysis',
        tabId: 'tab-1',
      };

      const task2 = {
        status: 'available' as const,
        queueType: 'report',
        tabId: 'tab-1',
      };

      act(() => {
        result.current.setAddTask(task1);
        result.current.setAddTask(task2);
      });

      expect(result.current.tasks).toHaveLength(2);
    });

    it('should add tasks with different tabId', () => {
      const { result } = renderHook(() => useTasks());

      const task1 = {
        status: 'available' as const,
        queueType: 'analysis',
        tabId: 'tab-1',
      };

      const task2 = {
        status: 'available' as const,
        queueType: 'analysis',
        tabId: 'tab-2',
      };

      act(() => {
        result.current.setAddTask(task1);
        result.current.setAddTask(task2);
      });

      expect(result.current.tasks).toHaveLength(2);
    });

    it('should handle all task statuses', () => {
      const { result } = renderHook(() => useTasks());

      const statuses = ['available', 'away', 'offline', 'blocked', 'do-not-disturb'] as const;

      statuses.forEach((status, index) => {
        act(() => {
          result.current.setAddTask({
            status,
            queueType: `type-${index}`,
            tabId: `tab-${index}`,
          });
        });
      });

      expect(result.current.tasks).toHaveLength(5);
    });
  });

  describe('setTaskArray', () => {
    it('should set entire task array', () => {
      const { result } = renderHook(() => useTasks());

      const tasks = [
        { status: 'available' as const, queueType: 'type1', tabId: 'tab1' },
        { status: 'away' as const, queueType: 'type2', tabId: 'tab2' },
      ];

      act(() => {
        result.current.setTaskArray(tasks);
      });

      expect(result.current.tasks).toEqual(tasks);
    });

    it('should replace existing tasks', () => {
      const { result } = renderHook(() => useTasks());

      const initialTasks = [{ status: 'available' as const, queueType: 'old', tabId: 'old' }];

      const newTasks = [
        { status: 'away' as const, queueType: 'new1', tabId: 'new1' },
        { status: 'offline' as const, queueType: 'new2', tabId: 'new2' },
      ];

      act(() => {
        result.current.setTaskArray(initialTasks);
      });

      act(() => {
        result.current.setTaskArray(newTasks);
      });

      expect(result.current.tasks).toEqual(newTasks);
      expect(result.current.tasks).toHaveLength(2);
    });

    it('should handle empty array', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.setTaskArray([
          { status: 'available' as const, queueType: 'test', tabId: 'test' },
        ]);
      });

      act(() => {
        result.current.setTaskArray([]);
      });

      expect(result.current.tasks).toEqual([]);
    });
  });

  describe('setQueueTask', () => {
    it('should add a queue task', () => {
      const { result } = renderHook(() => useTasks());

      const queueTask = {
        uuid: 'uuid-1',
        url: '/api/test',
        queueFor: 'analysis',
      };

      act(() => {
        result.current.setQueueTask(queueTask);
      });

      expect(result.current.queueTasks).toHaveLength(1);
      expect(result.current.queueTasks?.[0]).toEqual(queueTask);
    });

    it('should add multiple queue tasks', () => {
      const { result } = renderHook(() => useTasks());

      const task1 = { uuid: 'uuid-1', url: '/api/test1' };
      const task2 = { uuid: 'uuid-2', url: '/api/test2' };
      const task3 = { uuid: 'uuid-3', url: '/api/test3' };

      act(() => {
        result.current.setQueueTask(task1);
        result.current.setQueueTask(task2);
        result.current.setQueueTask(task3);
      });

      expect(result.current.queueTasks).toHaveLength(3);
    });

    it('should handle queue task with all properties', () => {
      const { result } = renderHook(() => useTasks());

      const queueTask = {
        uuid: 'uuid-1',
        url: '/api/analysis',
        parameters: { param1: 'value1' },
        queueFor: 'statistical-analysis',
        queueType: 'analysis',
        tabId: 'tab-123',
        tabName: 'Analysis Tab',
      };

      act(() => {
        result.current.setQueueTask(queueTask);
      });

      expect(result.current.queueTasks?.[0]).toEqual(queueTask);
    });

    it('should initialize queueTasks array if undefined', () => {
      const { result } = renderHook(() => useTasks());

      expect(result.current.queueTasks).toBeUndefined();

      const queueTask = { uuid: 'uuid-1' };

      act(() => {
        result.current.setQueueTask(queueTask);
      });

      expect(result.current.queueTasks).toEqual([queueTask]);
    });
  });

  describe('combined operations', () => {
    it('should handle setting all store properties', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.setCommonMsg({ message: 'Processing...' });
        result.current.setAddTask({
          status: 'available',
          queueType: 'analysis',
          tabId: 'tab1',
        });
        result.current.setQueueTask({ uuid: 'uuid-1' });
      });

      expect(result.current.commonMsg?.message).toBe('Processing...');
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.queueTasks).toHaveLength(1);
    });

    it('should maintain independence between tasks and queueTasks', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.setAddTask({
          status: 'available',
          queueType: 'type1',
          tabId: 'tab1',
        });
        result.current.setQueueTask({ uuid: 'uuid-1' });
        result.current.setQueueTask({ uuid: 'uuid-2' });
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.queueTasks).toHaveLength(2);
    });
  });
});
