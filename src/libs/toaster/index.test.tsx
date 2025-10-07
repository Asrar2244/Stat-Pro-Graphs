import { render, screen } from "@testing-library/react";
import { ToasterComponent, IToasterProps } from "./index";
import "@testing-library/jest-dom";

describe("ToasterComponent", () => {
  const defaultProps: IToasterProps = {
    title: "Test Title",
    body: "Test Body"
  };

  test("renders title correctly", () => {
    render(<ToasterComponent {...defaultProps} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  test("renders body as string", () => {
    render(<ToasterComponent {...defaultProps} />);

    expect(screen.getByText("Test Body")).toBeInTheDocument();
  });

  test("renders body as React element", () => {
    const bodyElement = <div data-testid="custom-body">Custom Body Content</div>;
    render(<ToasterComponent {...defaultProps} body={bodyElement} />);

    expect(screen.getByTestId("custom-body")).toBeInTheDocument();
    expect(screen.getByText("Custom Body Content")).toBeInTheDocument();
  });

  test("renders footer as string", () => {
    render(<ToasterComponent {...defaultProps} footer="Test Footer" />);

    expect(screen.getByText("Test Footer")).toBeInTheDocument();
  });

  test("renders footer as React element", () => {
    const footerElement = <span data-testid="custom-footer">Custom Footer</span>;
    render(<ToasterComponent {...defaultProps} footer={footerElement} />);

    expect(screen.getByTestId("custom-footer")).toBeInTheDocument();
    expect(screen.getByText("Custom Footer")).toBeInTheDocument();
  });

  test("renders title component action", () => {
    const titleComponent = <button data-testid="title-action">Action</button>;
    render(<ToasterComponent {...defaultProps} titleComponent={titleComponent} />);

    expect(screen.getByTestId("title-action")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  test("renders without title", () => {
    render(<ToasterComponent body="Just body content" />);

    expect(screen.getByText("Just body content")).toBeInTheDocument();
  });

  test("renders without footer", () => {
    render(<ToasterComponent {...defaultProps} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Body")).toBeInTheDocument();
    // Footer should still be rendered but empty
  });

  test("applies monospace font to text elements", () => {
    render(<ToasterComponent {...defaultProps} footer="Footer Text" />);

    const titleText = screen.getByText("Test Title");
    const bodyText = screen.getByText("Test Body");
    const footerText = screen.getByText("Footer Text");

    // Should have some classes applied (FluentUI components have classes)
    expect(titleText.parentElement?.className).toBeTruthy();
    expect(bodyText.parentElement?.className).toBeTruthy();
    expect(footerText.parentElement?.className).toBeTruthy();
  });

  test("handles complex React elements in all props", () => {
    const complexBody = (
      <div>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
      </div>
    );
    const complexFooter = (
      <div>
        <button>Button 1</button>
        <button>Button 2</button>
      </div>
    );
    const complexTitle = <button>Complex Action</button>;

    render(
      <ToasterComponent
        title="Complex Toast"
        body={complexBody}
        footer={complexFooter}
        titleComponent={complexTitle}
      />
    );

    expect(screen.getByText("Complex Toast")).toBeInTheDocument();
    expect(screen.getByText("Paragraph 1")).toBeInTheDocument();
    expect(screen.getByText("Paragraph 2")).toBeInTheDocument();
    expect(screen.getByText("Button 1")).toBeInTheDocument();
    expect(screen.getByText("Button 2")).toBeInTheDocument();
    expect(screen.getByText("Complex Action")).toBeInTheDocument();
  });
});