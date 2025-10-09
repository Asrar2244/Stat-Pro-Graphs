import { renderHook, waitFor } from "@testing-library/react";
import { useExecuteTask } from "./index";
import { useTasks } from "@store";
import { Database, collectionFolder, saveLargeJsonToFile, removeFileFromGivenPath, sleep } from "@utils";
import { insertToNotificationTable, outputTable, outputUpdateResult } from "@backend";
import { mainWorker } from "@workers/worker";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, params?: any) => {
            if (key === "analyzing") return `Analyzing ${params?.description}`;
            if (key === "analyzingSuccess") return `Success ${params?.description}`;
            if (key === "analyzingError") return `Error ${params?.description}`;
            return key;
        },
    }),
}));

jest.mock("@store");
jest.mock("@utils");
jest.mock("@backend");
jest.mock("@workers/worker", () => ({
    mainWorker: {
        axios: jest.fn(),
    },
}));

describe("useExecuteTask Hook", () => {
    const mockSetCommonMsg = jest.fn();
    const mockSetAddTask = jest.fn();
    const mockQueueTasks: any[] = [];

    beforeEach(() => {
        jest.clearAllMocks();

        (useTasks as unknown as jest.Mock).mockImplementation((selector: any) =>
            selector({
                queueTasks: mockQueueTasks,
                setCommonMsg: mockSetCommonMsg,
                setAddTask: mockSetAddTask,
            })
        );

        (Database as jest.Mock).mockImplementation(() => ({
            executeQuery: jest.fn().mockResolvedValue({ lastInsertId: 123 }),
        }));

        (collectionFolder as jest.Mock).mockResolvedValue("/path/to/file.json");
        (saveLargeJsonToFile as jest.Mock).mockResolvedValue(undefined);
        (outputTable as jest.Mock).mockResolvedValue(456);
        (outputUpdateResult as jest.Mock).mockResolvedValue(undefined);
        (sleep as jest.Mock).mockResolvedValue(undefined);
        (mainWorker.axios as unknown as jest.Mock).mockResolvedValue({ success: true });
    });

    it("should handle empty queue", () => {
        const { result } = renderHook(() => useExecuteTask());

        expect(result.current).toBeUndefined();
        expect(mockSetCommonMsg).not.toHaveBeenCalled();
    });

    it("should not execute when queueTasks is null or undefined", () => {
        (useTasks as unknown as jest.Mock).mockImplementation((selector: any) =>
            selector({
                queueTasks: null,
                setCommonMsg: mockSetCommonMsg,
                setAddTask: mockSetAddTask,
            })
        );

        renderHook(() => useExecuteTask());

        expect(mockSetCommonMsg).not.toHaveBeenCalled();
    });

    it("should process task from queue successfully", async () => {
        const mockTask = {
            uuid: "test-uuid-123",
            queueFor: "Test Analysis",
            tabName: "test-tab",
            queueType: "analysis",
            parameters: { data: "test" },
            tabId: 1,
        };

        mockQueueTasks.push(mockTask);

        (useTasks as unknown as jest.Mock).mockImplementation((selector: any) =>
            selector({
                queueTasks: [mockTask],
                setCommonMsg: mockSetCommonMsg,
                setAddTask: mockSetAddTask,
            })
        );

        renderHook(() => useExecuteTask());

        await waitFor(() => {
            expect(collectionFolder).toHaveBeenCalledWith("test-uuid-123.json");
        });

        await waitFor(() => {
            expect(saveLargeJsonToFile).toHaveBeenCalledWith(
                "/path/to/file.json",
                { data: "test" }
            );
        });
    });

    it("should set spinner message while analyzing", async () => {
        const mockTask = {
            uuid: "test-uuid",
            queueFor: "Test Analysis",
            tabName: "test-tab",
            queueType: "analysis",
            parameters: {},
            tabId: 1,
        };

        (useTasks as unknown as jest.Mock).mockImplementation((selector: any) =>
            selector({
                queueTasks: [mockTask],
                setCommonMsg: mockSetCommonMsg,
                setAddTask: mockSetAddTask,
            })
        );

        renderHook(() => useExecuteTask());

        await waitFor(() => {
            expect(mockSetCommonMsg).toHaveBeenCalledWith({
                spinner: true,
                message: "Analyzing Test Analysis",
            });
        });
    });

    it("should handle API response with error", async () => {
        const mockTask = {
            uuid: "test-uuid",
            queueFor: "Test Analysis",
            tabName: "test-tab",
            queueType: "analysis",
            parameters: {},
            tabId: 1,
        };

        (mainWorker.axios as unknown as jest.Mock).mockResolvedValue({
            error: "API Error occurred",
        });

        (useTasks as unknown as jest.Mock).mockImplementation((selector: any) =>
            selector({
                queueTasks: [mockTask],
                setCommonMsg: mockSetCommonMsg,
                setAddTask: mockSetAddTask,
            })
        );

        renderHook(() => useExecuteTask());

        await waitFor(() => {
            expect(mockSetCommonMsg).toHaveBeenCalledWith({
                spinner: false,
                message: "API Error occurred",
            });
        });
    });

    it("should handle file save errors", async () => {
        const mockTask = {
            uuid: "test-uuid",
            queueFor: "Test Analysis",
            tabName: "test-tab",
            queueType: "analysis",
            parameters: {},
            tabId: 1,
        };

        (saveLargeJsonToFile as jest.Mock).mockRejectedValue(new Error("File save failed"));

        (useTasks as unknown as jest.Mock).mockImplementation((selector: any) =>
            selector({
                queueTasks: [mockTask],
                setCommonMsg: mockSetCommonMsg,
                setAddTask: mockSetAddTask,
            })
        );

        renderHook(() => useExecuteTask());

        await waitFor(() => {
            expect(removeFileFromGivenPath).toHaveBeenCalledWith("/path/to/file.json");
        });
    });

    it("should create notification during task execution", async () => {
        const mockTask = {
            uuid: "test-uuid",
            queueFor: "Test Analysis",
            tabName: "test-tab",
            queueType: "analysis",
            parameters: {},
            tabId: 1,
        };

        (useTasks as unknown as jest.Mock).mockImplementation((selector: any) =>
            selector({
                queueTasks: [mockTask],
                setCommonMsg: mockSetCommonMsg,
                setAddTask: mockSetAddTask,
            })
        );

        const mockDb = {
            executeQuery: jest.fn().mockResolvedValue({ lastInsertId: 789 }),
        };
        (Database as jest.Mock).mockImplementation(() => mockDb);

        renderHook(() => useExecuteTask());

        await waitFor(() => {
            expect(mockDb.executeQuery).toHaveBeenCalledWith(
                insertToNotificationTable,
                expect.arrayContaining([
                    "Analyzing Test Analysis",
                    "test-tab",
                    456,
                    expect.any(String),
                ])
            );
        });
    });

    it("should clear common message after execution", async () => {
        const mockTask = {
            uuid: "test-uuid",
            queueFor: "Test Analysis",
            tabName: "test-tab",
            queueType: "analysis",
            parameters: {},
            tabId: 1,
        };

        (useTasks as unknown as jest.Mock).mockImplementation((selector: any) =>
            selector({
                queueTasks: [mockTask],
                setCommonMsg: mockSetCommonMsg,
                setAddTask: mockSetAddTask,
            })
        );

        renderHook(() => useExecuteTask());

        await waitFor(() => {
            expect(mockSetCommonMsg).toHaveBeenCalledWith({
                message: "",
                spinner: false,
            });
        });
    });

    it("should sleep after task execution", async () => {
        const mockTask = {
            uuid: "test-uuid",
            queueFor: "Test Analysis",
            tabName: "test-tab",
            queueType: "analysis",
            parameters: {},
            tabId: 1,
        };

        (useTasks as unknown as jest.Mock).mockImplementation((selector: any) =>
            selector({
                queueTasks: [mockTask],
                setCommonMsg: mockSetCommonMsg,
                setAddTask: mockSetAddTask,
            })
        );

        renderHook(() => useExecuteTask());

        await waitFor(() => {
            expect(sleep).toHaveBeenCalledWith(5000);
        });
    });
});
