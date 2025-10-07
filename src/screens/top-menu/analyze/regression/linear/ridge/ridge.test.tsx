import { render, screen, fireEvent } from "../../../../../../utils/test-utils";
import { Ridge } from "./ridge";

jest.mock("@hooks", () => ({
    useActiveNode: jest.fn(() => ({
        id: "test-id",
        config: { test: "config" },
    })),
    useColumnsRowsCount: jest.fn(() => ({
        columns: [
            { name: "column1", type: "numeric" },
            { name: "column2", type: "numeric" },
            { name: "column3", type: "numeric" },
        ],
    })),
}));

jest.mock("@store/main-store", () => ({
    useStartProStore: jest.fn(() => ({
        setBlockUI: jest.fn(),
    })),
}));

jest.mock("./use-ridge-store-hook", () => ({
    useRidge: jest.fn(() => ({
        ridge: {
            availableList: { column1: false, column2: false },
            dependentList: {},
            independentList: {},
            lambdaRangeOfValues: false,
            lambdaMinimum: 0,
            lambdaMaximum: 10,
            lambdaIncrement: 1,
            lambdaIndividual: false,
            lambdaIndividualValues: [],
            saveCoefficient: false,
        },
        setRidge: jest.fn(),
    })),
}));

jest.mock("./use-ridge-analyze", () => ({
    useRidgePrepare: jest.fn(),
}));

jest.mock("./styles-hook/use-ridge-hook", () => ({
    useRidgeStyles: jest.fn(() => ({
        modelLayout: "modelLayout",
        modelWrapper: "modelWrapper",
        removeButtons: "removeButtons",
        lambda: "lambda",
        individualBox: "individualBox",
    })),
}));

jest.mock("@libs", () => ({
    Fieldset: ({ children, title }: any) => (
        <fieldset data-testid="fieldset">
            <legend>{title}</legend>
            {children}
        </fieldset>
    ),
    CheckListRender: ({ list }: any) => (
        <div data-testid="check-list-render">
            {Object.keys(list).map((key) => (
                <div key={key}>{key}</div>
            ))}
        </div>
    ),
}));

