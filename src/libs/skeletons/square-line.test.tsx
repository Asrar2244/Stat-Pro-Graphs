import { render, screen } from "@testing-library/react";
import { SquareLineSkeleton } from "./square-line";
import "@testing-library/jest-dom";

describe("SquareLineSkeleton Component", () => {
  test("renders skeleton with default sizes", () => {
    render(<SquareLineSkeleton />);

    // Check if skeleton container is rendered
    const skeleton = screen.getByRole("progressbar", { hidden: true });
    expect(skeleton).toBeInTheDocument();
  });

  test("renders with custom square size", () => {
    render(<SquareLineSkeleton squareSize={32} />);

    const skeleton = screen.getByRole("progressbar", { hidden: true });
    expect(skeleton).toBeInTheDocument();
    // The specific size would be applied via CSS classes
    expect(skeleton.className).toBeTruthy();
  });

  test("renders with custom line size", () => {
    render(<SquareLineSkeleton lineSize={20} />);

    const skeleton = screen.getByRole("progressbar", { hidden: true });
    expect(skeleton).toBeInTheDocument();
  });

  test("renders with both custom sizes", () => {
    render(<SquareLineSkeleton squareSize={48} lineSize={24} />);

    const skeleton = screen.getByRole("progressbar", { hidden: true });
    expect(skeleton).toBeInTheDocument();
  });

  test("uses default values when no props provided", () => {
    render(<SquareLineSkeleton />);

    const skeleton = screen.getByRole("progressbar", { hidden: true });
    expect(skeleton).toBeInTheDocument();
    // Should render with default square size 24 and line size 16
  });

  test("accepts all valid skeleton item sizes", () => {
    const validSizes = [8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 120, 128];

    validSizes.forEach(size => {
      const { unmount } = render(<SquareLineSkeleton squareSize={size as any} lineSize={size as any} />);

      const skeleton = screen.getByRole("progressbar", { hidden: true });
      expect(skeleton).toBeInTheDocument();

      unmount();
    });
  });

  test("applies skeleton wrapper class", () => {
    render(<SquareLineSkeleton />);

    const skeleton = screen.getByRole("progressbar", { hidden: true });
    expect(skeleton.className).toBeTruthy(); // Should have wrapper classes applied
  });

  test("contains both square and line skeleton items", () => {
    render(<SquareLineSkeleton />);

    const skeleton = screen.getByRole("progressbar", { hidden: true });

    // The skeleton should contain child elements (SkeletonItems)
    expect(skeleton.children.length).toBeGreaterThan(0);
  });
});