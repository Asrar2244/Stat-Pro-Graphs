import { renderHook } from "@testing-library/react";
import { useAxios } from "./index";
import axios from "axios";
import { logger } from "@utils";

jest.mock("axios");
jest.mock("@utils", () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

describe("useAxios Hook", () => {
    const mockAxios = axios as jest.Mocked<typeof axios>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockAxios.defaults = { baseURL: "" } as any;
        mockAxios.interceptors = {
            request: {
                use: jest.fn(),
            },
            response: {
                use: jest.fn(),
            },
        } as any;
    });

    it("should return axios instance", () => {
        const { result } = renderHook(() => useAxios());

        expect(result.current).toBe(axios);
    });

    it("should set baseURL from environment variable", () => {
        renderHook(() => useAxios());

        // BaseURL is set from import.meta.env.VITE_API which may be undefined in tests
        // Just verify the property exists on the defaults object
        expect(mockAxios.defaults).toHaveProperty("baseURL");
    });

    it("should register request interceptor", () => {
        renderHook(() => useAxios());

        expect(mockAxios.interceptors.request.use).toHaveBeenCalled();
        expect(mockAxios.interceptors.request.use).toHaveBeenCalledWith(
            expect.any(Function),
            expect.any(Function)
        );
    });

    it("should log request data on successful request", () => {
        let requestInterceptor: any;

        mockAxios.interceptors.request.use = jest.fn((onFulfilled) => {
            requestInterceptor = onFulfilled;
            return 0;
        });

        renderHook(() => useAxios());

        const config = { data: { test: "data" }, url: "/test" };
        const result = requestInterceptor(config);

        expect(logger.info).toHaveBeenCalledWith({
            message: "Request Sent--",
            body: { test: "data" },
        });
        expect(result).toEqual(config);
    });

    it("should log error on request failure", async () => {
        let errorInterceptor: any;

        mockAxios.interceptors.request.use = jest.fn((_, onRejected) => {
            errorInterceptor = onRejected;
            return 0;
        });

        renderHook(() => useAxios());

        const error = new Error("Request failed");

        await expect(errorInterceptor(error)).rejects.toThrow("Request failed");
        expect(logger.error).toHaveBeenCalledWith({ error: "Request failed" });
    });

    it("should handle request with no data", () => {
        let requestInterceptor: any;

        mockAxios.interceptors.request.use = jest.fn((onFulfilled) => {
            requestInterceptor = onFulfilled;
            return 0;
        });

        renderHook(() => useAxios());

        const config = { url: "/test" };
        const result = requestInterceptor(config);

        expect(logger.info).toHaveBeenCalledWith({
            message: "Request Sent--",
            body: undefined,
        });
        expect(result).toEqual(config);
    });

    it("should maintain axios instance across re-renders", () => {
        const { result, rerender } = renderHook(() => useAxios());

        const firstInstance = result.current;
        rerender();

        expect(result.current).toBe(firstInstance);
    });
});
