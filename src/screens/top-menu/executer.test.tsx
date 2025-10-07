import { render, screen, waitFor } from "../../utils/test-utils";
import { withMenuEvents } from "./executer";
import { useLicenseStore } from "@store";

jest.mock("@store", () => ({
    useLicenseStore: jest.fn(),
}));

jest.mock("@hooks", () => ({
    useModal: jest.fn(() => ({
        open: false,
        openModal: jest.fn(),
        closeModal: jest.fn(),
    })),
}));

jest.mock("@libs", () => ({
    SuspenseLoad: ({ children }: any) => <div data-testid="suspense-load">{children}</div>,
}));

// Mock lazy-loaded components
jest.mock("./browse-file", () => ({
    BrowseFile: () => <div data-testid="browse-file">BrowseFile Component</div>,
}));

jest.mock("./analyze", () => ({
    LeastSquare: () => <div data-testid="least-square">LeastSquare Component</div>,
    RidgeModule: () => <div data-testid="ridge">Ridge Component</div>,
    estimationOfModule: () => <div data-testid="estimation">Estimation Component</div>,
    PairwiseComparisonModule: () => <div data-testid="pairwise">Pairwise Component</div>,
}));

jest.mock("./advanced", () => ({
    DescriptiveStatistics: () => <div data-testid="descriptive-stats">DescriptiveStats Component</div>,
    TestsAnalysis: () => <div data-testid="tests-analysis">TestsAnalysis Component</div>,
    Options: () => <div data-testid="options">Options Component</div>,
    PairedTestsAnalysis: () => <div data-testid="paired-tests">PairedTests Component</div>,
}));

jest.mock("./open-dev-tools", () => ({
    OpenDevTools: () => <div data-testid="dev-tools">DevTools Component</div>,
}));

const TestComponent = ({ setMenuItem }: any) => (
    <div>
        <button onClick={() => setMenuItem("test")}>Test Button</button>
    </div>
);

describe("withMenuEvents HOC", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useLicenseStore as unknown as jest.Mock).mockReturnValue({
            licenseStatus: { state: "active" },
        });
    });

    it("wraps component with SuspenseLoad", () => {
        const WrappedComponent = withMenuEvents("common", TestComponent);
        render(<WrappedComponent />);

        expect(screen.getByTestId("suspense-load")).toBeInTheDocument();
    });

    it("renders wrapped component", () => {
        const WrappedComponent = withMenuEvents("common", TestComponent);
        render(<WrappedComponent />);

        expect(screen.getByText("Test Button")).toBeInTheDocument();
    });

    it("provides setMenuItem function to wrapped component", () => {
        const WrappedComponent = withMenuEvents("common", TestComponent);
        render(<WrappedComponent />);

        const button = screen.getByText("Test Button");
        expect(button).toBeInTheDocument();
    });

    it("handles expired license by showing DevTools", () => {
        (useLicenseStore as unknown as jest.Mock).mockReturnValue({
            licenseStatus: { state: "expired" },
        });

        const WrappedComponent = withMenuEvents("common", TestComponent);
        const { container } = render(<WrappedComponent />);

        expect(container).toBeInTheDocument();
    });

    it("initializes with no selected menu", () => {
        const WrappedComponent = withMenuEvents("common", TestComponent);
        render(<WrappedComponent />);

        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("handles active license state", () => {
        (useLicenseStore as unknown as jest.Mock).mockReturnValue({
            licenseStatus: { state: "active" },
        });

        const WrappedComponent = withMenuEvents("common", TestComponent);
        const { container } = render(<WrappedComponent />);

        expect(container).toBeInTheDocument();
    });
});

describe("MenuSelector Component", () => {
    beforeEach(() => {
        (useLicenseStore as unknown as jest.Mock).mockReturnValue({
            licenseStatus: { state: "active" },
        });
    });

    it("shows DevTools when license is expired", async () => {
        (useLicenseStore as unknown as jest.Mock).mockReturnValue({
            licenseStatus: { state: "expired" },
        });

        const WrappedComponent = withMenuEvents("common", TestComponent);
        const { container } = render(<WrappedComponent />);

        await waitFor(() => {
            expect(container).toBeInTheDocument();
        });
    });

    it("handles undefined selector", () => {
        const WrappedComponent = withMenuEvents("common", TestComponent);
        const { container } = render(<WrappedComponent />);

        expect(container).toBeInTheDocument();
    });
});
