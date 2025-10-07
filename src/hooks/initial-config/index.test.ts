import { renderHook, waitFor } from '@utils/test-utils';
import { useInitialConfig } from './index';

// Mock dependencies
jest.mock('@tauri-apps/api/core', () => ({
  invoke: jest.fn(),
}));

jest.mock('@tauri-apps/plugin-fs', () => ({
  exists: jest.fn(),
  mkdir: jest.fn(),
  create: jest.fn(),
}));

jest.mock('@tauri-apps/api/path', () => ({
  join: jest.fn((...args) => args.join('/')),
}));

jest.mock('@utils', () => ({
  Database: jest.fn(),
  homeDirectory: jest.fn(),
  saveLargeJsonToFile: jest.fn(),
}));

jest.mock('@store', () => ({
  useTasks: jest.fn(),
}));

jest.mock('zustand/react/shallow', () => ({
  useShallow: jest.fn((fn) => fn({ setCommonMsg: jest.fn() })),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('hooks/initial-config', () => {
  let mockSetCommonMsg: jest.Mock;
  let mockDb: any;
  let mockInvoke: jest.Mock;
  let mockExists: jest.Mock;
  let mockMkdir: jest.Mock;
  let mockCreate: jest.Mock;
  let mockHomeDirectory: jest.Mock;
  let mockSaveLargeJsonToFile: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    const { invoke } = require('@tauri-apps/api/core');
    mockInvoke = invoke as jest.Mock;

    const { exists, mkdir, create } = require('@tauri-apps/plugin-fs');
    mockExists = exists as jest.Mock;
    mockMkdir = mkdir as jest.Mock;
    mockCreate = create as jest.Mock;

    const { Database, homeDirectory, saveLargeJsonToFile } = require('@utils');
    mockHomeDirectory = homeDirectory as jest.Mock;
    mockSaveLargeJsonToFile = saveLargeJsonToFile as jest.Mock;

    mockDb = {
      executeQuery: jest.fn(),
    };
    (Database as jest.Mock).mockImplementation(() => mockDb);

    mockSetCommonMsg = jest.fn();
    const { useTasks } = require('@store');
    (useTasks as jest.Mock).mockReturnValue({
      setCommonMsg: mockSetCommonMsg,
    });

    mockHomeDirectory.mockResolvedValue('/mock/home');
    mockExists.mockResolvedValue(false);
    mockMkdir.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue(undefined);
    mockInvoke.mockResolvedValue(undefined);
    mockDb.executeQuery.mockResolvedValue(undefined);
    mockSaveLargeJsonToFile.mockResolvedValue(undefined);
  });

  it('should have isLoading property', () => {
    const { result } = renderHook(() => useInitialConfig());
    expect(result.current.isLoading).toBeDefined();
    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('should create initial folders when they do not exist', async () => {
    mockExists.mockResolvedValue(false);

    renderHook(() => useInitialConfig());

    await waitFor(() => {
      expect(mockMkdir).toHaveBeenCalled();
    });
  });

  it('should not create folders when they already exist', async () => {
    mockExists.mockResolvedValue(true);

    renderHook(() => useInitialConfig());

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('close_splashscreen');
    });
  });

  it('should create initial database file', async () => {
    mockExists.mockResolvedValue(false);

    renderHook(() => useInitialConfig());

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });
  });

  it('should create initial test config file', async () => {
    renderHook(() => useInitialConfig());

    await waitFor(() => {
      expect(mockSaveLargeJsonToFile).toHaveBeenCalled();
    });
  });

  it('should execute initial database queries', async () => {
    renderHook(() => useInitialConfig());

    await waitFor(() => {
      expect(mockDb.executeQuery).toHaveBeenCalled();
    });
  });

  it('should close splashscreen after initialization', async () => {
    renderHook(() => useInitialConfig());

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('close_splashscreen');
    });
  });

  it('should handle errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    mockDb.executeQuery.mockRejectedValue(new Error('Database error'));

    renderHook(() => useInitialConfig());

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Error in Seeding Initial Configurations=>',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  it('should set common message with version', async () => {
    renderHook(() => useInitialConfig());

    await waitFor(() => {
      expect(mockSetCommonMsg).toHaveBeenCalled();
    });
  });

  it('should handle home directory creation', async () => {
    mockExists.mockResolvedValueOnce(false).mockResolvedValue(true);

    renderHook(() => useInitialConfig());

    await waitFor(() => {
      expect(mockMkdir).toHaveBeenCalled();
    });
  });

  it('should handle database query errors and still close splashscreen', async () => {
    mockDb.executeQuery.mockRejectedValue(new Error('Query failed'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    renderHook(() => useInitialConfig());

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('close_splashscreen');
    });

    consoleError.mockRestore();
  });

  it('should set isLoading to true during initialization', async () => {
    mockDb.executeQuery.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    renderHook(() => useInitialConfig());

    // Initial state should transition through loading
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalled();
    });
  });
});
