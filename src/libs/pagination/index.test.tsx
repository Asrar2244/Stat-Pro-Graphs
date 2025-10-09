import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "./index";
import "@testing-library/jest-dom";

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'totalRecords': 'Total Records',
        'pageSize': 'Page Size',
        'first': 'First',
        'previous': 'Previous',
        'next': 'Next',
        'last': 'Last',
        'jump': 'Jump to page',
        'totalPages': 'Total Pages'
      };
      return translations[key] || key;
    }
  })
}));

// Mock constants
jest.mock('@constants', () => ({
  DEFAULT_PAGES: [10, 25, 50, 100]
}));

const defaultProps = {
  totalRecords: 100,
  pageSize: 10,
  currentPage: 1,
  pageCount: 10,
  firstPage: jest.fn(),
  previousPage: jest.fn(),
  nextPage: jest.fn(),
  lastPage: jest.fn(),
  pageSizeChanged: jest.fn(),
  jumpChanged: jest.fn(),
  dataLoader: jest.fn(),
  startIndex: 0,
  stopIndex: 9
};

describe("Pagination Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders total records correctly", () => {
    render(<Pagination {...defaultProps} />);

    expect(screen.getByText("Total Records")).toBeInTheDocument();
    expect(screen.getAllByText("100")).toHaveLength(2); // One for total records, one for page size option
  });

  test("renders page size selector", () => {
    render(<Pagination {...defaultProps} />);

    const select = screen.getByDisplayValue("10");
    expect(select).toBeInTheDocument();
  });

  test("hides page size selector when showPageSize is false", () => {
    render(<Pagination {...defaultProps} showPageSize={false} />);

    expect(screen.queryByDisplayValue("10")).not.toBeInTheDocument();
  });

  test("calls pageSizeChanged when page size is changed", () => {
    render(<Pagination {...defaultProps} />);

    const select = screen.getByDisplayValue("10");
    fireEvent.change(select, { target: { value: "25" } });

    expect(defaultProps.pageSizeChanged).toHaveBeenCalledWith(25);
  });

  test("renders navigation buttons", () => {
    render(<Pagination {...defaultProps} />);

    expect(screen.getByLabelText("First")).toBeInTheDocument();
    expect(screen.getByLabelText("Previous")).toBeInTheDocument();
    expect(screen.getByLabelText("Next")).toBeInTheDocument();
    expect(screen.getByLabelText("Last")).toBeInTheDocument();
  });

  test("disables first and previous buttons on first page", () => {
    render(<Pagination {...defaultProps} currentPage={1} />);

    expect(screen.getByLabelText("First")).toBeDisabled();
    expect(screen.getByLabelText("Previous")).toBeDisabled();
  });

  test("disables next and last buttons on last page", () => {
    render(<Pagination {...defaultProps} currentPage={10} pageCount={10} />);

    expect(screen.getByLabelText("Next")).toBeDisabled();
    expect(screen.getByLabelText("Last")).toBeDisabled();
  });

  test("calls navigation functions when buttons are clicked", () => {
    render(<Pagination {...defaultProps} currentPage={5} />);

    fireEvent.click(screen.getByLabelText("First"));
    expect(defaultProps.firstPage).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("Previous"));
    expect(defaultProps.previousPage).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("Next"));
    expect(defaultProps.nextPage).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("Last"));
    expect(defaultProps.lastPage).toHaveBeenCalled();
  });

  test("handles jump to page functionality", () => {
    render(<Pagination {...defaultProps} currentPage={1} />);

    const jumpInput = screen.getByLabelText("Jump to page");
    fireEvent.change(jumpInput, { target: { value: "5" } });

    expect(defaultProps.jumpChanged).toHaveBeenCalledWith(5);
  });

  test("ignores invalid jump values", () => {
    render(<Pagination {...defaultProps} currentPage={1} pageCount={10} />);

    const jumpInput = screen.getByLabelText("Jump to page");

    // Test jump to page > pageCount
    fireEvent.change(jumpInput, { target: { value: "15" } });
    expect(defaultProps.jumpChanged).not.toHaveBeenCalled();

    // Test jump to page <= 0
    fireEvent.change(jumpInput, { target: { value: "0" } });
    expect(defaultProps.jumpChanged).not.toHaveBeenCalled();
  });

  test("disables jump input when enableJump is false", () => {
    render(<Pagination {...defaultProps} enableJump={false} />);

    const jumpInput = screen.getByLabelText("Jump to page");
    expect(jumpInput).toBeDisabled();
  });

  test("displays current page and total pages", () => {
    render(<Pagination {...defaultProps} currentPage={5} pageCount={10} />);

    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
    expect(screen.getAllByText("10")).toHaveLength(2); // One for page count, one for page size option
  });
});