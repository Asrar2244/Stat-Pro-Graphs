import { logger } from "./logger";
import { warn, debug, trace, info, error } from "@tauri-apps/plugin-log";

jest.mock("@tauri-apps/plugin-log", () => ({
    debug: jest.fn(),
    info: jest.fn(),
    trace: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

describe("logger utility", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("debug", () => {
        it("should log string messages", () => {
            logger.debug("Debug message");

            expect(debug).toHaveBeenCalledWith("Debug message");
        });

        it("should stringify object messages", () => {
            const obj = { key: "value", nested: { data: 123 } };
            logger.debug(obj);

            expect(debug).toHaveBeenCalledWith(JSON.stringify(obj));
        });

        it("should handle empty objects", () => {
            logger.debug({});

            expect(debug).toHaveBeenCalledWith("{}");
        });
    });

    describe("info", () => {
        it("should log string messages", () => {
            logger.info("Info message");

            expect(info).toHaveBeenCalledWith("Info message");
        });

        it("should stringify object messages", () => {
            const obj = { status: "success", count: 42 };
            logger.info(obj);

            expect(info).toHaveBeenCalledWith(JSON.stringify(obj));
        });

        it("should handle arrays", () => {
            const arr = [1, 2, 3, "test"];
            logger.info(arr as any);

            expect(info).toHaveBeenCalledWith(JSON.stringify(arr));
        });
    });

    describe("trace", () => {
        it("should log string messages", () => {
            logger.trace("Trace message");

            expect(trace).toHaveBeenCalledWith("Trace message");
        });

        it("should stringify object messages", () => {
            const obj = { trace: "details" };
            logger.trace(obj);

            expect(trace).toHaveBeenCalledWith(JSON.stringify(obj));
        });
    });

    describe("warn", () => {
        it("should log string messages", () => {
            logger.warn("Warning message");

            expect(warn).toHaveBeenCalledWith("Warning message");
        });

        it("should stringify object messages", () => {
            const obj = { warning: "deprecated", level: "medium" };
            logger.warn(obj);

            expect(warn).toHaveBeenCalledWith(JSON.stringify(obj));
        });

        it("should handle complex nested objects", () => {
            const obj = {
                user: { id: 1, name: "Test" },
                metadata: { timestamp: 123456, level: 1 },
            };
            logger.warn(obj);

            expect(warn).toHaveBeenCalledWith(JSON.stringify(obj));
        });
    });

    describe("error", () => {
        it("should log string messages", () => {
            logger.error("Error message");

            expect(error).toHaveBeenCalledWith("Error message");
        });

        it("should stringify object messages", () => {
            const obj = { error: "failed", code: 500 };
            logger.error(obj);

            expect(error).toHaveBeenCalledWith(JSON.stringify(obj));
        });

        it("should handle error objects", () => {
            const errorObj = { message: "Something went wrong", stack: "..." };
            logger.error(errorObj);

            expect(error).toHaveBeenCalledWith(JSON.stringify(errorObj));
        });
    });

    describe("edge cases", () => {
        it("should handle null values", () => {
            logger.info(null as any);

            expect(info).toHaveBeenCalledWith("null");
        });

        it("should handle undefined values", () => {
            logger.warn(undefined as any);

            // undefined passes through as-is since typeof undefined === 'string' is false
            expect(warn).toHaveBeenCalledWith(undefined);
        });

        it("should handle special characters in strings", () => {
            logger.debug('String with "quotes" and \\backslashes\\');

            expect(debug).toHaveBeenCalledWith('String with "quotes" and \\backslashes\\');
        });

        it("should handle empty strings", () => {
            logger.trace("");

            expect(trace).toHaveBeenCalledWith("");
        });

        it("should handle numbers as objects", () => {
            logger.info(123 as any);

            expect(info).toHaveBeenCalledWith("123");
        });

        it("should handle boolean values", () => {
            logger.debug(true as any);

            expect(debug).toHaveBeenCalledWith("true");
        });
    });

    describe("all logger methods", () => {
        it("should have all required methods", () => {
            expect(logger).toHaveProperty("debug");
            expect(logger).toHaveProperty("info");
            expect(logger).toHaveProperty("trace");
            expect(logger).toHaveProperty("warn");
            expect(logger).toHaveProperty("error");
        });

        it("should all be functions", () => {
            expect(typeof logger.debug).toBe("function");
            expect(typeof logger.info).toBe("function");
            expect(typeof logger.trace).toBe("function");
            expect(typeof logger.warn).toBe("function");
            expect(typeof logger.error).toBe("function");
        });
    });
});
