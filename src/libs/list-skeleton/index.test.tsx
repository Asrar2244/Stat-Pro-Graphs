import { render, screen } from "@testing-library/react";
import { ListSkeleton } from "./index";
import "@testing-library/jest-dom";

describe("ListSkeleton Component", () => {
  test("renders correct number of skeletons", () => {
    render(<ListSkeleton skeletonCount={3} />);

    const skeletons = screen.getAllByRole("progressbar", { hidden: true });
    expect(skeletons).toHaveLength(3);
  });

  test("renders single skeleton when count is 1", () => {
    render(<ListSkeleton skeletonCount={1} />);

    const skeletons = screen.getAllByRole("progressbar", { hidden: true });
    expect(skeletons).toHaveLength(1);
  });

  test("renders no skeletons when count is 0", () => {
    render(<ListSkeleton skeletonCount={0} />);

    const skeletons = screen.queryAllByRole("progressbar", { hidden: true });
    expect(skeletons).toHaveLength(0);
  });

  test("renders many skeletons correctly", () => {
    render(<ListSkeleton skeletonCount={10} />);

    const skeletons = screen.getAllByRole("progressbar", { hidden: true });
    expect(skeletons).toHaveLength(10);
  });

  test("each skeleton has unique key", () => {
    render(<ListSkeleton skeletonCount={5} />);

    // All skeletons should be rendered as separate elements
    const skeletons = screen.getAllByRole("progressbar", { hidden: true });
    expect(skeletons).toHaveLength(5);

    // Each skeleton should be distinct
    skeletons.forEach((skeleton) => {
      expect(skeleton).toBeInTheDocument();
    });
  });

  test("handles large numbers correctly", () => {
    render(<ListSkeleton skeletonCount={50} />);

    const skeletons = screen.getAllByRole("progressbar", { hidden: true });
    expect(skeletons).toHaveLength(50);
  });
});