import { render, fireEvent } from "../../utils/test-utils";
import { CheckListRender } from "./index";
import "@testing-library/jest-dom";



const renderSetup = (props = {}) => {
    const defaultProps = {
        list: { Item1: false, Item2: false },
        selected: false,
        setSelectAll: jest.fn(),
        ...props,
    };

    const utils = render(<CheckListRender {...defaultProps} />);
    return { ...utils, setSelectAll: defaultProps.setSelectAll };
};

describe("CheckListRender Component", () => {
    test("renders checkboxes correctly", () => {
        const { getByLabelText } = renderSetup({ list: { Item1: false, Item2: true } });

        expect(getByLabelText("Item1")).toBeInTheDocument();
        expect(getByLabelText("Item2")).toBeInTheDocument();
    });

    test("checks a checkbox and updates setSelectAll", () => {
        const { getByLabelText, setSelectAll } = renderSetup();

        const item1Checkbox = getByLabelText("Item1");
        fireEvent.click(item1Checkbox);

        expect(setSelectAll).toHaveBeenCalledWith("mixed");
    });

    test("sets setSelectAll to true when all checkboxes are checked", () => {
        const { getByLabelText, setSelectAll } = renderSetup();

        fireEvent.click(getByLabelText("Item1"));
        fireEvent.click(getByLabelText("Item2"));

        expect(setSelectAll).toHaveBeenCalledWith(true);
    });

    test("sets setSelectAll to false when all checkboxes are unchecked", () => {
        const { getByLabelText, setSelectAll } = renderSetup({ list: { Item1: true, Item2: true }, selected: true });

        fireEvent.click(getByLabelText("Item1"));
        fireEvent.click(getByLabelText("Item2"));

        expect(setSelectAll).toHaveBeenCalledWith(false);
    });
});
