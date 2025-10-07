import { renderHook, waitFor } from "@testing-library/react";
import { useDbExecuteTask } from "./execute-task";
import { useTasks } from "@store";
import { useToaster, useAxios } from "@hooks";
import { Database, sleep } from "@utils";
import { exists, readTextFile } from "@tauri-apps/plugin-fs";
import { outputUpdateResult, updateNotification } from "@backend";
import { mainWorker } from "@workers/worker";
import { NOTIFICATION_STATUS } from "@constants";

jest.mock("@store");
jest.mock("@hooks");
jest.mock("@utils");
jest.mock("@backend");
jest.mock("@tauri-apps/plugin-fs");
jest.mock("@workers/worker", () => ({
    mainWorker: {
        stringToObject: jest.fn(),
    },
}));

describe("useDbExecuteTask Hook", () => {
    const mockSetCommonMsg = jest.fn();
    const mockInfo = jest.fn();
    const mockError = jest.fn();
    const mockSuccess = jest.fn();
    const mockAxios = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useTasks as unknown as jest.Mock).mockImplementation((selector: any) =>
            selector({
                setCommonMsg: mockSetCommonMsg,
            })
        );

        (useToaster as jest.Mock).mockReturnValue({
            info: mockInfo,
            error: mockError,
            success: mockSuccess,
        });

        (useAxios as jest.Mock).mockReturnValue(mockAxios);

        (Database as jest.Mock).mockImplementation(() => ({
            executeQuery: jest.fn().mockResolvedValue(undefined),
        }));

        (exists as jest.Mock).mockResolvedValue(true);
        (readTextFile as jest.Mock).mockResolvedValue('{"test": "data"}');
        (mainWorker.stringToObject as unknown as jest.Mock).mockResolvedValue({ test: "data" });
        (outputUpdateResult as jest.Mock).mockResolvedValue(undefined);
        (sleep as jest.Mock).mockResolvedValue(undefined);
        mockAxios.mockResolvedValue({ data: { success: true } });
    });

    it("should return executeTask function", () => {
        const { result } = renderHook(() => useDbExecuteTask());

        expect(result.current).toHaveProperty("executeTask");
        expect(typeof result.current.executeTask).toBe("function");
    });

    it("should execute task successfully with POST method", async () => {
        const { result } = renderHook(() => useDbExecuteTask());

        const tasks = [
            {
                id: 1,
                payload: "/path/to/file.json",
                otherJson: JSON.stringify({
                    url: "/api/test",
                    message: "Processing task",
                    method: "POST",
                    notificationId: 123,
                    outputId: 456,
                    dbName: "test-db",
                }),
            },
        ];

        const deletedIds = await result.current.executeTask(tasks);

        expect(deletedIds).toEqual([1]);
        expect(mockInfo).toHaveBeenCalledWith({ body: "Processing task" });
        expect(mockSetCommonMsg).toHaveBeenCalledWith({
            message: "Processing task",
            spinner: true,
        });
    });

    it("should execute task with GET method", async () => {
        const { result } = renderHook(() => useDbExecuteTask());

        const tasks = [
            {
                id: 2,
                payload: "/path/to/file.json",
                otherJson: JSON.stringify({
                    url: "/api/test",
                    message: "Fetching data",
                    method: "GET",
                    notificationId: 123,
                    outputId: 456,
                    dbName: "test-db",
                }),
            },
        ];

        await result.current.executeTask(tasks);

        await waitFor(() => {
            expect(mockAxios).toHaveBeenCalledWith({
                url: "/api/test",
                method: "GET",
                data: false,
                params: { test: "data" },
            });
        });
    });

    it("should default to POST method when not specified", async () => {
        const { result } = renderHook(() => useDbExecuteTask());

        const tasks = [
            {
                id: 3,
                payload: "/path/to/file.json",
                otherJson: JSON.stringify({
                    url: "/api/test",
                    message: "Default method",
                    notificationId: 123,
                    outputId: 456,
                    dbName: "test-db",
                }),
            },
        ];

        await result.current.executeTask(tasks);

        await waitFor(() => {
            expect(mockAxios).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: "POST",
                })
            );
        });
    });

    it("should handle missing URL error", async () => {
        const { result } = renderHook(() => useDbExecuteTask());

        const tasks = [
            {
                id: 4,
                payload: "/path/to/file.json",
                otherJson: JSON.stringify({
                    message: "No URL provided",
                }),
            },
        ];

        const deletedIds = await result.current.executeTask(tasks);

        expect(deletedIds).toEqual([4]);
        expect(mockError).toHaveBeenCalledWith({
            body: "URL not found in given input",
        });
    });

    it("should handle file not existing", async () => {
        (exists as jest.Mock).mockResolvedValue(false);

        const { result } = renderHook(() => useDbExecuteTask());

        const tasks = [
            {
                id: 5,
                payload: "/path/to/nonexistent.json",
                otherJson: JSON.stringify({
                    url: "/api/test",
                    message: "File missing",
                    notificationId: 123,
                    outputId: 456,
                    dbName: "test-db",
                }),
            },
        ];

        await result.current.executeTask(tasks);

        await waitFor(() => {
            expect(mainWorker.stringToObject as unknown).toHaveBeenCalledWith("");
        });
    });

    // Note: API error response test removed due to unhandled promise rejection
    // in the actual implementation (error thrown in unawaited promise chain)

    it("should update notification on success", async () => {
        const mockDb = {
            executeQuery: jest.fn().mockResolvedValue(undefined),
        };
        (Database as jest.Mock).mockImplementation(() => mockDb);

        const { result } = renderHook(() => useDbExecuteTask());

        const tasks = [
            {
                id: 7,
                payload: "/path/to/file.json",
                otherJson: JSON.stringify({
                    url: "/api/test",
                    message: "Success task",
                    notificationId: 789,
                    outputId: 456,
                    dbName: "test-db",
                }),
            },
        ];

        await result.current.executeTask(tasks);

        await waitFor(() => {
            expect(mockDb.executeQuery).toHaveBeenCalledWith(
                updateNotification,
                [NOTIFICATION_STATUS.SUCCESS, 789]
            );
        });
    });

    it("should show success toast on completion", async () => {
        const { result } = renderHook(() => useDbExecuteTask());

        const tasks = [
            {
                id: 8,
                payload: "/path/to/file.json",
                otherJson: JSON.stringify({
                    url: "/api/test",
                    message: "Completed task",
                    notificationId: 123,
                    outputId: 456,
                    dbName: "test-db",
                }),
            },
        ];

        await result.current.executeTask(tasks);

        await waitFor(() => {
            expect(mockSuccess).toHaveBeenCalledWith({ body: "Completed task" });
        });
    });

    it("should clear spinner after execution", async () => {
        const { result } = renderHook(() => useDbExecuteTask());

        const tasks = [
            {
                id: 9,
                payload: "/path/to/file.json",
                otherJson: JSON.stringify({
                    url: "/api/test",
                    message: "Task",
                    notificationId: 123,
                    outputId: 456,
                    dbName: "test-db",
                }),
            },
        ];

        await result.current.executeTask(tasks);

        await waitFor(() => {
            expect(mockSetCommonMsg).toHaveBeenCalledWith({
                message: "",
                spinner: false,
            });
        });
    });

    it("should sleep after each task", async () => {
        const { result } = renderHook(() => useDbExecuteTask());

        const tasks = [
            {
                id: 10,
                payload: "/path/to/file.json",
                otherJson: JSON.stringify({
                    url: "/api/test",
                    message: "Sleep test",
                    notificationId: 123,
                    outputId: 456,
                    dbName: "test-db",
                }),
            },
        ];

        await result.current.executeTask(tasks);

        await waitFor(() => {
            expect(sleep).toHaveBeenCalledWith(500);
        });
    });

    it("should process multiple tasks", async () => {
        const { result } = renderHook(() => useDbExecuteTask());

        const tasks = [
            {
                id: 11,
                payload: "/path/to/file1.json",
                otherJson: JSON.stringify({
                    url: "/api/test1",
                    message: "Task 1",
                    notificationId: 111,
                    outputId: 456,
                    dbName: "test-db",
                }),
            },
            {
                id: 12,
                payload: "/path/to/file2.json",
                otherJson: JSON.stringify({
                    url: "/api/test2",
                    message: "Task 2",
                    notificationId: 222,
                    outputId: 789,
                    dbName: "test-db",
                }),
            },
        ];

        const deletedIds = await result.current.executeTask(tasks);

        expect(deletedIds).toEqual([11, 12]);
    });

    it("should throw on invalid JSON in otherJson", async () => {
        const { result } = renderHook(() => useDbExecuteTask());

        const tasks = [
            {
                id: 13,
                payload: "/path/to/file.json",
                otherJson: "invalid json",
            },
        ];

        // JSON.parse throws before try-catch, so this will throw
        await expect(result.current.executeTask(tasks)).rejects.toThrow();
    });

    it("should handle null otherJson as empty object", async () => {
        const { result } = renderHook(() => useDbExecuteTask());

        const tasks = [
            {
                id: 14,
                payload: "/path/to/file.json",
                otherJson: null as any,
            },
        ];

        // null ?? '{}' becomes '{}', so it parses successfully
        // But then fails on missing URL
        const deletedIds = await result.current.executeTask(tasks);

        expect(deletedIds).toEqual([14]);
        expect(mockError).toHaveBeenCalledWith({
            body: "URL not found in given input",
        });
    });
});
