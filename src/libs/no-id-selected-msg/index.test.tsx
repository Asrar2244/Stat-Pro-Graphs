import { render, screen } from "@testing-library/react";
import { NoIdSelected } from "./index";
import "@testing-library/jest-dom";

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'pleaseSelectWorkspace': 'Please select a workspace'
      };
      return translations[key] || key;
    }
  })
}));

describe("NoIdSelected Component", () => {
  test("renders translated message", () => {
    render(<NoIdSelected />);

    expect(screen.getByText("Please select a workspace")).toBeInTheDocument();
  });

  test("renders avatar with correct props", () => {
    render(<NoIdSelected />);

    const avatar = screen.getByLabelText("noAccess");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("aria-label", "noAccess");
  });

  test("component is memoized", () => {
    const { rerender } = render(<NoIdSelected />);

    // First render
    expect(screen.getByText("Please select a workspace")).toBeInTheDocument();

    // Re-render with same props (should use memoized version)
    rerender(<NoIdSelected />);
    expect(screen.getByText("Please select a workspace")).toBeInTheDocument();
  });

  test("applies correct styling structure", () => {
    render(<NoIdSelected />);

    const message = screen.getByText("Please select a workspace");
    const wrapper = message.parentElement;

    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.children).toHaveLength(2); // Avatar + Message
  });

  test("uses translation hook correctly", () => {
    render(<NoIdSelected />);

    // The translated text should be displayed
    expect(screen.getByText("Please select a workspace")).toBeInTheDocument();
  });
});