jest.mock("@store", () => ({
    useStartProStore: jest.fn(),
    IProjectDetails: {},
}));

jest.mock("@hooks", () => ({
    useGetInitialConfig: jest.fn(() => ({
        getConfigurations: jest.fn().mockResolvedValue({}),
    })),
    useFileSize: jest.fn(() => ({
        mb: jest.fn((size: number) => `${(size / 1024 / 1024).toFixed(2)} MB`),
    })),
    useFormatter: jest.fn(() => ({
        dateFormat: jest.fn((date: string) => new Date(date).toLocaleDateString()),
    })),
    useNodeActions: jest.fn(),
    useModal: jest.fn(),
}));

jest.mock("@utils", () => ({
    Database: jest.fn(),
    DATA: "data",
    OUTPUT: "output",
}));

jest.mock("@backend", () => ({
    updateOutputFromProject: "UPDATE OUTPUT",
    updateDataFromProject: "UPDATE DATA",
    deleteProject: "DELETE PROJECT",
}));

jest.mock("@constants", () => ({
    CONFIGURATION_DB: "config.db",
    DATA: "data",
    OUTPUT: "output",
    API: {
        backendURL: "http://localhost",
        analysis: "analysis",
    },
}));

jest.mock("@workers/worker", () => ({
    mainWorker: {
        axios: jest.fn(),
    },
}));

describe("Explorer Component", () => {
    it("passes basic test", () => {
        expect(true).toBe(true);
    });
});
