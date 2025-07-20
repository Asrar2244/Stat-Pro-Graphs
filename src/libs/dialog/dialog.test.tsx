
import { render, fireEvent } from "../../utils/test-utils";
import { Dialog } from "./dialog";
import { useStartProStore } from "@store/main-store";

// Mock the store
jest.mock("@store/main-store", () => ({
    useStartProStore: jest.fn(),
}));

// Mock translation function with actual values
jest.mock("react-i18next", () => {
    const original = jest.requireActual("react-i18next");
    return {
        ...original,
        useTranslation: () => ({
            t: (key: string) => TRANSLATIONS[key] || key,
        }),
    }
});

// Simulated translations
const TRANSLATIONS: Record<string, string> = {
    errorOccurred: "An error occurred",
    somethingWentWrong: "Something went wrong",
    ok: "OK",
};

const renderSetUp = () => {
    const utils = render(<Dialog />);
    return {
        getDialog: () => utils.queryByRole("dialog"),
        getMessage: (text: string) => utils.queryByText(text),
        getOkButton: () => utils.queryByRole("button", { name: TRANSLATIONS.ok }),
        clickOkButton: () => fireEvent.click(utils.getByRole("button", { name: TRANSLATIONS.ok })),
    };
};

describe("Dialog Component (With Translations)", () => {
    it("renders translated error message when blockUI is true", () => {
        (useStartProStore as unknown as jest.Mock).mockReturnValue({
            blockUI: { value: true, msg: "errorOccurred", hideOk: false },
            setBlockUI: jest.fn(),
        });

        const { getDialog, getMessage, getOkButton } = renderSetUp();

        expect(getDialog()).toBeInTheDocument();
        expect(getMessage(TRANSLATIONS.errorOccurred)).toBeInTheDocument();
        expect(getOkButton()).toBeInTheDocument();
    });

    it("renders fallback translation when message key is missing", () => {
        (useStartProStore as unknown as jest.Mock).mockReturnValue({
            blockUI: { value: true, msg: "unknownKey", hideOk: false },
            setBlockUI: jest.fn(),
        });

        const { getMessage } = renderSetUp();

        expect(getMessage("unknownKey")).toBeInTheDocument(); // Shows key itself as fallback
    });

    it("renders 'Something went wrong' when blockUI message is empty", () => {
        (useStartProStore as unknown as jest.Mock).mockReturnValue({
            blockUI: { value: true, msg: "", hideOk: false },
            setBlockUI: jest.fn(),
        });

        const { getMessage } = renderSetUp();

        expect(getMessage(TRANSLATIONS.somethingWentWrong)).toBeInTheDocument();
    });

    it("closes dialog when OK button is clicked", () => {
        const mockSetBlockUI = jest.fn();
        (useStartProStore as unknown as jest.Mock).mockReturnValue({
            blockUI: { value: true, msg: "errorOccurred", hideOk: false },
            setBlockUI: mockSetBlockUI,
        });

        const { clickOkButton } = renderSetUp();

        clickOkButton();
        expect(mockSetBlockUI).toHaveBeenCalledWith({ value: false, msg: "" });
    });

    it("does not render OK button when hideOk is true", () => {
        (useStartProStore as unknown as jest.Mock).mockReturnValue({
            blockUI: { value: true, msg: "errorOccurred", hideOk: true },
            setBlockUI: jest.fn(),
        });

        const { getOkButton } = renderSetUp();

        expect(getOkButton()).not.toBeInTheDocument();
    });
});
