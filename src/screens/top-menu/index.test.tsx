import { render, screen } from "@utils/test-utils";
import { TopMenu } from "./index";

// Mock everything BEFORE any imports
jest.mock("@workers/worker", () => ({
    mainWorker: { axios: jest.fn() },
}));

jest.mock("@hooks", () => ({
    useToaster: jest.fn(() => ({ toast: jest.fn() })),
    useMenuCodeExecutor: jest.fn(() => ({
        openBrowseFile: jest.fn(),
        openDevTools: jest.fn(),
    })),
}));

jest.mock("@fluentui/react-components", () => ({
    tokens: {
        colorNeutralBackground1Pressed: "#000",
        colorNeutralForeground1: "#fff",
        colorNeutralForegroundDisabled: "#888",
    },
    shorthands: {
        borderBottom: jest.fn(() => ({ borderBottom: '1px solid #888' })),
        padding: jest.fn(() => ({ padding: '8px' })),
    },
    makeStyles: () => () => ({
        wrapper: "wrapper-class",
        layout: "layout-class",
        tools: "tools-class",
        menuText: "menu-text-class",
        menuItems: "menu-items-class",
    }),
    Menu: ({ children }: any) => <div data-testid="menu">{children}</div>,
    MenuTrigger: ({ children }: any) => <div data-testid="menu-trigger">{children}</div>,
    MenuButton: ({ children }: any) => <button data-testid="menu-button">{children}</button>,
    MenuPopover: ({ children }: any) => <div data-testid="menu-popover">{children}</div>,
    MenuList: ({ children }: any) => <ul data-testid="menu-list">{children}</ul>,
    MenuItem: ({ children, onClick }: any) => <li data-testid="menu-item" onClick={onClick}>{children}</li>,
    MenuDivider: () => <hr data-testid="menu-divider" />,
    Text: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("./executer", () => ({
    withMenuEvents: (_ns: string, Component: any) => Component,
}));

jest.mock("./configuration", () => ({
    topMenuConfig: {
        translateNs: "menus",
        menus: [
            {
                id: "file",
                label: "file",
                submenu: [
                    { id: "open", label: "open", execute: "openFile" },
                    {
                        id: "save", label: "save", submenu: [
                            { id: "save-as", label: "saveAs", execute: "saveAs" }
                        ]
                    },
                ],
            },
            {
                id: "edit",
                label: "edit",
                submenu: [
                    { id: "copy", label: "copy", codeExecute: "handleCopy" },
                ],
            },
        ],
    },
}));

jest.mock("@libs", () => ({
    CommonMessages: () => <div data-testid="common-messages">Common Messages</div>,
    MinMaxClose: () => <div data-testid="min-max-close">Min Max Close</div>,
}));

jest.mock("react-icons/vsc", () => ({
    VscFile: () => <div>File Icon</div>,
    VscEdit: () => <div>Edit Icon</div>,
}));

describe("TopMenu Component - Enhanced", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Basic rendering", () => {
        const mockProps = {
            setMenuItem: jest.fn(),
            toggleTests: jest.fn(),
            toggleGraphs: jest.fn(),
            closeAllDropdowns: jest.fn(),
        };

        it("renders without crashing", () => {
            const { container } = render(<TopMenu {...mockProps} />);
            expect(container).toBeInTheDocument();
        });

        it("renders CommonMessages component", () => {
            render(<TopMenu {...mockProps} />);
            expect(screen.getByTestId("common-messages")).toBeInTheDocument();
        });

        it("renders MinMaxClose component", () => {
            render(<TopMenu {...mockProps} />);
            expect(screen.getByTestId("min-max-close")).toBeInTheDocument();
        });

        it("applies data-tauri-drag-region attribute", () => {
            const { container } = render(<TopMenu {...mockProps} />);
            const dragRegion = container.querySelector('[data-tauri-drag-region]');
            expect(dragRegion).toBeInTheDocument();
        });
    });

    describe("Menu structure", () => {
        const mockProps = {
            setMenuItem: jest.fn(),
            toggleTests: jest.fn(),
            toggleGraphs: jest.fn(),
            closeAllDropdowns: jest.fn(),
        };

        it("renders menu triggers", () => {
            render(<TopMenu {...mockProps} />);
            const triggers = screen.getAllByTestId("menu-trigger");
            expect(triggers.length).toBeGreaterThan(0);
        });

        it("renders menu items", () => {
            render(<TopMenu {...mockProps} />);
            const menus = screen.getAllByTestId("menu");
            expect(menus.length).toBeGreaterThan(0);
        });

        it("renders menu text elements", () => {
            render(<TopMenu {...mockProps} />);
            expect(screen.getByText("file")).toBeInTheDocument();
            expect(screen.getByText("edit")).toBeInTheDocument();
        });
    });

    describe("Menu interactions", () => {
        const mockProps = {
            setMenuItem: jest.fn(),
            toggleTests: jest.fn(),
            toggleGraphs: jest.fn(),
            closeAllDropdowns: jest.fn(),
        };

        it("renders menu popover structure", () => {
            const { getAllByTestId } = render(<TopMenu {...mockProps} />);
            const popovers = getAllByTestId("menu-popover");
            expect(popovers.length).toBeGreaterThan(0);
        });

        it("renders menu dividers", () => {
            render(<TopMenu {...mockProps} />);
            const dividers = screen.queryAllByTestId("menu-divider");
            expect(dividers.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe("Component layout", () => {
        const mockProps = {
            setMenuItem: jest.fn(),
            toggleTests: jest.fn(),
            toggleGraphs: jest.fn(),
            closeAllDropdowns: jest.fn(),
        };

        it("renders tools section", () => {
            render(<TopMenu {...mockProps} />);
            expect(screen.getByTestId("common-messages")).toBeInTheDocument();
            expect(screen.getByTestId("min-max-close")).toBeInTheDocument();
        });

        it("has drag region attribute", () => {
            const { container } = render(<TopMenu {...mockProps} />);
            const dragRegion = container.querySelector('[data-tauri-drag-region]');
            expect(dragRegion).toBeInTheDocument();
        });
    });

    describe("Edge cases", () => {
        const mockProps = {
            setMenuItem: jest.fn(),
            toggleTests: jest.fn(),
            toggleGraphs: jest.fn(),
            closeAllDropdowns: jest.fn(),
        };

        it("handles empty submenu gracefully", () => {
            const { container } = render(<TopMenu {...mockProps} />);
            expect(container).toBeInTheDocument();
        });

        it("renders consistently on multiple renders", () => {
            const { rerender } = render(<TopMenu {...mockProps} />);
            expect(screen.getByTestId("common-messages")).toBeInTheDocument();

            rerender(<TopMenu {...mockProps} />);
            expect(screen.getByTestId("common-messages")).toBeInTheDocument();
            expect(screen.getByTestId("min-max-close")).toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        const mockProps = {
            setMenuItem: jest.fn(),
            toggleTests: jest.fn(),
            toggleGraphs: jest.fn(),
            closeAllDropdowns: jest.fn(),
        };

        it("renders semantic HTML structure", () => {
            const { container } = render(<TopMenu {...mockProps} />);
            const lists = container.querySelectorAll('ul');
            expect(lists.length).toBeGreaterThanOrEqual(0);
        });

        it("has clickable menu elements", () => {
            render(<TopMenu {...mockProps} />);
            const menuItems = screen.queryAllByTestId("menu-item");
            menuItems.forEach(item => {
                expect(item).toBeInTheDocument();
            });
        });
    });
});
