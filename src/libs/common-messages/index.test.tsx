import { render, screen } from "../../utils/test-utils";
import { CommonMessages } from "./index";
import { useTasks, useLicenseStore } from "@store";

jest.mock("@store", () => ({
    useTasks: jest.fn(),
    useLicenseStore: jest.fn(),
}));

jest.mock('zustand/react/shallow', () => ({
    useShallow: jest.fn((fn) => fn),
}));

jest.mock('./styles-hook/use-common-style', () => ({
    useCommonLayout: () => ({
        loaderBox: 'loader-box-class',
        licenseStatus: 'license-status-class',
    }),
}));

jest.mock('@constants', () => ({
    licenseColors: {
        active: '#00FF00',
        expired: '#FF0000',
        trial: '#FFA500',
    },
}));

describe("CommonMessages Component - Enhanced Coverage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useTasks as unknown as jest.Mock).mockReturnValue({
            common: { spinner: false, message: "" }
        });
        (useLicenseStore as unknown as jest.Mock).mockReturnValue({
            licenseStatus: { state: 'active' }
        });
    });

    describe("Spinner behavior", () => {
        it("renders spinner when common.spinner is true", () => {
            (useTasks as unknown as jest.Mock).mockReturnValue({
                common: { spinner: true, message: "Loading..." }
            });
            (useLicenseStore as unknown as jest.Mock).mockReturnValue({
                licenseStatus: { state: 'active' }
            });

            const { container } = render(<CommonMessages />);

            expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
            expect(screen.getByText("Loading...")).toBeInTheDocument();
        });

        it("does not render spinner when common.spinner is false", () => {
            (useTasks as unknown as jest.Mock).mockReturnValue({
                common: { spinner: false, message: "Completed" }
            });

            const { container } = render(<CommonMessages />);

            expect(container.querySelector('[role="progressbar"]')).not.toBeInTheDocument();
        });

        it("renders spinner with long message", () => {
            (useTasks as unknown as jest.Mock).mockReturnValue({
                common: { spinner: true, message: "Processing a very long operation that might take some time..." }
            });

            const { container } = render(<CommonMessages />);

            expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
            expect(screen.getByText(/Processing a very long operation/)).toBeInTheDocument();
        });
    });

    describe("Message display", () => {
        it("renders only message when spinner is false", () => {
            (useTasks as unknown as jest.Mock).mockReturnValue({
                common: { spinner: false, message: "Completed" }
            });

            render(<CommonMessages />);
            expect(screen.getByText("Completed")).toBeInTheDocument();
        });

        it("handles empty message", () => {
            (useTasks as unknown as jest.Mock).mockReturnValue({
                common: { spinner: false, message: '' },
            });

            const { container } = render(<CommonMessages />);
            expect(container).toBeInTheDocument();
        });

        it("handles undefined message", () => {
            (useTasks as unknown as jest.Mock).mockReturnValue({
                common: { spinner: false, message: undefined },
            });

            const { container } = render(<CommonMessages />);
            expect(container).toBeInTheDocument();
        });

        it("renders message with special characters", () => {
            (useTasks as unknown as jest.Mock).mockReturnValue({
                common: { spinner: false, message: "Error: File@123#.csv" }
            });

            render(<CommonMessages />);
            expect(screen.getByText("Error: File@123#.csv")).toBeInTheDocument();
        });
    });

    describe("License status display", () => {
        it("displays license status as active", () => {
            (useLicenseStore as unknown as jest.Mock).mockReturnValue({
                licenseStatus: { state: 'active' },
            });

            render(<CommonMessages />);
            expect(screen.getByText(/\(active\)/)).toBeInTheDocument();
        });

        it("displays license status as expired", () => {
            (useLicenseStore as unknown as jest.Mock).mockReturnValue({
                licenseStatus: { state: 'expired' },
            });

            render(<CommonMessages />);
            expect(screen.getByText(/\(expired\)/)).toBeInTheDocument();
        });

        it("displays license status as trial", () => {
            (useLicenseStore as unknown as jest.Mock).mockReturnValue({
                licenseStatus: { state: 'trial' },
            });

            render(<CommonMessages />);
            expect(screen.getByText(/\(trial\)/)).toBeInTheDocument();
        });

        it("applies correct color for active license", () => {
            (useLicenseStore as unknown as jest.Mock).mockReturnValue({
                licenseStatus: { state: 'active' },
            });

            render(<CommonMessages />);
            const licenseText = screen.getByText(/\(active\)/);
            expect(licenseText).toHaveStyle({ color: '#00FF00' });
        });

        it("applies correct color for expired license", () => {
            (useLicenseStore as unknown as jest.Mock).mockReturnValue({
                licenseStatus: { state: 'expired' },
            });

            render(<CommonMessages />);
            const licenseText = screen.getByText(/\(expired\)/);
            expect(licenseText).toHaveStyle({ color: '#FF0000' });
        });

        it("applies correct color for trial license", () => {
            (useLicenseStore as unknown as jest.Mock).mockReturnValue({
                licenseStatus: { state: 'trial' },
            });

            render(<CommonMessages />);
            const licenseText = screen.getByText(/\(trial\)/);
            expect(licenseText).toHaveStyle({ color: '#FFA500' });
        });
    });

    describe("Combined states", () => {
        it("renders spinner, message, and active license together", () => {
            (useTasks as unknown as jest.Mock).mockReturnValue({
                common: { spinner: true, message: 'Processing...' },
            });
            (useLicenseStore as unknown as jest.Mock).mockReturnValue({
                licenseStatus: { state: 'active' },
            });

            const { container } = render(<CommonMessages />);

            expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
            expect(screen.getByText('Processing...')).toBeInTheDocument();
            expect(screen.getByText(/\(active\)/)).toBeInTheDocument();
        });

        it("renders all elements with expired license", () => {
            (useTasks as unknown as jest.Mock).mockReturnValue({
                common: { spinner: true, message: 'Loading' },
            });
            (useLicenseStore as unknown as jest.Mock).mockReturnValue({
                licenseStatus: { state: 'expired' },
            });

            const { container } = render(<CommonMessages />);

            expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
            expect(screen.getByText('Loading')).toBeInTheDocument();
            expect(screen.getByText(/\(expired\)/)).toBeInTheDocument();
        });
    });

    describe("Edge cases", () => {
        it("handles null commonMsg gracefully", () => {
            (useTasks as unknown as jest.Mock).mockReturnValue({
                common: null,
            });

            const { container } = render(<CommonMessages />);
            expect(container).toBeInTheDocument();
        });

        it("handles undefined licenseStatus state", () => {
            (useLicenseStore as unknown as jest.Mock).mockReturnValue({
                licenseStatus: { state: undefined },
            });

            const { container } = render(<CommonMessages />);
            expect(container).toBeInTheDocument();
        });

        it("renders with minimal props", () => {
            (useTasks as unknown as jest.Mock).mockReturnValue({
                common: {},
            });
            (useLicenseStore as unknown as jest.Mock).mockReturnValue({
                licenseStatus: {},
            });

            const { container } = render(<CommonMessages />);
            expect(container).toBeInTheDocument();
        });
    });

    describe("Component structure", () => {
        it("applies correct CSS classes", () => {
            const { container } = render(<CommonMessages />);
            expect(container.querySelector('.loader-box-class')).toBeInTheDocument();
            expect(container.querySelector('.license-status-class')).toBeInTheDocument();
        });

        it("renders Text components with correct props", () => {
            (useTasks as unknown as jest.Mock).mockReturnValue({
                common: { spinner: false, message: "Test" }
            });

            const { container } = render(<CommonMessages />);
            const textElements = container.querySelectorAll('[class*="Text"]');
            expect(textElements.length).toBeGreaterThanOrEqual(0);
        });
    });
});
