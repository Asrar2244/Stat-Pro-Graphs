import { renderHook, act, waitFor } from "@testing-library/react";
import { usePagination } from "./index";

jest.mock("@constants", () => ({
    DEFAULT_PAGE_SIZE: 10,
}));

describe("usePagination Hook", () => {
    it("initializes with default page size", async () => {
        const { result } = renderHook(() => usePagination(100));

        await waitFor(() => {
            expect(result.current.pageSize).toBe(10);
        });
    });

    it("initializes with custom page size", async () => {
        const { result } = renderHook(() => usePagination(100, 20));

        await waitFor(() => {
            expect(result.current.pageSize).toBe(20);
        });
    });

    it("calculates page count correctly", async () => {
        const { result } = renderHook(() => usePagination(100, 10));

        await waitFor(() => {
            expect(result.current.pageCount).toBe(10);
        });
    });

    it("starts at page 1", () => {
        const { result } = renderHook(() => usePagination(100));

        expect(result.current.currentPage).toBe(1);
    });

    it("navigates to next page", async () => {
        const { result } = renderHook(() => usePagination(100, 10));

        await waitFor(() => {
            expect(result.current.pageSize).toBe(10);
        });

        act(() => {
            result.current.nextPage();
        });

        expect(result.current.currentPage).toBe(2);
    });

    it("navigates to previous page", async () => {
        const { result } = renderHook(() => usePagination(100, 10));

        await waitFor(() => {
            expect(result.current.pageSize).toBe(10);
        });

        act(() => {
            result.current.nextPage();
            result.current.nextPage();
        });

        expect(result.current.currentPage).toBe(3);

        act(() => {
            result.current.previousPage();
        });

        expect(result.current.currentPage).toBe(2);
    });

    it("does not go below page 1", async () => {
        const { result } = renderHook(() => usePagination(100, 10));

        await waitFor(() => {
            expect(result.current.pageSize).toBe(10);
        });

        act(() => {
            result.current.previousPage();
            result.current.previousPage();
        });

        expect(result.current.currentPage).toBe(1);
    });

    it("does not go beyond last page", async () => {
        const { result } = renderHook(() => usePagination(100, 10));

        await waitFor(() => {
            expect(result.current.pageCount).toBe(10);
        });

        act(() => {
            result.current.nextPage();
            result.current.nextPage();
            result.current.nextPage();
            result.current.nextPage();
            result.current.nextPage();
            result.current.nextPage();
            result.current.nextPage();
            result.current.nextPage();
            result.current.nextPage();
            result.current.nextPage();
            result.current.nextPage(); // Trying to go beyond
        });

        expect(result.current.currentPage).toBe(10);
    });

    it("jumps to first page", async () => {
        const { result } = renderHook(() => usePagination(100, 10));

        await waitFor(() => {
            expect(result.current.pageSize).toBe(10);
        });

        act(() => {
            result.current.nextPage();
            result.current.nextPage();
        });

        expect(result.current.currentPage).toBe(3);

        act(() => {
            result.current.firstPage();
        });

        expect(result.current.currentPage).toBe(1);
    });

    it("jumps to last page", async () => {
        const { result } = renderHook(() => usePagination(100, 10));

        await waitFor(() => {
            expect(result.current.pageCount).toBe(10);
        });

        act(() => {
            result.current.lastPage();
        });

        expect(result.current.currentPage).toBe(10);
    });

    it("changes page size", async () => {
        const { result } = renderHook(() => usePagination(100, 10));

        await waitFor(() => {
            expect(result.current.pageSize).toBe(10);
        });

        act(() => {
            result.current.pageSizeChanged(20);
        });

        await waitFor(() => {
            expect(result.current.pageSize).toBe(20);
            expect(result.current.pageCount).toBe(5);
        });
    });

    it("resets to page 1 when page size changes", async () => {
        const { result } = renderHook(() => usePagination(100, 10));

        await waitFor(() => {
            expect(result.current.pageSize).toBe(10);
        });

        act(() => {
            result.current.nextPage();
            result.current.nextPage();
        });

        expect(result.current.currentPage).toBe(3);

        act(() => {
            result.current.pageSizeChanged(20);
        });

        expect(result.current.currentPage).toBe(1);
    });

    it("calculates start and stop indices correctly", async () => {
        const { result } = renderHook(() => usePagination(100, 10));

        await waitFor(() => {
            expect(result.current.startIndex).toBe(0);
            expect(result.current.stopIndex).toBe(10);
        });

        act(() => {
            result.current.nextPage();
        });

        await waitFor(() => {
            expect(result.current.startIndex).toBe(10);
            expect(result.current.stopIndex).toBe(20);
        });
    });

    it("handles jumpChanged correctly", async () => {
        const { result } = renderHook(() => usePagination(100, 10));

        await waitFor(() => {
            expect(result.current.pageSize).toBe(10);
        });

        act(() => {
            result.current.jumpChanged(5);
        });

        expect(result.current.currentPage).toBe(5);
    });

    it("calls dataLoader callback correctly", async () => {
        const { result } = renderHook(() => usePagination(100, 10));
        const mockCallback = jest.fn().mockResolvedValue(undefined);

        await waitFor(() => {
            expect(result.current.pageSize).toBe(10);
        });

        act(() => {
            result.current.dataLoader(mockCallback);
        });

        await waitFor(() => {
            expect(mockCallback).toHaveBeenCalledWith(0, 10);
        });
    });

    it("returns totalRecords correctly", () => {
        const { result } = renderHook(() => usePagination(100, 10));

        expect(result.current.totalRecords).toBe(100);
    });

    it("handles empty records", async () => {
        const { result } = renderHook(() => usePagination(0, 10));

        await waitFor(() => {
            expect(result.current.pageCount).toBe(0);
        });
    });
});