describe("Ridge Component", () => {
    it("renders without Ridge UI", () => {
        render(<Ridge />);
        expect(screen.getByText("dependent")).toBeInTheDocument();
        expect(screen.getByText("independent")).toBeInTheDocument();
        expect(screen.getByText("availableVar")).toBeInTheDocument();
        expect(screen.getByText("lambdaRang")).toBeInTheDocument();
        expect(screen.getByText("lambdaIndivisal")).toBeInTheDocument();
        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes.length).toBeGreaterThan(0);
        expect(screen.getByText("sendToDependent")).toBeInTheDocument();

        expect(screen.getByText("removeFromIndependent")).toBeInTheDocument();
        expect(screen.getByText("removeFromDependent")).toBeInTheDocument();
        expect(screen.getByText("sendToIndependent")).toBeInTheDocument();
        expect(screen.getByText("minimum")).toBeInTheDocument();
        expect(screen.getByText("maximum")).toBeInTheDocument();
        expect(screen.getByText("increment")).toBeInTheDocument();

        expect(screen.getByText("saveCoefficient")).toBeInTheDocument();
    });

    it("handles select all checkbox change", () => {
        const mockSetRidge = jest.fn();
        const { useRidge } = require("./use-ridge-store-hook");
        useRidge.mockReturnValue({
            ridge: {
                availableList: { column1: false, column2: false },
                dependentList: {},
                independentList: {},
                lambdaRangeOfValues: false,
                lambdaMinimum: 0,
                lambdaMaximum: 10,
                lambdaIncrement: 1,
                lambdaIndividual: false,
                lambdaIndividualValues: [],
                saveCoefficient: false,
            },
            setRidge: mockSetRidge,
        });

        render(<Ridge />);
        const checkboxes = screen.getAllByRole("checkbox");
        fireEvent.click(checkboxes[0]);

        expect(mockSetRidge).toHaveBeenCalled();
    });

    it("lambda range inputs are disabled when checkbox is unchecked", () => {
        render(<Ridge />);
        const inputs = screen.getAllByRole("spinbutton");
        const lambdaInputs = inputs.slice(0, 3); // minimum, maximum, increment

        lambdaInputs.forEach((input) => {
            expect(input).toBeDisabled();
        });
    });

    it("displays column names in CheckListRender", () => {
        render(<Ridge />);
        expect(screen.getByText("column1")).toBeInTheDocument();
        expect(screen.getByText("column2")).toBeInTheDocument();
    });

    it("handles lambda range checkbox change", () => {
        const mockSetRidge = jest.fn();
        const { useRidge } = require("./use-ridge-store-hook");
        useRidge.mockReturnValue({
            ridge: {
                availableList: { column1: false },
                dependentList: {},
                independentList: {},
                lambdaRangeOfValues: false,
                lambdaMinimum: 0,
                lambdaMaximum: 10,
                lambdaIncrement: 1,
                lambdaIndividual: false,
                lambdaIndividualValues: [],
                saveCoefficient: false,
            },
            setRidge: mockSetRidge,
        });

        render(<Ridge />);
        const rangeCheckbox = screen.getByLabelText("rangeOfValues");
        fireEvent.click(rangeCheckbox);

        expect(mockSetRidge).toHaveBeenCalledWith({ lambdaRangeOfValues: true });
    });

    it("handles number input changes", () => {
        const mockSetRidge = jest.fn();
        const { useRidge } = require("./use-ridge-store-hook");
        useRidge.mockReturnValue({
            ridge: {
                availableList: {},
                dependentList: {},
                independentList: {},
                lambdaRangeOfValues: true,
                lambdaMinimum: 0,
                lambdaMaximum: 10,
                lambdaIncrement: 1,
                lambdaIndividual: false,
                lambdaIndividualValues: [],
                saveCoefficient: false,
            },
            setRidge: mockSetRidge,
        });

        render(<Ridge />);
        const inputs = screen.getAllByRole("spinbutton");
        if (inputs.length > 0) {
            fireEvent.change(inputs[0], { target: { name: 'lambdaMinimum', value: '5' } });
            expect(mockSetRidge).toHaveBeenCalled();
        }
    });

    it("handles send button clicks", () => {
        const mockSetRidge = jest.fn();
        const { useRidge } = require("./use-ridge-store-hook");
        useRidge.mockReturnValue({
            ridge: {
                availableList: { column1: true },
                dependentList: {},
                independentList: {},
                lambdaRangeOfValues: false,
                lambdaMinimum: 0,
                lambdaMaximum: 10,
                lambdaIncrement: 1,
                lambdaIndividual: false,
                lambdaIndividualValues: [],
                saveCoefficient: false,
            },
            setRidge: mockSetRidge,
        });

        render(<Ridge />);
        const sendButton = screen.getByText("sendToDependent");
        fireEvent.click(sendButton);

        expect(mockSetRidge).toHaveBeenCalled();
    });

    it("handles remove button clicks", () => {
        const mockSetRidge = jest.fn();
        const { useRidge } = require("./use-ridge-store-hook");
        useRidge.mockReturnValue({
            ridge: {
                availableList: {},
                dependentList: { column1: true },
                independentList: {},
                lambdaRangeOfValues: false,
                lambdaMinimum: 0,
                lambdaMaximum: 10,
                lambdaIncrement: 1,
                lambdaIndividual: false,
                lambdaIndividualValues: [],
                saveCoefficient: false,
            },
            setRidge: mockSetRidge,
        });

        render(<Ridge />);
        const removeButton = screen.getByText("removeFromDependent");
        fireEvent.click(removeButton);

        expect(mockSetRidge).toHaveBeenCalled();
    });
});
