import { render, screen, fireEvent, waitFor } from "../../../../utils/test-utils";
import { DescriptiveStatistics } from "./index";

const mockUseActiveNode = jest.fn(() => ({
    id: "test-id",
    config: { test: "config" },
}));

jest.mock("@hooks", () => ({
    useActiveNode: (_args: any[]) => mockUseActiveNode(),
    useColumnsRowsCount: jest.fn(() => ({
        columns: [
            { name: "column1", type: "numeric" },
            { name: "column2", type: "numeric" },
        ],
    })),
}));

jest.mock("./use-descriptive-statistics", () => ({
    useDescriptiveStatistics: jest.fn(() => ({
        setReset: jest.fn(),
    })),
}));

jest.mock("./use-prep-analysis", () => ({
    usePrepareAnalysis: jest.fn(() => ({
        executeAnalysis: jest.fn(),
    })),
}));

jest.mock("@store/main-store", () => ({
    useStartProStore: jest.fn(() => ({
        setBlockUI: jest.fn(),
    })),
}));

jest.mock("./styles-hook/use-descriptive-statistics-styles", () => ({
    useCommonStyles: jest.fn(() => ({
        commonWrapper: "commonWrapper",
    })),
}));

jest.mock("@libs", () => ({
    Modal: ({ children, title, okLabel, cancelLabel, showCancel, ok }: any) => (
        <div data-testid="modal">
            <h2>{title}</h2>
            <button onClick={ok?.onClick}>{okLabel}</button>
            {showCancel && <button>{cancelLabel}</button>}
            {children}
        </div>
    ),
}));

jest.mock("@libs/no-id-selected-msg", () => ({
    NoIdSelected: () => <div data-testid="no-id-selected">No ID Selected</div>,
}));

jest.mock("./main", () => ({
    Main: () => <div data-testid="main-content">Main Content</div>,
}));

describe("DescriptiveStatistics Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseActiveNode.mockReturnValue({
            id: "test-id",
            config: { test: "config" },
        });
    });

    it("renders modal with correct title", () => {
        render(<DescriptiveStatistics open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.getByText("title")).toBeInTheDocument();
    });

    it("shows NoIdSelected when id is empty", () => {
        mockUseActiveNode.mockReturnValue({
            id: "", config: {
                test: ""
            }
        });

        render(<DescriptiveStatistics open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.getByTestId("no-id-selected")).toBeInTheDocument();
    });

    it("shows Main component when id is present", () => {
        render(<DescriptiveStatistics open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.getByTestId("main-content")).toBeInTheDocument();
    });

    it("renders OK button", () => {
        render(<DescriptiveStatistics open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.getByText("ok")).toBeInTheDocument();
    });

    it("renders cancel button when id is present", () => {
        render(<DescriptiveStatistics open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.getByText("close")).toBeInTheDocument();
    });

    it("hides cancel button when id is not present", () => {
        mockUseActiveNode.mockReturnValue({
            id: "", config: {
                test: ""
            }
        });

        render(<DescriptiveStatistics open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.queryByText("close")).not.toBeInTheDocument();
    });

    it("applies correct styling from useCommonStyles", () => {
        const { container } = render(<DescriptiveStatistics open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        const wrapper = container.querySelector(".commonWrapper");
        expect(wrapper).toBeInTheDocument();
    });

    it("calls executeAnalysis when OK is clicked", async () => {
        const mockExecuteAnalysis = jest.fn();
        const { usePrepareAnalysis } = require("./use-prep-analysis");
        usePrepareAnalysis.mockReturnValue({
            executeAnalysis: mockExecuteAnalysis,
        });

        render(<DescriptiveStatistics open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        const okButton = screen.getByText("ok");
        fireEvent.click(okButton);

        await waitFor(() => {
            expect(mockExecuteAnalysis).toHaveBeenCalledWith("test-id");
        });
    });

    it("renders modal when open is true", () => {
        const mockCloseModal = jest.fn();
        render(<DescriptiveStatistics open={true} closeModal={mockCloseModal} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.getByText("title")).toBeInTheDocument();
    });

    it("calls closeModal after OK is clicked", async () => {
        const mockCloseModal = jest.fn();
        render(<DescriptiveStatistics open={true} closeModal={mockCloseModal} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        const okButton = screen.getByText("ok");
        fireEvent.click(okButton);

        await waitFor(() => {
            expect(mockCloseModal).toHaveBeenCalled();
        });
    });

    it("sets block UI when executing analysis", async () => {
        const mockSetBlockUI = jest.fn();
        const { useStartProStore } = require("@store/main-store");
        useStartProStore.mockReturnValue({
            setBlockUI: mockSetBlockUI,
        });

        render(<DescriptiveStatistics open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        const okButton = screen.getByText("ok");
        fireEvent.click(okButton);

        await waitFor(() => {
            expect(mockSetBlockUI).toHaveBeenCalledWith({
                value: true,
                msg: "processRequest",
                hideOk: true,
            });
        });
    });

    it("uses correct translation namespace", () => {
        render(<DescriptiveStatistics open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.getByText("title")).toBeInTheDocument();
        expect(screen.getByText("ok")).toBeInTheDocument();
        expect(screen.getByText("close")).toBeInTheDocument();
    });
});
