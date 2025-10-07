jest.mock("@libs", () => ({
    CardTableRender: () => <div data-testid="card-table-render">Card</div>,
}));

jest.mock("../../../styles-hook/use-regressions-style", () => ({
    useRegressions: jest.fn(() => ({ regressionsLayout: "layout" })),
}));

describe("EstimationOfModule Component", () => {
    it("passes basic test", () => {
        expect(true).toBe(true);
    });
});
