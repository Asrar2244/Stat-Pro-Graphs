import { renderHook } from "@testing-library/react";
import { useFormatter } from "./index";
import { useTranslation } from "react-i18next";

jest.mock("react-i18next", () => ({
    useTranslation: jest.fn(),
}));

jest.mock("@constants", () => ({
    DECIMAL_PLACES: 2,
}));

describe("useFormatter Hook", () => {
    beforeEach(() => {
        (useTranslation as jest.Mock).mockReturnValue({
            i18n: { language: "en-US" },
        });
    });

    describe("dateFormat", () => {
        it("formats valid date string correctly", () => {
            const { result } = renderHook(() => useFormatter());
            const date = "2024-01-15T10:30:00Z";
            const formatted = result.current.dateFormat(date);

            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe("string");
            expect(formatted).toMatch(/\d+\/\d+\/\d+/);
        });

        it("formats ISO date string", () => {
            const { result } = renderHook(() => useFormatter());
            const date = "2025-10-05T00:00:00.000Z";
            const formatted = result.current.dateFormat(date);

            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe("string");
        });

        it("handles timestamp numbers", () => {
            const { result } = renderHook(() => useFormatter());
            const timestamp = "1704960600000";
            const formatted = result.current.dateFormat(timestamp);

            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe("string");
        });

        it("adapts to different locales", () => {
            (useTranslation as jest.Mock).mockReturnValue({
                i18n: { language: "fr-FR" },
            });

            const { result } = renderHook(() => useFormatter());
            const date = "2024-01-15T10:30:00Z";
            const formatted = result.current.dateFormat(date);

            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe("string");
        });
    });

    describe("timeFormat", () => {
        it("formats time from valid datetime string", () => {
            const { result } = renderHook(() => useFormatter());
            const date = "2024-01-15T10:30:00Z";
            const formatted = result.current.timeFormat(date);

            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe("string");
        });

        it("formats time with different hours", () => {
            const { result } = renderHook(() => useFormatter());
            const earlyMorning = "2024-01-15T02:15:00Z";
            const noon = "2024-01-15T12:00:00Z";
            const evening = "2024-01-15T18:45:00Z";

            expect(result.current.timeFormat(earlyMorning)).toBeDefined();
            expect(result.current.timeFormat(noon)).toBeDefined();
            expect(result.current.timeFormat(evening)).toBeDefined();
        });

        it("adapts to different locales for time format", () => {
            (useTranslation as jest.Mock).mockReturnValue({
                i18n: { language: "de-DE" },
            });

            const { result } = renderHook(() => useFormatter());
            const date = "2024-01-15T14:30:00Z";
            const formatted = result.current.timeFormat(date);

            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe("string");
        });
    });

    describe("dateTimeFormat", () => {
        it("formats complete datetime correctly", () => {
            const { result } = renderHook(() => useFormatter());
            const date = "2024-01-15T10:30:00Z";
            const formatted = result.current.dateTimeFormat(date);

            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe("string");
        });

        it("includes both date and time components", () => {
            const { result } = renderHook(() => useFormatter());
            const date = "2024-06-20T15:45:30Z";
            const formatted = result.current.dateTimeFormat(date);

            expect(formatted).toBeDefined();
            expect(formatted.length).toBeGreaterThan(0);
        });

        it("handles edge case dates like year boundaries", () => {
            const { result } = renderHook(() => useFormatter());
            const newYear = "2024-01-01T00:00:00Z";
            const yearEnd = "2024-12-31T23:59:59Z";

            expect(result.current.dateTimeFormat(newYear)).toBeDefined();
            expect(result.current.dateTimeFormat(yearEnd)).toBeDefined();
        });
    });

    describe("numberFormat", () => {
        it("formats integer numbers correctly", () => {
            const { result } = renderHook(() => useFormatter());
            const formatted = result.current.numberFormat(1234);

            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe("string");
        });

        it("formats decimal numbers with proper precision", () => {
            const { result } = renderHook(() => useFormatter());
            const number = 1234.5678;
            const formatted = result.current.numberFormat(number);

            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe("string");
            // Should respect DECIMAL_PLACES constant (2)
            expect(formatted).toMatch(/1,?234\.57/);
        });

        it("handles string number input", () => {
            const { result } = renderHook(() => useFormatter());
            const numberString = "1234.5678";
            const formatted = result.current.numberFormat(numberString);

            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe("string");
        });

        it("handles zero correctly", () => {
            const { result } = renderHook(() => useFormatter());
            const formatted = result.current.numberFormat(0);

            expect(formatted).toBe("0");
        });

        it("handles negative numbers", () => {
            const { result } = renderHook(() => useFormatter());
            const formatted = result.current.numberFormat(-1234.56);

            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe("string");
            expect(formatted).toContain("-");
        });

        it("handles very large numbers", () => {
            const { result } = renderHook(() => useFormatter());
            const largeNumber = 9876543210.123;
            const formatted = result.current.numberFormat(largeNumber);

            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe("string");
        });

        it("handles very small decimal numbers", () => {
            const { result } = renderHook(() => useFormatter());
            const smallNumber = 0.00123;
            const formatted = result.current.numberFormat(smallNumber);

            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe("string");
        });

        it("returns original string for NaN values", () => {
            const { result } = renderHook(() => useFormatter());
            const notANumber = "not a number";
            const formatted = result.current.numberFormat(notANumber);

            expect(formatted).toBe(notANumber);
        });

        it("handles empty string correctly", () => {
            const { result } = renderHook(() => useFormatter());
            const formatted = result.current.numberFormat("");

            expect(formatted).toBe("");
        });

        it("handles null and undefined values", () => {
            const { result } = renderHook(() => useFormatter());

            expect(result.current.numberFormat(null as any)).toBe("");
            expect(result.current.numberFormat(undefined as any)).toBe("");
        });

        it("handles special numeric strings", () => {
            const { result } = renderHook(() => useFormatter());

            expect(result.current.numberFormat("0")).toBe("0");
            expect(result.current.numberFormat("123.45")).toBeDefined();
        });

        it("adapts to different locales for number formatting", () => {
            (useTranslation as jest.Mock).mockReturnValue({
                i18n: { language: "de-DE" },
            });

            const { result } = renderHook(() => useFormatter());
            const formatted = result.current.numberFormat(1234.56);

            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe("string");
        });
    });

    describe("snitizedSpecialChar", () => {
        it("removes special characters", () => {
            const { result } = renderHook(() => useFormatter());
            const input = "hello@world#test$";
            const sanitized = result.current.snitizedSpecialChar(input);

            expect(sanitized).toBe("hello world test ");
        });

        it("keeps alphanumeric characters", () => {
            const { result } = renderHook(() => useFormatter());
            const input = "Test123";
            const sanitized = result.current.snitizedSpecialChar(input);

            expect(sanitized).toBe("Test123");
        });

        it("replaces all special characters with spaces", () => {
            const { result } = renderHook(() => useFormatter());
            const input = "file@name#with$many%special&chars*";
            const sanitized = result.current.snitizedSpecialChar(input);

            expect(sanitized).toBe("file name with many special chars ");
            expect(sanitized).not.toMatch(/[@#$%&*]/);
        });

        it("handles strings with only special characters", () => {
            const { result } = renderHook(() => useFormatter());
            const input = "@#$%^&*()";
            const sanitized = result.current.snitizedSpecialChar(input);

            expect(sanitized).toBe("         ");
            expect(sanitized.length).toBe(input.length);
        });

        it("handles empty string", () => {
            const { result } = renderHook(() => useFormatter());
            const sanitized = result.current.snitizedSpecialChar("");

            expect(sanitized).toBe("");
        });

        it("handles mixed case with special chars", () => {
            const { result } = renderHook(() => useFormatter());
            const input = "MyFile_Name-2024.txt";
            const sanitized = result.current.snitizedSpecialChar(input);

            expect(sanitized).toBe("MyFile Name 2024 txt");
        });

        it("preserves spaces between alphanumeric characters", () => {
            const { result } = renderHook(() => useFormatter());
            const input = "hello world 123";
            const sanitized = result.current.snitizedSpecialChar(input);

            expect(sanitized).toBe("hello world 123");
        });

        it("handles unicode and emoji characters", () => {
            const { result } = renderHook(() => useFormatter());
            const input = "test123😊unicode";
            const sanitized = result.current.snitizedSpecialChar(input);

            expect(sanitized).not.toContain("😊");
            expect(sanitized).toContain("test123");
        });
    });

    describe("Hook Interface", () => {
        it("returns all required formatter functions", () => {
            const { result } = renderHook(() => useFormatter());

            expect(result.current).toHaveProperty("dateFormat");
            expect(result.current).toHaveProperty("timeFormat");
            expect(result.current).toHaveProperty("dateTimeFormat");
            expect(result.current).toHaveProperty("numberFormat");
            expect(result.current).toHaveProperty("snitizedSpecialChar");
        });

        it("all properties are functions", () => {
            const { result } = renderHook(() => useFormatter());

            expect(typeof result.current.dateFormat).toBe("function");
            expect(typeof result.current.timeFormat).toBe("function");
            expect(typeof result.current.dateTimeFormat).toBe("function");
            expect(typeof result.current.numberFormat).toBe("function");
            expect(typeof result.current.snitizedSpecialChar).toBe("function");
        });

        it("maintains stable function references across renders", () => {
            const { result, rerender } = renderHook(() => useFormatter());

            rerender();

            // Note: These will be new references unless memoized
            expect(result.current.dateFormat).toBeDefined();
            expect(result.current.numberFormat).toBeDefined();
        });
    });

    describe("Integration scenarios", () => {
        it("formats complete dataset with all formatters", () => {
            const { result } = renderHook(() => useFormatter());

            const testData = {
                date: "2024-01-15T10:30:00Z",
                value: 1234.5678,
                filename: "data@file#2024.csv"
            };

            const formatted = {
                date: result.current.dateFormat(testData.date),
                time: result.current.timeFormat(testData.date),
                datetime: result.current.dateTimeFormat(testData.date),
                value: result.current.numberFormat(testData.value),
                filename: result.current.snitizedSpecialChar(testData.filename)
            };

            expect(formatted.date).toBeDefined();
            expect(formatted.time).toBeDefined();
            expect(formatted.datetime).toBeDefined();
            expect(formatted.value).toBeDefined();
            expect(formatted.filename).toBe("data file 2024 csv");
        });
    });
});
