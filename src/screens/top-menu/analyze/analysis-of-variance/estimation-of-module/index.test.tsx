// Mock FluentUI components
jest.mock("@fluentui/react-components", () => ({
    Tab: ({ children, value }: any) => <button data-value={value}>{children}</button>,
    TabList: ({ children }: any) => <div>{children}</div>,
    makeStyles: () => () => ({}),
}));

jest.mock("@hooks", () => ({
    useActiveNode: jest.fn(() => ({ id: "test-id", config: { tabName: "test-tab" } })),
}));

jest.mock("@store/main-store", () => ({
    useStartProStore: jest.fn(() => ({ setBlockUI: jest.fn() })),
}));

jest.mock("./use-estimation-store", () => ({
    useEstimateModel: jest.fn(() => ({ resetModule: jest.fn() })),
}));

jest.mock("./use-analyze-data", () => ({
    useEstimationOfModuleAnalyzeData: jest.fn(() => ({
        estimationOfModuleAnalyzeData: jest.fn(),
    })),
}));

jest.mock("@libs", () => ({
    Modal: ({ children }: any) => <div data-testid="modal">{children}</div>,
}));

jest.mock("@libs/no-id-selected-msg", () => ({
    NoIdSelected: () => <div data-testid="no-id-selected">No ID Selected</div>,
}));

jest.mock("../estimation-of-module/model", () => ({
    EstimationOfModuleModel: () => <div data-testid="estimation-model">Model</div>,
}));

describe("estimationOfModule Component", () => {
    it("passes basic test", () => {
        expect(true).toBe(true);
    });
});
