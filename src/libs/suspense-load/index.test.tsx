import { render, screen } from "@testing-library/react";
import { SuspenseLoad } from "./index";
import { lazy } from "react";
import "@testing-library/jest-dom";

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'pleaseWaitLoading': 'Please wait, loading...'
      };
      return translations[key] || key;
    }
  })
}));

// Create a test component that throws to trigger suspense
const ThrowingComponent = () => {
  throw new Promise(() => {}); // Suspended component
};

// Create a normal component
const NormalComponent = () => <div>Loaded Content</div>;

describe("SuspenseLoad Component", () => {
  test("renders children when they are not suspended", () => {
    render(
      <SuspenseLoad>
        <NormalComponent />
      </SuspenseLoad>
    );

    expect(screen.getByText("Loaded Content")).toBeInTheDocument();
  });

  test("shows loading spinner with correct label", async () => {
    // Mock console.error to avoid React error boundary warnings in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <SuspenseLoad>
        <ThrowingComponent />
      </SuspenseLoad>
    );

    expect(screen.getByText("Please wait, loading...")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  test("renders multiple children correctly", () => {
    render(
      <SuspenseLoad>
        <div>First Child</div>
        <div>Second Child</div>
      </SuspenseLoad>
    );

    expect(screen.getByText("First Child")).toBeInTheDocument();
    expect(screen.getByText("Second Child")).toBeInTheDocument();
  });

  test("handles empty children", () => {
    render(<SuspenseLoad>{null}</SuspenseLoad>);

    // Should render without errors
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  test("applies correct styling to fallback", async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <SuspenseLoad>
        <ThrowingComponent />
      </SuspenseLoad>
    );

    const spinner = screen.getByRole("progressbar");
    const container = spinner.parentElement;

    expect(container?.className).toBeTruthy(); // Should have styling classes

    consoleSpy.mockRestore();
  });

  test("works with lazy loaded components", async () => {
    // Create a lazy component that resolves immediately
    const LazyComponent = lazy(() =>
      Promise.resolve({ default: () => <div>Lazy Loaded</div> })
    );

    render(
      <SuspenseLoad>
        <LazyComponent />
      </SuspenseLoad>
    );

    // Should eventually show the lazy component
    expect(await screen.findByText("Lazy Loaded")).toBeInTheDocument();
  });
});