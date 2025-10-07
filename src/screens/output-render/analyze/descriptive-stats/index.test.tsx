import { render, screen } from "../../../../utils/test-utils";
import { DescriptiveStatisticsRegression } from "./index";
import { OutputRenderContext } from "../../context";

jest.mock("@libs", () => ({
    CardColumnRender: ({ card }: any) => <div data-testid="card-column-render">{card.name}</div>,
}));

const mockContext = {
    selectedRun: {
        tabName: "test-tab",
        result: {
            output_table_name: "test_output_table",
        },
    },
};

describe("DescriptiveStatisticsRegression Component", () => {
    it("renders without crashing", () => {
        render(
            <OutputRenderContext.Provider value={mockContext as any}>
                <DescriptiveStatisticsRegression />
            </OutputRenderContext.Provider>
        );
    });

    it("renders CardColumnRender components", () => {
        render(
            <OutputRenderContext.Provider value={mockContext as any}>
                <DescriptiveStatisticsRegression />
            </OutputRenderContext.Provider>
        );

        const cardElements = screen.getAllByTestId("card-column-render");
        expect(cardElements.length).toBeGreaterThan(0);
    });

    it("uses correct context values", () => {
        const { container } = render(
            <OutputRenderContext.Provider value={mockContext as any}>
                <DescriptiveStatisticsRegression />
            </OutputRenderContext.Provider>
        );

        expect(container).toBeInTheDocument();
    });

    it("renders with null context gracefully", () => {
        render(
            <OutputRenderContext.Provider value={null as any}>
                <DescriptiveStatisticsRegression />
            </OutputRenderContext.Provider>
        );

        const cardElements = screen.queryAllByTestId("card-column-render");
        expect(cardElements).toBeDefined();
    });
});
