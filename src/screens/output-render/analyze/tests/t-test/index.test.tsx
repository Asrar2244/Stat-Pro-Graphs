jest.mock("@libs", () => ({
    CardTableRender: () => <div>Table</div>,
}));

jest.mock("../test-screen", () => ({
    TestResultScreen: () => <div>Test Screen</div>,
}));

jest.mock("../../../../top-menu/advanced/tests/t-test/styles-hook/use-test-styles", () => ({
    useCommonStyles: jest.fn(() => ({ commonWrapper: "wrapper" })),
}));

describe("TTestComponent", () => {
    it("passes basic test", () => {
        expect(true).toBe(true);
    });
});
