import { renderHook, waitFor } from '@testing-library/react';
import { useDraftData } from './index';
import { useActiveNode, useNodeActions, useToaster } from '@hooks';
import { dataGenWorker } from '@workers/data-gen-worker';
import axios from 'axios';
import { Database, saveCsvToFile, removeFileFromGivenPath, createTempFolder, joinPaths, fileNameWithExtension, convertToLinuxPath } from '@utils';

jest.mock('@hooks', () => ({
    useActiveNode: jest.fn(),
    useNodeActions: jest.fn(),
    useToaster: jest.fn(),
}));

jest.mock('@workers/data-gen-worker', () => ({
    dataGenWorker: {
        getFormattedData: jest.fn(),
    },
}));

jest.mock('axios');

jest.mock('@utils', () => ({
    Database: jest.fn(),
    saveCsvToFile: jest.fn(),
    removeFileFromGivenPath: jest.fn(),
    createTempFolder: jest.fn(),
    joinPaths: jest.fn(),
    fileNameWithExtension: jest.fn(),
    convertToLinuxPath: jest.fn(),
}));

jest.mock('@faker-js/faker', () => ({
    faker: {
        animal: {
            bird: jest.fn(() => 'Sparrow'),
            cat: jest.fn(() => 'Tabby'),
            dog: jest.fn(() => 'Labrador'),
            snake: jest.fn(() => 'Python'),
            bear: jest.fn(() => 'Grizzly'),
            lion: jest.fn(() => 'Lion'),
            cow: jest.fn(() => 'Holstein'),
            horse: jest.fn(() => 'Arabian'),
            fish: jest.fn(() => 'Salmon'),
            insect: jest.fn(() => 'Butterfly'),
            rabbit: jest.fn(() => 'Cottontail'),
        },
        helpers: {
            arrayElement: jest.fn((arr) => arr[0]),
        },
    },
}));

jest.mock('@backend', () => ({
    insertIntoProject: 'INSERT INTO project VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
}));

const mockUpdateNodeAttributes = jest.fn();
const mockToasterSuccess = jest.fn();
const mockToasterError = jest.fn();
const mockAxiosPost = axios.post as jest.Mock;

