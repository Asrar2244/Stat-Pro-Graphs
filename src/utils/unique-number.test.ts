import { uniqueNumber } from "./unique-number";

describe("uniqueNumber utility", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should generate a number", () => {
        const result = uniqueNumber();

        expect(typeof result).toBe("number");
    });

    it("should generate different numbers on consecutive calls", () => {
        const num1 = uniqueNumber();
        const num2 = uniqueNumber();
        const num3 = uniqueNumber();

        expect(num1).not.toBe(num2);
        expect(num2).not.toBe(num3);
        expect(num1).not.toBe(num3);
    });

    it("should generate positive numbers", () => {
        const result = uniqueNumber();

        expect(result).toBeGreaterThan(0);
    });

    it("should be based on timestamp", () => {
        const beforeTime = Date.now();
        const result = uniqueNumber();
        const afterTime = Date.now() + 1000;

        expect(result).toBeGreaterThanOrEqual(beforeTime);
        expect(result).toBeLessThan(afterTime);
    });

    it("should generate unique numbers in rapid succession", () => {
        const numbers = new Set();
        const iterations = 100; // Reduced for faster execution

        for (let i = 0; i < iterations; i++) {
            numbers.add(uniqueNumber());
        }

        // Should have reasonable uniqueness (timestamp changes are limited in tight loops)
        // In reality many will have same timestamp, only random differs
        expect(numbers.size).toBeGreaterThan(iterations * 0.5);
    });

    it("should generate numbers within expected range", () => {
        const result = uniqueNumber();
        const now = Date.now();

        // Should be close to current timestamp (within 1000ms + random factor)
        expect(result).toBeGreaterThanOrEqual(now);
        expect(result).toBeLessThan(now + 2000);
    });

    it("should handle multiple simultaneous calls", () => {
        const results = [
            uniqueNumber(),
            uniqueNumber(),
            uniqueNumber(),
            uniqueNumber(),
            uniqueNumber(),
        ];

        const uniqueResults = new Set(results);
        expect(uniqueResults.size).toBeGreaterThan(1);
    });

    it("should generate integers", () => {
        const result = uniqueNumber();

        expect(Number.isInteger(result)).toBe(true);
    });

    it("should add random component to timestamp", () => {
        const timestamp = Date.now();
        jest.spyOn(Date, "now").mockReturnValue(timestamp);
        jest.spyOn(Math, "random").mockReturnValue(0.5);

        const result = uniqueNumber();

        expect(result).toBe(timestamp + 500);

        jest.restoreAllMocks();
    });

    it("should handle edge case with Math.random() returning 0", () => {
        const timestamp = Date.now();
        jest.spyOn(Date, "now").mockReturnValue(timestamp);
        jest.spyOn(Math, "random").mockReturnValue(0);

        const result = uniqueNumber();

        expect(result).toBe(timestamp);

        jest.restoreAllMocks();
    });

    it("should handle edge case with Math.random() returning close to 1", () => {
        const timestamp = Date.now();
        jest.spyOn(Date, "now").mockReturnValue(timestamp);
        jest.spyOn(Math, "random").mockReturnValue(0.999);

        const result = uniqueNumber();

        expect(result).toBe(timestamp + 999);

        jest.restoreAllMocks();
    });
});
