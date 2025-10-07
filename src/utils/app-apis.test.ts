import {
    homeDirectory,
    volumeDirectory,
    platformInfo,
    collectionsLocation,
    excelLocation,
    fileNameWithExtension,
    volumeExcelFilePath,
    convertToLinuxPath,
    collectionFolder,
    joinPaths,
} from "./app-apis";
import { homeDir, join, basename } from "@tauri-apps/api/path";

jest.mock("@tauri-apps/api/path", () => ({
    homeDir: jest.fn(),
    join: jest.fn(),
    basename: jest.fn(),
}));

jest.mock("@constants", () => ({
    APP_DIR: ".start-pro",
    COLLECTION_DIR: "collections",
    EXCEL_DIR: "excel",
}));

// Mock import.meta.env
const mockEnv = {
    VITE_DIR_SHARED_LOCATION: "",
    VITE_DOCKER_VOLUME_LOCATION: "",
};

Object.defineProperty(globalThis, "import", {
    value: {
        meta: {
            env: mockEnv,
        },
    },
    writable: true,
});

describe("app-apis utils", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockEnv.VITE_DIR_SHARED_LOCATION = "";
        mockEnv.VITE_DOCKER_VOLUME_LOCATION = "";
        (homeDir as jest.Mock).mockResolvedValue("/home/user");
        (join as jest.Mock).mockImplementation((...paths: string[]) =>
            Promise.resolve(paths.join("/"))
        );
        (basename as jest.Mock).mockImplementation((path: string) =>
            Promise.resolve(path.split("/").pop() || "")
        );
    });

    describe("homeDirectory", () => {
        it("should return home directory with APP_DIR", async () => {
            const result = await homeDirectory();

            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
            expect(result).toContain(".start-pro");
        });
    });

    describe("volumeDirectory", () => {
        it("should return a valid directory path", async () => {
            const result = await volumeDirectory();

            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
        });
    });

    describe("platformInfo", () => {
        const originalUserAgent = navigator.userAgent;

        afterEach(() => {
            Object.defineProperty(navigator, "userAgent", {
                value: originalUserAgent,
                writable: true,
            });
        });

        it("should detect Mac platform", () => {
            Object.defineProperty(navigator, "userAgent", {
                value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                writable: true,
                configurable: true,
            });

            expect(platformInfo()).toBe("mac");
        });

        it("should detect Windows platform", () => {
            Object.defineProperty(navigator, "userAgent", {
                value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                writable: true,
                configurable: true,
            });

            expect(platformInfo()).toBe("windows");
        });

        it("should detect Linux platform", () => {
            Object.defineProperty(navigator, "userAgent", {
                value: "Mozilla/5.0 (X11; Linux x86_64)",
                writable: true,
                configurable: true,
            });

            expect(platformInfo()).toBe("linux");
        });

        it("should return unknown for unrecognized platform", () => {
            Object.defineProperty(navigator, "userAgent", {
                value: "Some Unknown Browser",
                writable: true,
                configurable: true,
            });

            expect(platformInfo()).toBe("unknown");
        });
    });

    describe("collectionsLocation", () => {
        it("should return collections path without table", async () => {
            const result = await collectionsLocation();

            expect(result).toBeDefined();
            expect(result).toContain("collections");
        });

        it("should return collections path with table", async () => {
            const result = await collectionsLocation("my-table");

            expect(result).toBeDefined();
            expect(result).toContain("collections");
            expect(result).toContain("my-table");
        });
    });

    describe("excelLocation", () => {
        it("should return excel directory path", async () => {
            const result = await excelLocation();

            expect(result).toBeDefined();
            expect(result).toContain("excel");
        });
    });

    describe("fileNameWithExtension", () => {
        it("should extract filename from path", async () => {
            const result = await fileNameWithExtension("/path/to/file.xlsx");

            expect(basename).toHaveBeenCalledWith("/path/to/file.xlsx");
            expect(result).toBe("file.xlsx");
        });

        it("should handle paths without extension", async () => {
            (basename as jest.Mock).mockResolvedValue("filename");

            const result = await fileNameWithExtension("/path/to/filename");

            expect(result).toBe("filename");
        });
    });

    describe("volumeExcelFilePath", () => {
        it("should return a valid file path", async () => {
            const result = await volumeExcelFilePath("/original/path/file.xlsx");

            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
            expect(result).toContain("file.xlsx");
        });
    });

    describe("convertToLinuxPath", () => {
        it("should return a string path", () => {
            const result = convertToLinuxPath("C:\\Users\\Test\\file.txt");

            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
        });

        it("should handle Unix paths", () => {
            const result = convertToLinuxPath("/home/user/file.txt");

            expect(result).toBe("/home/user/file.txt");
        });
    });

    describe("collectionFolder", () => {
        it("should return collection folder path without appendPath", async () => {
            const result = await collectionFolder();

            expect(result).toBeDefined();
            expect(result).toContain("collections");
        });

        it("should return collection folder path with appendPath", async () => {
            const result = await collectionFolder("subfolder/file.json");

            expect(result).toBeDefined();
            expect(result).toContain("collections");
            expect(result).toContain("subfolder/file.json");
        });
    });

    describe("joinPaths", () => {
        it("should join multiple paths", async () => {
            const result = await joinPaths(["path1", "path2", "path3"]);

            expect(join).toHaveBeenCalledWith("path1", "path2", "path3");
            expect(result).toBe("path1/path2/path3");
        });

        it("should handle single path", async () => {
            const result = await joinPaths(["single-path"]);

            expect(result).toBe("single-path");
        });

        it("should handle empty array", async () => {
            await joinPaths([]);

            expect(join).toHaveBeenCalledWith();
        });
    });
});
