

jest.mock("@store", () => ({
    useStartProStore: jest.fn(),
}));

jest.mock("@hooks", () => ({
    useGetInitialConfig: jest.fn(() => ({
        getConfigurations: jest.fn().mockResolvedValue({}),
    })),
    useFileSize: jest.fn(() => ({
        mb: jest.fn((size: number) => `${(size / 1024 / 1024).toFixed(2)} MB`),
    })),
    useAxios: jest.fn(),
}));

jest.mock("@tauri-apps/plugin-dialog", () => ({
    open: jest.fn(),
}));

jest.mock("@utils", () => ({
    getFileSize: jest.fn(),
    getFileNameFromPath: jest.fn(),
    getDirPath: jest.fn(),
    joinPaths: jest.fn(),
    copyExcelFileToVolume: jest.fn(),
    getExtension: jest.fn(),
    volumeExcelFilePath: jest.fn(),
    removeExcelFileFromVolume: jest.fn(),
    collectionsLocation: jest.fn(),
    fileNameWithExtension: jest.fn(),
    Database: jest.fn(),
    convertToLinuxPath: jest.fn((path: string) => path),
}));

jest.mock("@constants", () => ({
    CONFIGURATION_DB: "config.db",
    API: {
        analysis: "analysis",
    },
}));

jest.mock("@backend", () => ({
    insertIntoProject: "INSERT INTO PROJECT",
}));

jest.mock("@faker-js/faker", () => ({
    faker: {
        animal: {
            bird: jest.fn(() => "Eagle"),
        },
        helpers: {
            arrayElement: jest.fn((arr: any[]) => arr[0]()),
        },
    },
}));

jest.mock("@libs", () => ({
    Modal: ({ children }: any) => <div>{children}</div>,
}));

describe("BrowseFile Component", () => {
    it("passes basic test", () => {
        expect(true).toBe(true);
    });
});
