import { render } from "../../utils/test-utils";
import { CommonMessages } from "./index";
import { useTasks } from "@store";


jest.mock("@store", () => ({
    useTasks: jest.fn(),
}));

const renderSetUp = () => {
    const utils = render(<CommonMessages />);
    return {
        getSpinner: () => utils.queryByRole("progressbar"),
        getMessage: (text: string) => utils.getByText(text),
    };
};

describe("CommonMessages Component", () => {
    it("renders spinner when common.spinner is true", () => {
        (useTasks as unknown as jest.Mock).mockReturnValue({ common: { spinner: true, message: "Loading..." } });

        const { getSpinner, getMessage } = renderSetUp();

        expect(getSpinner()).toBeInTheDocument();
        expect(getMessage("Loading...")).toBeInTheDocument();
    });

    it("renders only message when spinner is false", () => {
        (useTasks as unknown as jest.Mock).mockReturnValue({ common: { spinner: false, message: "Completed" } });

        const { getSpinner, getMessage } = renderSetUp();

        expect(getSpinner()).not.toBeInTheDocument();
        expect(getMessage("Completed")).toBeInTheDocument();
    });
});
