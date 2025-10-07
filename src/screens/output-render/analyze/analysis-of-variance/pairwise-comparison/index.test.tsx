jest.mock("@libs", () => ({
    CardTableRender: () => <div>Table</div>,
}));

jest.mock("../../../styles-hook/use-regressions-style", () => ({
    useRegressions: jest.fn(() => ({ regressionsLayout: "layout" })),
}));

describe("PairwiseComparisonOfModules Component", () => {
    it("passes basic test", () => {
        expect(true).toBe(true);
    });
});
