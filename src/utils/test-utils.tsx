import { render } from "@testing-library/react";
import i18n from "../providers/i18";
import { I18nextProvider } from "react-i18next";

const customRender = (ui: React.ReactElement, options = {}) =>
    render(<I18nextProvider i18n={i18n} > {ui} </I18nextProvider >, options);

export * from "@testing-library/react";
export { customRender as render };
