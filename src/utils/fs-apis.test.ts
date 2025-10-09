import {
    copyExcelFileToVolume,
    removeExcelFileFromVolume,
    getExtension,
    saveLargeJsonToFile,
    readJsonFile,
    removeFileFromGivenPath,
    chunkArray,
    getFileSize,
    getFileNameFromPath,
    getDirPath,
    createTempFolder,
} from "./fs-apis";
import { exists, remove, mkdir } from "@tauri-apps/plugin-fs";
import { join, extname, basename, dirname } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";
import { homeDirectory } from "./app-apis";

jest.mock("@tauri-apps/plugin-fs");
jest.mock("@tauri-apps/api/path");
jest.mock("@tauri-apps/api/core");
jest.mock("./app-apis");

const mockEnv = {
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

describe("fs-apis utils", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockEnv.VITE_DOCKER_VOLUME_LOCATION = "";
        (homeDirectory as jest.Mock).mockResolvedValue("/home/user/.start-pro");
        (join as jest.Mock).mockImplementation((...paths: string[]) =>
            Promise.resolve(paths.join("/"))
        );
    });

    describe("copyExcelFileToVolume", () => {
        it("should return a valid path", async () => {
            const result = await copyExcelFileToVolume("/source/file.xlsx", "file.xlsx");

            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
            expect(result).toContain("file.xlsx");
        });
    });

    describe("removeExcelFileFromVolume", () => {
        it("should complete without error", async () => {
            await expect(removeExcelFileFromVolume("file.xlsx")).resolves.toBeUndefined();
        });
    });

    describe("getExtension", () => {
        it("should return file extension", async () => {
            (extname as jest.Mock).mockResolvedValue(".xlsx");

            const result = await getExtension("/path/to/file.xlsx");

            expect(extname).toHaveBeenCalledWith("/path/to/file.xlsx");
            expect(result).toBe(".xlsx");
        });

        it("should handle files without extension", async () => {
            (extname as jest.Mock).mockResolvedValue("");

            const result = await getExtension("/path/to/file");

            expect(result).toBe("");
        });
    });

    describe("saveLargeJsonToFile", () => {
        it("should invoke Tauri command to save JSON", async () => {
            const jsonData = { key: "value", nested: { data: [1, 2, 3] } };
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveLargeJsonToFile("/path/to/file.json", jsonData);

            expect(invoke).toHaveBeenCalledWith("save_json_to_file", {
                filePath: "/path/to/file.json",
                jsonData,
            });
        });

        it("should handle large JSON objects", async () => {
            const largeData = { items: new Array(10000).fill({ test: "data" }) };
            (invoke as jest.Mock).mockResolvedValue(undefined);

            await saveLargeJsonToFile("/path/file.json", largeData);

            expect(invoke).toHaveBeenCalled();
        });
    });

    describe("readJsonFile", () => {
        it("should invoke Tauri command to read JSON", async () => {
            const mockData = { key: "value" };
            (invoke as jest.Mock).mockResolvedValue(mockData);

            const result = await readJsonFile("/path/to/file.json");

            expect(invoke).toHaveBeenCalledWith("read_json_from_file", {
                filePath: "/path/to/file.json",
            });
            expect(result).toEqual(mockData);
        });
    });

    describe("removeFileFromGivenPath", () => {
        it("should remove file and return true when file exists", async () => {
            (exists as jest.Mock).mockResolvedValue(true);

            const result = await removeFileFromGivenPath("/path/to/file.txt");

            expect(remove).toHaveBeenCalledWith("/path/to/file.txt");
            expect(result).toBe(true);
        });

        it("should return false when file doesn't exist", async () => {
            (exists as jest.Mock).mockResolvedValue(false);

            const result = await removeFileFromGivenPath("/path/to/file.txt");

            expect(remove).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });

    describe("chunkArray", () => {
        it("should split array into chunks of specified size", () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const result = chunkArray(arr, 3);

            expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
        });

        it("should handle empty array", () => {
            const result = chunkArray([], 3);

            expect(result).toEqual([]);
        });

        it("should handle chunk size larger than array", () => {
            const arr = [1, 2, 3];
            const result = chunkArray(arr, 10);

            expect(result).toEqual([[1, 2, 3]]);
        });

        it("should handle chunk size of 1", () => {
            const arr = [1, 2, 3];
            const result = chunkArray(arr, 1);

            expect(result).toEqual([[1], [2], [3]]);
        });

        it("should handle exact division", () => {
            const arr = [1, 2, 3, 4, 5, 6];
            const result = chunkArray(arr, 2);

            expect(result).toEqual([[1, 2], [3, 4], [5, 6]]);
        });

        it("should work with string arrays", () => {
            const arr = ["a", "b", "c", "d", "e"];
            const result = chunkArray(arr, 2);

            expect(result).toEqual([["a", "b"], ["c", "d"], ["e"]]);
        });
    });

    describe("getFileSize", () => {
        it("should invoke Tauri command to get file size", async () => {
            (invoke as jest.Mock).mockResolvedValue(1024);

            const result = await getFileSize("/path/to/file.txt");

            expect(invoke).toHaveBeenCalledWith("get_file_size", {
                path: "/path/to/file.txt",
            });
            expect(result).toBe(1024);
        });

        it("should handle large file sizes", async () => {
            (invoke as jest.Mock).mockResolvedValue(1073741824); // 1GB

            const result = await getFileSize("/large/file.bin");

            expect(result).toBe(1073741824);
        });
    });

    describe("getFileNameFromPath", () => {
        it("should return filename from path", async () => {
            (basename as jest.Mock).mockResolvedValue("file.txt");

            const result = await getFileNameFromPath("/path/to/file.txt");

            expect(basename).toHaveBeenCalledWith("/path/to/file.txt");
            expect(result).toBe("file.txt");
        });
    });

    describe("getDirPath", () => {
        it("should return directory path", async () => {
            (dirname as jest.Mock).mockResolvedValue("/path/to");

            const result = await getDirPath("/path/to/file.txt");

            expect(dirname).toHaveBeenCalledWith("/path/to/file.txt");
            expect(result).toBe("/path/to");
        });
    });

    describe("createTempFolder", () => {
        it("should create temp folder when it doesn't exist", async () => {
            (exists as jest.Mock).mockResolvedValue(false);

            const result = await createTempFolder();

            expect(mkdir).toHaveBeenCalledWith("/home/user/.start-pro/temp", {
                recursive: true,
            });
            expect(result).toBe("/home/user/.start-pro/temp");
        });

        it("should return temp folder path when it exists", async () => {
            (exists as jest.Mock).mockResolvedValue(true);

            const result = await createTempFolder();

            expect(mkdir).not.toHaveBeenCalled();
            expect(result).toBe("/home/user/.start-pro/temp");
        });
    });
});
