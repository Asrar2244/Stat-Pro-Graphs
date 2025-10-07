import { renderHook, waitFor } from '@utils/test-utils';
import { useActiveNode, useNodeActions } from './index';
import { Actions, DockLocation } from 'flexlayout-react';

// Mock dependencies
jest.mock('@store', () => ({
  useStartProStore: jest.fn(),
}));

jest.mock('zustand/react/shallow', () => ({
  useShallow: jest.fn((fn) => fn),
}));

jest.mock('@utils/db', () => ({
  Database: jest.fn(),
}));

jest.mock('@backend/project', () => ({
  updateDataProjectClose: 'UPDATE_DATA_CLOSE',
  updateOutputProjectClose: 'UPDATE_OUTPUT_CLOSE',
}));

describe('hooks/layout-nodes', () => {
  describe('useActiveNode', () => {
    let mockModel: any;

    beforeEach(() => {
      jest.clearAllMocks();

      mockModel = {
        getActiveTabset: jest.fn(),
        doAction: jest.fn(),
        getNodeById: jest.fn(),
      };

      const { useStartProStore } = require('@store');
      (useStartProStore as jest.Mock).mockReturnValue({ model: mockModel });
    });

    it('should handle no active tab', () => {
      mockModel.getActiveTabset.mockReturnValue({
        getSelectedNode: jest.fn().mockReturnValue(null),
      });

      const { result } = renderHook(() => useActiveNode([]));

      expect(result.current).toBeDefined();
    });

    it('should return active tab config when available', () => {
      const mockTab = {
        id: 'DATA-1',
        name: 'Test Tab',
        config: {
          bareType: 'DATA',
          id: 1,
          isActive: 1,
          lastModified: '2024-01-01',
          tabName: 'test.csv',
          type: 'data',
          workspacePath: '/test/path',
          inputFileName: 'test.csv',
        },
      };

      mockModel.getActiveTabset.mockReturnValue({
        getSelectedNode: jest.fn().mockReturnValue({
          toJson: jest.fn().mockReturnValue(mockTab),
        }),
      });

      const { result } = renderHook(() => useActiveNode([]));

      expect(result.current.id).toBe('DATA-1');
      expect(result.current.name).toBe('Test Tab');
      expect(result.current.config.bareType).toBe('DATA');
    });

    it('should handle workspace explorer tab', () => {
      const mockTab = {
        id: 'workspace-explorer',
        config: {},
      };

      mockModel.getActiveTabset.mockReturnValue({
        getSelectedNode: jest.fn().mockReturnValue({
          toJson: jest.fn().mockReturnValue(mockTab),
        }),
      });

      const { result } = renderHook(() => useActiveNode([]));

      // Should still return a result
      expect(result.current).toBeDefined();
    });

    it('should update when dependency changes', () => {
      const mockTab = {
        id: 'DATA-1',
        config: { bareType: 'DATA', id: 1 },
      };

      mockModel.getActiveTabset.mockReturnValue({
        getSelectedNode: jest.fn().mockReturnValue({
          toJson: jest.fn().mockReturnValue(mockTab),
        }),
      });

      const { rerender } = renderHook(({ deps }) => useActiveNode(deps), {
        initialProps: { deps: [1] },
      });

      rerender({ deps: [2] });

      expect(mockModel.getActiveTabset).toHaveBeenCalled();
    });
  });

  describe('useNodeActions', () => {
    let mockModel: any;
    let mockSetBlockUI: jest.Mock;
    let mockSetRenderLatestRun: jest.Mock;
    let mockDb: any;

    beforeEach(() => {
      jest.clearAllMocks();

      mockSetBlockUI = jest.fn();
      mockSetRenderLatestRun = jest.fn();

      mockModel = {
        doAction: jest.fn(),
        getNodeById: jest.fn(),
        getActiveTabset: jest.fn(),
      };

      const { useStartProStore } = require('@store');
      (useStartProStore as jest.Mock).mockReturnValue({
        model: mockModel,
        setBlockUI: mockSetBlockUI,
        setRenderLatestRun: mockSetRenderLatestRun,
      });

      mockDb = {
        executeQuery: jest.fn().mockResolvedValue(undefined),
      };

      const { Database } = require('@utils/db');
      (Database as jest.Mock).mockImplementation(() => mockDb);
    });

    it('should select tab by id', () => {
      const { result } = renderHook(() => useNodeActions());

      result.current.selectTab('DATA-1');

      expect(mockModel.doAction).toHaveBeenCalledWith(Actions.selectTab('DATA-1'));
    });

    it('should get open records', () => {
      const mockChildren = [
        { getId: jest.fn().mockReturnValue('DATA-1') },
        { getId: jest.fn().mockReturnValue('DATA-2') },
      ];

      mockModel.getNodeById.mockReturnValue({
        getChildren: jest.fn().mockReturnValue(mockChildren),
      });

      const { result } = renderHook(() => useNodeActions());

      const data = { id: 1, projectName: 'Test' };
      const records = result.current.getOpenRecords(data as any, 'DATA');

      expect(records.record).toBeDefined();
      expect(records.nextIndex).toBe(2);
    });

    it('should open new tab when not already open', () => {
      mockModel.getNodeById.mockReturnValue({
        getChildren: jest.fn().mockReturnValue([]),
      });

      const { result } = renderHook(() => useNodeActions());

      const data = {
        id: 1,
        projectName: 'Test Project',
        workspacePath: '/test/path',
        modifiedDateTime: '2024-01-01',
        isActive: 1,
        inputFileName: 'test.csv',
      };

      const t = jest.fn((key) => key);

      result.current.openNewTab(data as any, 1, 'DATA', t);

      expect(mockModel.doAction).toHaveBeenCalledWith(
        Actions.addNode(
          expect.objectContaining({
            type: 'tab',
            id: 'DATA-1',
            name: 'Test Project',
          }),
          'layout-tabs',
          DockLocation.CENTER,
          0,
          true
        )
      );
    });

    it('should select existing tab if already open', async () => {
      const mockRecord = { getId: jest.fn().mockReturnValue('DATA-1') };
      mockModel.getNodeById.mockReturnValue({
        getChildren: jest.fn().mockReturnValue([mockRecord]),
      });

      const { result } = renderHook(() => useNodeActions());

      const data = { id: 1, projectName: 'Test' };
      const t = jest.fn();

      result.current.openNewTab(data as any, 1, 'DATA', t);

      expect(mockModel.doAction).toHaveBeenCalledWith(Actions.selectTab('DATA-1'));
    });

    it('should close active DATA tab', async () => {
      mockModel.getActiveTabset.mockReturnValue({
        getSelectedNode: jest.fn().mockReturnValue({
          getId: jest.fn().mockReturnValue('DATA-1'),
        }),
      });

      const { result } = renderHook(() => useNodeActions());

      await result.current.closeActiveTab();

      await waitFor(() => {
        expect(mockDb.executeQuery).toHaveBeenCalledWith('UPDATE_DATA_CLOSE', ['1']);
      });

      await waitFor(() => {
        expect(mockModel.doAction).toHaveBeenCalledWith(Actions.deleteTab('DATA-1'));
      });
    });

    it('should close active OUTPUT tab', async () => {
      mockModel.getActiveTabset.mockReturnValue({
        getSelectedNode: jest.fn().mockReturnValue({
          getId: jest.fn().mockReturnValue('OUTPUT-2'),
        }),
      });

      const { result } = renderHook(() => useNodeActions());

      await result.current.closeActiveTab();

      await waitFor(() => {
        expect(mockDb.executeQuery).toHaveBeenCalledWith('UPDATE_OUTPUT_CLOSE', ['2']);
      });
    });

    it('should not close tab with invalid type', async () => {
      mockModel.getActiveTabset.mockReturnValue({
        getSelectedNode: jest.fn().mockReturnValue({
          getId: jest.fn().mockReturnValue('UNKNOWN-1'),
        }),
      });

      const { result } = renderHook(() => useNodeActions());

      await result.current.closeActiveTab();

      expect(mockDb.executeQuery).not.toHaveBeenCalled();
      expect(mockModel.doAction).not.toHaveBeenCalled();
    });

    it('should handle close tab error', async () => {
      mockModel.getActiveTabset.mockReturnValue({
        getSelectedNode: jest.fn().mockReturnValue({
          getId: jest.fn().mockReturnValue('DATA-1'),
        }),
      });

      mockDb.executeQuery.mockRejectedValue(new Error('Close failed'));

      const { result } = renderHook(() => useNodeActions());

      await result.current.closeActiveTab();

      await waitFor(() => {
        expect(mockSetBlockUI).toHaveBeenCalledWith({
          value: true,
          msg: 'Close failed',
        });
      });
    });

    it('should update node attributes', () => {
      const { result } = renderHook(() => useNodeActions());

      const config = { name: 'Updated' };
      result.current.updateNodeAttributes('DATA-1', config);

      expect(mockModel.doAction).toHaveBeenCalledWith(
        Actions.updateNodeAttributes('DATA-1', config)
      );
    });

    it('should trigger render latest run when selecting existing tab', async () => {
      jest.useFakeTimers();

      const mockRecord = { getId: jest.fn().mockReturnValue('OUTPUT-1') };
      mockModel.getNodeById.mockReturnValue({
        getChildren: jest.fn().mockReturnValue([mockRecord]),
      });

      const { result } = renderHook(() => useNodeActions());

      const data = { id: 1, projectName: 'Test' };
      const t = jest.fn();

      result.current.openNewTab(data as any, 1, 'OUTPUT', t);

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(mockSetRenderLatestRun).toHaveBeenCalledWith(true);
      });

      jest.useRealTimers();
    });
  });
});
