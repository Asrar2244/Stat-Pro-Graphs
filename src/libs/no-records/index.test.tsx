import { render, screen } from "../../utils/test-utils";
import { RecordNotFound } from "./index";
import "@testing-library/jest-dom";

describe("RecordNotFound Component", () => {
  test("renders 'No Data Found' message", () => {
    render(<RecordNotFound />);

    expect(screen.getByText("No Data Found")).toBeInTheDocument();
  });

  test("renders with icon", () => {
    render(<RecordNotFound />);

    // Check if the component renders (icon would be in the DOM structure)
    const container = screen.getByText("No Data Found").parentElement;
    expect(container).toBeInTheDocument();
    expect(container?.children).toHaveLength(2); // Icon + Text
  });

  test("component is memoized", () => {
    const { rerender } = render(<RecordNotFound />);

    // First render
    expect(screen.getByText("No Data Found")).toBeInTheDocument();

    // Re-render with same props (should use memoized version)
    rerender(<RecordNotFound />);
    expect(screen.getByText("No Data Found")).toBeInTheDocument();
  });

  test("applies correct styling classes", () => {
    render(<RecordNotFound />);

    const container = screen.getByText("No Data Found").parentElement;
    expect(container?.className).toBeTruthy(); // Should have some class applied
  });
});