import { render, screen } from "@testing-library/react";
import { Fieldset } from "./index";
import "@testing-library/jest-dom";

describe("Fieldset Component", () => {
  test("renders fieldset with string title", () => {
    render(
      <Fieldset title="Test Title">
        <div>Content</div>
      </Fieldset>
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByRole("group")).toBeInTheDocument();
  });

  test("renders fieldset with React element title", () => {
    const titleElement = <span data-testid="custom-title">Custom Title</span>;

    render(
      <Fieldset title={titleElement as any}>
        <div>Content</div>
      </Fieldset>
    );

    expect(screen.getByTestId("custom-title")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  test("renders fieldset without title", () => {
    render(
      <Fieldset>
        <div>Content Only</div>
      </Fieldset>
    );

    expect(screen.getByText("Content Only")).toBeInTheDocument();
    expect(screen.getByRole("group")).toBeInTheDocument();
  });

  test("applies custom className", () => {
    render(
      <Fieldset title="Test" className="custom-class">
        <div>Content</div>
      </Fieldset>
    );

    const fieldset = screen.getByRole("group");
    expect(fieldset).toHaveClass("custom-class");
  });

  test("passes through additional props", () => {
    render(
      <Fieldset title="Test" data-testid="custom-fieldset" disabled>
        <div>Content</div>
      </Fieldset>
    );

    const fieldset = screen.getByTestId("custom-fieldset");
    expect(fieldset).toBeDisabled();
  });
});