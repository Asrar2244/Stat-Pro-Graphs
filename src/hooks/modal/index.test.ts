import { renderHook, act } from "@testing-library/react";
import { useModal } from "./index";

describe("useModal Hook", () => {
    it("initializes with open false by default", () => {
        const { result } = renderHook(() => useModal({}));

        expect(result.current.open).toBe(false);
    });

    it("initializes with open false when initialOpen is false", () => {
        const { result } = renderHook(() => useModal({ initialOpen: false }));

        expect(result.current.open).toBe(false);
    });

    it("initializes with open true when initialOpen is true", () => {
        const { result } = renderHook(() => useModal({ initialOpen: true }));

        expect(result.current.open).toBe(true);
    });

    it("opens modal when openModal is called", () => {
        const { result } = renderHook(() => useModal({}));

        act(() => {
            result.current.openModal();
        });

        expect(result.current.open).toBe(true);
    });

    it("closes modal when closeModal is called", () => {
        const { result } = renderHook(() => useModal({}));

        act(() => {
            result.current.openModal();
        });

        expect(result.current.open).toBe(true);

        act(() => {
            result.current.closeModal();
        });

        expect(result.current.open).toBe(false);
    });

    it("toggles modal when toggleModal is called", () => {
        const { result } = renderHook(() => useModal({}));

        expect(result.current.open).toBe(false);

        act(() => {
            result.current.toggleModal();
        });

        expect(result.current.open).toBe(true);

        act(() => {
            result.current.toggleModal();
        });

        expect(result.current.open).toBe(false);
    });

    it("returns all required functions", () => {
        const { result } = renderHook(() => useModal({}));

        expect(result.current).toHaveProperty("open");
        expect(result.current).toHaveProperty("openModal");
        expect(result.current).toHaveProperty("closeModal");
        expect(result.current).toHaveProperty("toggleModal");
        expect(typeof result.current.openModal).toBe("function");
        expect(typeof result.current.closeModal).toBe("function");
        expect(typeof result.current.toggleModal).toBe("function");
    });

    it("handles multiple consecutive open calls", () => {
        const { result } = renderHook(() => useModal({}));

        act(() => {
            result.current.openModal();
            result.current.openModal();
            result.current.openModal();
        });

        expect(result.current.open).toBe(true);
    });

    it("handles multiple consecutive close calls", () => {
        const { result } = renderHook(() => useModal({}));

        act(() => {
            result.current.openModal();
        });

        act(() => {
            result.current.closeModal();
            result.current.closeModal();
            result.current.closeModal();
        });

        expect(result.current.open).toBe(false);
    });
});