describe('useDraftData Hook - Enhanced', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (useActiveNode as jest.Mock).mockReturnValue({
            id: 'test-id',
            config: { id: 1, dataName: 'existing-data' },
        });

        (useNodeActions as jest.Mock).mockReturnValue({
            updateNodeAttributes: mockUpdateNodeAttributes,
        });

        (useToaster as jest.Mock).mockReturnValue({
            success: mockToasterSuccess,
            error: mockToasterError,
        });

        (createTempFolder as jest.Mock).mockResolvedValue('/tmp/test-folder');
        (joinPaths as jest.Mock).mockResolvedValue('/tmp/test-folder/1.csv');
        (removeFileFromGivenPath as jest.Mock).mockResolvedValue(true);
        (convertToLinuxPath as jest.Mock).mockReturnValue('/tmp/test-folder');
        (fileNameWithExtension as jest.Mock).mockResolvedValue('test.db');
        (saveCsvToFile as jest.Mock).mockResolvedValue(undefined);
        (dataGenWorker.getFormattedData as unknown as jest.Mock).mockResolvedValue([
            ['col1', 'col2'],
            ['val1', 'val2'],
        ]);
    });

    describe('Basic hook functionality', () => {
        it('returns generateCSVDataAndSaveCSV function', () => {
            const { result } = renderHook(() => useDraftData());
            expect(result.current.generateCSVDataAndSaveCSV).toBeDefined();
            expect(typeof result.current.generateCSVDataAndSaveCSV).toBe('function');
        });

        it('uses active node data', () => {
            renderHook(() => useDraftData());
            expect(useActiveNode).toHaveBeenCalledWith([]);
        });

        it('initializes with correct hooks', () => {
            renderHook(() => useDraftData());
            expect(useActiveNode).toHaveBeenCalled();
            expect(useNodeActions).toHaveBeenCalled();
            expect(useToaster).toHaveBeenCalled();
        });
    });

    describe('generateCSVDataAndSaveCSV - Success flow', () => {
        it('generates CSV and saves data successfully for new file', async () => {
            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    return_value: 'success',
                    db_name: 'test.db',
                    data_name: 'Sheet1',
                    sheet_name: 'Sheet1',
                    fileSize: 1046,
                },
            });

            const mockExecuteQuery = jest.fn().mockResolvedValue({ lastInsertId: 123 });
            (Database as jest.Mock).mockImplementation(() => ({
                executeQuery: mockExecuteQuery,
            }));

            const { result } = renderHook(() => useDraftData());

            const testData = [[{ value: 'test' }]];
            const testColumns = { col1: 'Column 1' };

            await result.current.generateCSVDataAndSaveCSV(testData as any, testColumns);

            await waitFor(() => {
                expect(createTempFolder).toHaveBeenCalled();
                expect(joinPaths).toHaveBeenCalledWith(['/tmp/test-folder', '1.csv']);
                expect(removeFileFromGivenPath).toHaveBeenCalledWith('/tmp/test-folder/1.csv');
                expect(dataGenWorker.getFormattedData).toHaveBeenCalledWith(testData, testColumns);
                expect(saveCsvToFile).toHaveBeenCalled();
            });
        });

        it('calls axios with correct parameters', async () => {
            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    return_value: 'success',
                    db_name: 'test.db',
                    data_name: 'Sheet1',
                    sheet_name: 'Sheet1',
                },
            });

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([[{ value: 'test' }]] as any, {});

            await waitFor(() => {
                expect(mockAxiosPost).toHaveBeenCalledWith(
                    expect.stringContaining('api/'),
                    expect.objectContaining({
                        data_name: '/tmp/test-folder/1.csv',
                        input_data_type: 'file',
                        operation: 'store_data_in_db',
                        sheet_name: 'Sheet1',
                        db_location: '/tmp/test-folder',
                    })
                );
            });
        });

        it('updates node attributes for new file', async () => {
            (useActiveNode as jest.Mock).mockReturnValue({
                id: 'test-id',
                config: { id: 1 },
            });

            (removeFileFromGivenPath as jest.Mock).mockResolvedValue(false);

            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    return_value: 'success',
                    db_name: 'test.db',
                    data_name: 'data.csv',
                    sheet_name: 'Sheet1',
                },
            });

            const mockExecuteQuery = jest.fn().mockResolvedValue({ lastInsertId: 456 });
            (Database as jest.Mock).mockImplementation(() => ({
                executeQuery: mockExecuteQuery,
            }));

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([[{ value: 'test' }]] as any, {});

            await waitFor(() => {
                expect(mockUpdateNodeAttributes).toHaveBeenCalledWith(
                    'test-id',
                    expect.objectContaining({
                        config: expect.objectContaining({
                            id: 456,
                            dataState: 'published',
                            isEmptyDataView: true,
                        }),
                    })
                );
            });
        });

        it('shows success toast after successful save', async () => {
            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    return_value: 'success',
                    db_name: 'test.db',
                    data_name: 'Sheet1',
                    sheet_name: 'Sheet1',
                },
            });

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([[{ value: 'test' }]] as any, {});

            await waitFor(() => {
                expect(mockToasterSuccess).toHaveBeenCalledWith({
                    body: 'Data Published Successfully',
                    title: 'Success',
                });
            });
        });

        it('generates random animal name for new file', async () => {
            (useActiveNode as jest.Mock).mockReturnValue({
                id: 'test-id',
                config: { id: 1 },
            });

            (removeFileFromGivenPath as jest.Mock).mockResolvedValue(false);

            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    return_value: 'success',
                    db_name: 'test.db',
                    data_name: 'Sheet1',
                    sheet_name: 'Sheet1',
                },
            });

            const mockExecuteQuery = jest.fn().mockResolvedValue({ lastInsertId: 789 });
            (Database as jest.Mock).mockImplementation(() => ({
                executeQuery: mockExecuteQuery,
            }));

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([[{ value: 'test' }]] as any, {});

            await waitFor(() => {
                expect(mockExecuteQuery).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.arrayContaining(['Sparrow'])
                );
            });
        });

        it('uses existing dataName when file exists', async () => {
            (useActiveNode as jest.Mock).mockReturnValue({
                id: 'test-id',
                config: { id: 1, dataName: 'ExistingData' },
            });

            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    return_value: 'success',
                    db_name: 'test.db',
                    data_name: 'Sheet1',
                    sheet_name: 'Sheet1',
                },
            });

            (removeFileFromGivenPath as jest.Mock).mockResolvedValue(true);

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([[{ value: 'test' }]] as any, {});

            await waitFor(() => {
                expect(mockAxiosPost).toHaveBeenCalled();
            });
        });
    });

    describe('Error handling', () => {
        it('shows error toast when API returns error', async () => {
            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    error: 'API Error occurred',
                },
            });

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([[{ value: 'test' }]] as any, {});

            await waitFor(() => {
                expect(mockToasterError).toHaveBeenCalledWith({
                    body: 'API Error occurred',
                    title: 'error',
                });
            });
        });

        it('shows error toast when return_value is not success', async () => {
            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    return_value: 'failed',
                },
            });

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([[{ value: 'test' }]] as any, {});

            await waitFor(() => {
                expect(mockToasterError).toHaveBeenCalledWith({
                    body: 'Something went wrong save location file',
                    title: 'error',
                });
            });
        });

        it('handles axios network error', async () => {
            mockAxiosPost.mockRejectedValueOnce(new Error('Network error'));

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([[{ value: 'test' }]] as any, {});

            await waitFor(() => {
                expect(mockToasterError).toHaveBeenCalledWith({
                    body: 'Network error',
                    title: 'error',
                });
            });
        });

        it('handles saveCsvToFile error', async () => {
            (saveCsvToFile as jest.Mock).mockRejectedValueOnce(new Error('File write error'));

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([[{ value: 'test' }]] as any, {});

            await waitFor(() => {
                expect(saveCsvToFile).toHaveBeenCalled();
            });
        });

        it('handles database insertion error', async () => {
            (useActiveNode as jest.Mock).mockReturnValue({
                id: 'test-id',
                config: { id: 1 },
            });

            (removeFileFromGivenPath as jest.Mock).mockResolvedValue(false);

            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    return_value: 'success',
                    db_name: 'test.db',
                    data_name: 'Sheet1',
                    sheet_name: 'Sheet1',
                },
            });

            const mockExecuteQuery = jest.fn().mockRejectedValue(new Error('DB Error'));
            (Database as jest.Mock).mockImplementation(() => ({
                executeQuery: mockExecuteQuery,
            }));

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([[{ value: 'test' }]] as any, {});

            await waitFor(() => {
                expect(mockToasterError).toHaveBeenCalledWith({
                    body: 'DB Error',
                    title: 'error',
                });
            });

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Edge cases', () => {
        it('handles empty data matrix', async () => {
            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    return_value: 'success',
                    db_name: 'test.db',
                    data_name: 'Sheet1',
                    sheet_name: 'Sheet1',
                },
            });

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([] as any, {});

            await waitFor(() => {
                expect(dataGenWorker.getFormattedData).toHaveBeenCalledWith([], {});
            });
        });

        it('handles empty columns object', async () => {
            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    return_value: 'success',
                    db_name: 'test.db',
                    data_name: 'Sheet1',
                    sheet_name: 'Sheet1',
                },
            });

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([[{ value: 'test' }]] as any, {});

            await waitFor(() => {
                expect(dataGenWorker.getFormattedData).toHaveBeenCalled();
            });
        });

        it('handles undefined config', () => {
            (useActiveNode as jest.Mock).mockReturnValue({
                id: 'test-id',
                config: undefined,
            });

            const { result } = renderHook(() => useDraftData());

            expect(result.current.generateCSVDataAndSaveCSV).toBeDefined();
        });

        it('handles null id', () => {
            (useActiveNode as jest.Mock).mockReturnValue({
                id: null,
                config: { id: 1 },
            });

            const { result } = renderHook(() => useDraftData());

            expect(result.current.generateCSVDataAndSaveCSV).toBeDefined();
        });

        it('handles file deletion failure gracefully', async () => {
            (removeFileFromGivenPath as jest.Mock).mockResolvedValue(false);

            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    return_value: 'success',
                    db_name: 'test.db',
                    data_name: 'Sheet1',
                    sheet_name: 'Sheet1',
                },
            });

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([[{ value: 'test' }]] as any, {});

            await waitFor(() => {
                expect(removeFileFromGivenPath).toHaveBeenCalled();
            });
        });

        it('handles large data matrix', async () => {
            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    return_value: 'success',
                    db_name: 'test.db',
                    data_name: 'Sheet1',
                    sheet_name: 'Sheet1',
                },
            });

            const largeData = Array(1000).fill([{ value: 'test' }]);

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV(largeData as any, { col1: 'Col1' });

            await waitFor(() => {
                expect(dataGenWorker.getFormattedData).toHaveBeenCalledWith(largeData, { col1: 'Col1' });
            });
        });
    });

    describe('Path handling', () => {
        it('converts paths to Linux format', async () => {
            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    return_value: 'success',
                    db_name: 'test.db',
                    data_name: 'Sheet1',
                    sheet_name: 'Sheet1',
                },
            });

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([[{ value: 'test' }]] as any, {});

            await waitFor(() => {
                expect(convertToLinuxPath).toHaveBeenCalledWith('/tmp/test-folder');
            });
        });

        it('creates correct CSV file path', async () => {
            (useActiveNode as jest.Mock).mockReturnValue({
                id: 'test-id',
                config: { id: 999 },
            });

            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    return_value: 'success',
                    db_name: 'test.db',
                    data_name: 'Sheet1',
                    sheet_name: 'Sheet1',
                },
            });

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([[{ value: 'test' }]] as any, {});

            await waitFor(() => {
                expect(joinPaths).toHaveBeenCalledWith(['/tmp/test-folder', '999.csv']);
            });
        });

        it('gets file name with extension from db_name', async () => {
            mockAxiosPost.mockResolvedValueOnce({
                data: {
                    return_value: 'success',
                    db_name: 'mydata.db',
                    data_name: 'Sheet1',
                    sheet_name: 'Sheet1',
                },
            });

            const { result } = renderHook(() => useDraftData());

            await result.current.generateCSVDataAndSaveCSV([[{ value: 'test' }]] as any, {});

            await waitFor(() => {
                expect(fileNameWithExtension).toHaveBeenCalledWith('mydata.db');
            });
        });
    });
});
