import { renderHook } from "@testing-library/react";
import { useFileSize } from "./index";

describe("useFileSize Hook", () => {
    it("converts bytes to KB correctly", () => {
        const { result } = renderHook(() => useFileSize());

        expect(result.current.kb(1024)).toBe("1.00 KB");
        expect(result.current.kb(2048)).toBe("2.00 KB");
        expect(result.current.kb(512)).toBe("0.50 KB");
    });

    it("converts bytes to MB correctly", () => {
        const { result } = renderHook(() => useFileSize());

        expect(result.current.mb(1048576)).toBe("1.00 MB");
        expect(result.current.mb(2097152)).toBe("2.00 MB");
        expect(result.current.mb(5242880)).toBe("5.00 MB");
    });

    it("returns KB when MB conversion results in 0", () => {
        const { result } = renderHook(() => useFileSize());

        const result1024 = result.current.mb(1024);
        expect(result1024).toContain("KB");
        expect(result1024).toBe("1.00 KB");
    });

    it("handles zero bytes", () => {
        const { result } = renderHook(() => useFileSize());

        expect(result.current.kb(0)).toBe("0.00 KB");
        expect(result.current.mb(0)).toBe("0.00 KB");
    });

    it("handles large byte values", () => {
        const { result } = renderHook(() => useFileSize());

        const oneGB = 1073741824; // 1 GB in bytes
        expect(result.current.mb(oneGB)).toBe("1024.00 MB");
    });

    it("formats decimals correctly", () => {
        const { result } = renderHook(() => useFileSize());

        expect(result.current.kb(1536)).toBe("1.50 KB");
        expect(result.current.mb(1572864)).toBe("1.50 MB");
    });

    it("returns consistent format", () => {
        const { result } = renderHook(() => useFileSize());

        const kb = result.current.kb(1024);
        const mb = result.current.mb(1048576);

        expect(kb).toMatch(/^\d+\.\d{2} KB$/);
        expect(mb).toMatch(/^\d+\.\d{2} MB$/);
    });
});
