import { render, screen } from "@testing-library/react";
import { DivShowScrollOnHover } from "./index";
import "@testing-library/jest-dom";

describe("DivShowScrollOnHover Component", () => {
  test("renders children correctly", () => {
    render(
      <DivShowScrollOnHover>
        <div>Test Content</div>
      </DivShowScrollOnHover>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("applies data-show-scroll attribute", () => {
    render(
      <DivShowScrollOnHover>
        <div>Content</div>
      </DivShowScrollOnHover>
    );

    const container = screen.getByText("Content").parentElement;
    expect(container).toHaveAttribute("data-show-scroll");
  });

  test("applies custom class when provided", () => {
    render(
      <DivShowScrollOnHover customClass="custom-scroll-class">
        <div>Content</div>
      </DivShowScrollOnHover>
    );

    const container = screen.getByText("Content").parentElement;
    expect(container).toHaveClass("custom-scroll-class");
  });

  test("renders multiple children", () => {
    render(
      <DivShowScrollOnHover>
        <div>First Child</div>
        <div>Second Child</div>
        <span>Third Child</span>
      </DivShowScrollOnHover>
    );

    expect(screen.getByText("First Child")).toBeInTheDocument();
    expect(screen.getByText("Second Child")).toBeInTheDocument();
    expect(screen.getByText("Third Child")).toBeInTheDocument();
  });

  test("renders without custom class", () => {
    render(
      <DivShowScrollOnHover>
        <div>Content</div>
      </DivShowScrollOnHover>
    );

    const container = screen.getByText("Content").parentElement;
    expect(container).toHaveAttribute("data-show-scroll");
    // Should have at least one class (the default styles)
    expect(container?.className).toBeTruthy();
  });
});