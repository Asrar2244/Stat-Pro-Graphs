import { renderHook, } from '@utils/test-utils';
import { useMenuCodeExecutor } from './index';
import * as utils from '@utils';

// Mock dependencies
jest.mock('../layout-nodes', () => ({
  useNodeActions: jest.fn(),
}));

jest.mock('@utils', () => ({
  uniqueNumber: jest.fn(() => 12345),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

describe('hooks/menu-code-execute', () => {
  let mockOpenNewTab: jest.Mock;
  let mockT: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOpenNewTab = jest.fn();
    mockT = jest.fn((key) => key);

    const { useNodeActions } = require('../layout-nodes');
    useNodeActions.mockReturnValue({
      openNewTab: mockOpenNewTab,
    });

    const { useTranslation } = require('react-i18next');
    useTranslation.mockReturnValue({
      t: mockT,
    });
  });

  describe('openNewTabAction', () => {
    it('should open new tab with correct parameters', () => {
      const { result } = renderHook(() => useMenuCodeExecutor());

      const input = {
        id: 'test-id',
        isEmptyDataView: false,
      };

      result.current.openNewTabAction(input);

      expect(utils.uniqueNumber).toHaveBeenCalled();
      expect(mockOpenNewTab).toHaveBeenCalledWith(
        {
          fileSize: '',
          isOpenedData: 12345,
          isActive: 12345,
          modifiedDateTime: '',
          createdDateTime: '',
          isOpenedOutput: 12345,
          workspacePath: expect.any(String), // dayjs formatted time
          id: '12345',
          sheetId: 'test-id',
          inputFileName: 'test-id',
          projectName: expect.any(String), // dayjs formatted date
          isEmptyDataView: false,
        },
        12345,
        'test-id',
        mockT,
      );
    });

    it('should handle isEmptyDataView true', () => {
      const { result } = renderHook(() => useMenuCodeExecutor());

      const input = {
        id: 'empty-view-id',
        isEmptyDataView: true,
      };

      result.current.openNewTabAction(input);

      expect(mockOpenNewTab).toHaveBeenCalledWith(
        expect.objectContaining({
          isEmptyDataView: true,
          sheetId: 'empty-view-id',
        }),
        expect.any(Number),
        'empty-view-id',
        mockT,
      );
    });

    it('should handle isEmptyDataView undefined', () => {
      const { result } = renderHook(() => useMenuCodeExecutor());

      const input = {
        id: 'no-empty-view',
      };

      result.current.openNewTabAction(input);

      expect(mockOpenNewTab).toHaveBeenCalledWith(
        expect.objectContaining({
          isEmptyDataView: undefined,
        }),
        expect.any(Number),
        'no-empty-view',
        mockT,
      );
    });

    it('should generate unique number for each call', () => {
      (utils.uniqueNumber as jest.Mock)
        .mockReturnValueOnce(111)
        .mockReturnValueOnce(222)
        .mockReturnValueOnce(333);

      const { result } = renderHook(() => useMenuCodeExecutor());

      result.current.openNewTabAction({ id: 'test-1' });
      expect(mockOpenNewTab).toHaveBeenCalledWith(
        expect.objectContaining({ id: '111' }),
        111,
        'test-1',
        mockT,
      );

      result.current.openNewTabAction({ id: 'test-2' });
      expect(mockOpenNewTab).toHaveBeenCalledWith(
        expect.objectContaining({ id: '222' }),
        222,
        'test-2',
        mockT,
      );

      result.current.openNewTabAction({ id: 'test-3' });
      expect(mockOpenNewTab).toHaveBeenCalledWith(
        expect.objectContaining({ id: '333' }),
        333,
        'test-3',
        mockT,
      );
    });

    it('should format workspacePath as time', () => {
      const { result } = renderHook(() => useMenuCodeExecutor());

      result.current.openNewTabAction({ id: 'time-test' });

      const callArgs = mockOpenNewTab.mock.calls[0][0];
      const workspacePath = callArgs.workspacePath;

      // Check if it matches time format (hh:mm:ss A)
      expect(workspacePath).toMatch(/\d{2}:\d{2}:\d{2} (AM|PM)/);
    });

    it('should format projectName as date', () => {
      const { result } = renderHook(() => useMenuCodeExecutor());

      result.current.openNewTabAction({ id: 'date-test' });

      const callArgs = mockOpenNewTab.mock.calls[0][0];
      const projectName = callArgs.projectName;

      // Check if it matches date format (YYYY-MM-DD)
      expect(projectName).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should use input id for sheetId and inputFileName', () => {
      const { result } = renderHook(() => useMenuCodeExecutor());

      const input = {
        id: 'specific-sheet-id',
      };

      result.current.openNewTabAction(input);

      expect(mockOpenNewTab).toHaveBeenCalledWith(
        expect.objectContaining({
          sheetId: 'specific-sheet-id',
          inputFileName: 'specific-sheet-id',
        }),
        expect.any(Number),
        'specific-sheet-id',
        mockT,
      );
    });

    it('should set empty strings for fileSize, modifiedDateTime, createdDateTime', () => {
      const { result } = renderHook(() => useMenuCodeExecutor());

      result.current.openNewTabAction({ id: 'test' });

      expect(mockOpenNewTab).toHaveBeenCalledWith(
        expect.objectContaining({
          fileSize: '',
          modifiedDateTime: '',
          createdDateTime: '',
        }),
        expect.any(Number),
        expect.any(String),
        mockT,
      );
    });

    it('should use same unique number for all id fields', () => {
      (utils.uniqueNumber as jest.Mock).mockReturnValue(99999);

      const { result } = renderHook(() => useMenuCodeExecutor());

      result.current.openNewTabAction({ id: 'test' });

      expect(mockOpenNewTab).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpenedData: 99999,
          isActive: 99999,
          isOpenedOutput: 99999,
          id: '99999',
        }),
        99999,
        expect.any(String),
        mockT,
      );
    });

    it('should handle different id types', () => {
      const { result } = renderHook(() => useMenuCodeExecutor());

      // String ID
      result.current.openNewTabAction({ id: 'string-id' });
      expect(mockOpenNewTab).toHaveBeenLastCalledWith(
        expect.objectContaining({ sheetId: 'string-id' }),
        expect.any(Number),
        'string-id',
        mockT,
      );

      // Numeric-looking string ID
      result.current.openNewTabAction({ id: '12345' });
      expect(mockOpenNewTab).toHaveBeenLastCalledWith(
        expect.objectContaining({ sheetId: '12345' }),
        expect.any(Number),
        '12345',
        mockT,
      );

      // UUID-like ID
      result.current.openNewTabAction({ id: 'abc-123-def-456' });
      expect(mockOpenNewTab).toHaveBeenLastCalledWith(
        expect.objectContaining({ sheetId: 'abc-123-def-456' }),
        expect.any(Number),
        'abc-123-def-456',
        mockT,
      );
    });

    it('should pass translation function to openNewTab', () => {
      const { result } = renderHook(() => useMenuCodeExecutor());

      result.current.openNewTabAction({ id: 'test' });

      expect(mockOpenNewTab).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Number),
        expect.any(String),
        mockT,
      );
    });

    it('should create consistent date/time format across multiple calls', () => {
      const { result } = renderHook(() => useMenuCodeExecutor());


      result.current.openNewTabAction({ id: 'test-1' });
      const call1 = mockOpenNewTab.mock.calls[0][0];

      // Small delay to ensure same second
      result.current.openNewTabAction({ id: 'test-2' });
      const call2 = mockOpenNewTab.mock.calls[1][0];

      // Format should be consistent
      expect(call1.projectName).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(call2.projectName).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(call1.workspacePath).toMatch(/\d{2}:\d{2}:\d{2} (AM|PM)/);
      expect(call2.workspacePath).toMatch(/\d{2}:\d{2}:\d{2} (AM|PM)/);
    });
  });

  describe('edge cases', () => {
    it('should handle empty id string', () => {
      const { result } = renderHook(() => useMenuCodeExecutor());

      result.current.openNewTabAction({ id: '' });

      expect(mockOpenNewTab).toHaveBeenCalledWith(
        expect.objectContaining({
          sheetId: '',
          inputFileName: '',
        }),
        expect.any(Number),
        '',
        mockT,
      );
    });

    it('should handle special characters in id', () => {
      const { result } = renderHook(() => useMenuCodeExecutor());

      const specialId = 'test@#$%^&*()';
      result.current.openNewTabAction({ id: specialId });

      expect(mockOpenNewTab).toHaveBeenCalledWith(
        expect.objectContaining({
          sheetId: specialId,
          inputFileName: specialId,
        }),
        expect.any(Number),
        specialId,
        mockT,
      );
    });

    it('should handle very long id', () => {
      const { result } = renderHook(() => useMenuCodeExecutor());

      const longId = 'a'.repeat(1000);
      result.current.openNewTabAction({ id: longId });

      expect(mockOpenNewTab).toHaveBeenCalledWith(
        expect.objectContaining({
          sheetId: longId,
          inputFileName: longId,
        }),
        expect.any(Number),
        longId,
        mockT,
      );
    });

    it('should handle unicode characters in id', () => {
      const { result } = renderHook(() => useMenuCodeExecutor());

      const unicodeId = '测试-テスト-🚀';
      result.current.openNewTabAction({ id: unicodeId });

      expect(mockOpenNewTab).toHaveBeenCalledWith(
        expect.objectContaining({
          sheetId: unicodeId,
          inputFileName: unicodeId,
        }),
        expect.any(Number),
        unicodeId,
        mockT,
      );
    });
  });
});
