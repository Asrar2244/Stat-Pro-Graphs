import { render, screen, fireEvent, waitFor } from "../../../../../utils/test-utils";
import { TestsAnalysis } from "./index";

const mockUseActiveNode = jest.fn(() => ({
    id: "test-id",
    config: { test: "config" },
}));

jest.mock("@hooks", () => ({
    useModal: jest.fn((config: any) => ({
        open: config?.initialOpen ?? false,
        openModal: jest.fn(),
        closeModal: jest.fn(),
    })),
    useActiveNode: (_args: any) => mockUseActiveNode(),
}));

jest.mock("@store/main-store", () => ({
    useStartProStore: jest.fn(() => ({
        setBlockUI: jest.fn(),
    })),
}));

jest.mock("./use-t-tests", () => ({
    useTTestsStats: jest.fn(() => ({
        setReset: jest.fn(),
    })),
}));

jest.mock("./use-prep-analysis", () => ({
    usePrepareAnalysis: jest.fn(() => ({
        executeAnalysis: jest.fn(),
    })),
}));

jest.mock("../options/use-tests-config", () => ({
    useTestsStats: jest.fn(() => ({
        setModel: jest.fn(),
    })),
}));

jest.mock("@utils", () => ({
    readJsonFile: jest.fn().mockResolvedValue({}),
}));

jest.mock("../../../../../utils/app-apis", () => ({
    homeDirectory: jest.fn().mockResolvedValue("/home/test"),
}));

jest.mock("@tauri-apps/api/path", () => ({
    join: jest.fn().mockResolvedValue("/home/test/config.json"),
}));

jest.mock("@constants/db", () => ({
    CONFIG_FILE: "config.json",
}));

jest.mock("@constants/home-folders", () => ({
    COLLECTION_DIR: "collections",
}));

jest.mock("@libs", () => ({
    Modal: ({ children, title, showCancel, showNext, closeModal, ok, next }: any) => (
        <div data-testid="modal">
            <h2>{title}</h2>
            {showCancel && <button onClick={closeModal}>Close</button>}
            {showNext && <button onClick={next?.onClick}>Next</button>}
            <button onClick={ok?.onClick} disabled={ok?.disabled}>Back</button>
            {children}
        </div>
    ),
}));

jest.mock("@libs/no-id-selected-msg", () => ({
    NoIdSelected: () => <div data-testid="no-id-selected">No ID Selected</div>,
}));

jest.mock("./data-format", () => ({
    DataFormatScreens: ({ pageIndex, selectedDataFormat }: any) => (
        <div data-testid="data-format-screens">
            Page: {pageIndex}, Format: {selectedDataFormat}
        </div>
    ),
}));

describe("TestsAnalysis Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseActiveNode.mockReturnValue({
            id: "test-id",
            config: { test: "config" },
        });
    });

    it("renders modal with correct title", () => {
        render(<TestsAnalysis open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.getByText("titleData")).toBeInTheDocument();
    });

    it("shows NoIdSelected when id is empty", () => {
        mockUseActiveNode.mockReturnValue({
            id: "", config: {
                test: ""
            }
        });

        render(<TestsAnalysis open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.getByTestId("no-id-selected")).toBeInTheDocument();
    });

    it("shows DataFormatScreens when id is present", () => {
        render(<TestsAnalysis open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.getByTestId("data-format-screens")).toBeInTheDocument();
    });

    it("initializes with page index 0", () => {
        render(<TestsAnalysis open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.getByText(/Page: 0/)).toBeInTheDocument();
    });

    it("initializes with raw data format", () => {
        render(<TestsAnalysis open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.getByText(/Format: raw/)).toBeInTheDocument();
    });

    it("renders Next button", () => {
        render(<TestsAnalysis open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.getByText("Next")).toBeInTheDocument();
    });

    it("renders Back button", () => {
        render(<TestsAnalysis open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.getByText("Back")).toBeInTheDocument();
    });

    it("Back button is disabled on first page", () => {
        render(<TestsAnalysis open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        const backButton = screen.getByText("Back");
        expect(backButton).toBeDisabled();
    });

    it("handles next button click to advance pages", async () => {
        render(<TestsAnalysis open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        const nextButton = screen.getByText("Next");
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText(/Page: 1/)).toBeInTheDocument();
        });
    });

    it("handles back button click to go to previous page", async () => {
        render(<TestsAnalysis open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        // Click next to go to page 1
        const nextButton = screen.getByText("Next");
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText(/Page: 1/)).toBeInTheDocument();
        });

        // Click back to return to page 0
        const backButton = screen.getByText("Back");
        fireEvent.click(backButton);

        await waitFor(() => {
            expect(screen.getByText(/Page: 0/)).toBeInTheDocument();
        });
    });

    it("executes analysis when on last page and next is clicked", async () => {
        const mockExecuteAnalysis = jest.fn();
        const { usePrepareAnalysis } = require("./use-prep-analysis");
        usePrepareAnalysis.mockReturnValue({
            executeAnalysis: mockExecuteAnalysis,
        });

        const mockCloseModal = jest.fn();
        render(<TestsAnalysis open={true} closeModal={mockCloseModal} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        // Navigate to last page (page 1)
        const nextButton = screen.getByText("Next");
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText(/Page: 1/)).toBeInTheDocument();
        });

        // Click next on last page
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(mockExecuteAnalysis).toHaveBeenCalledWith("test-id");
        });
    });

    it("calls closeModal when close button is clicked", () => {
        const mockCloseModal = jest.fn();
        render(<TestsAnalysis open={true} closeModal={mockCloseModal} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        const closeButton = screen.getByText("Close");
        fireEvent.click(closeButton);

        expect(mockCloseModal).toHaveBeenCalled();
    });

    it("hides cancel button when no id is selected", () => {
        mockUseActiveNode.mockReturnValue({
            id: "", config: {
                test: ""
            }
        });

        render(<TestsAnalysis open={true} closeModal={jest.fn()} toggleModal={function (): void {
            throw new Error("Function not implemented.");
        }} openModal={function (): void {
            throw new Error("Function not implemented.");
        }} />);

        expect(screen.queryByText("Close")).not.toBeInTheDocument();
    });
});
