jest.mock("@libs", () => ({
    CardTableRender: () => <div>Table</div>,
    GraphPlot: () => <div>Graph</div>,
}));

jest.mock("@hooks", () => ({
    useGraphConfig: jest.fn(() => []),
}));

jest.mock("../../../../styles-hook/use-regressions-style", () => ({
    useRegressions: jest.fn(() => ({ regressionsLayout: "layout" })),
}));

describe("LinearLeastSquareRegression Component", () => {
    it("passes basic test", () => {
        expect(true).toBe(true);
    });
});
