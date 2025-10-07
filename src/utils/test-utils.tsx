import { render } from "@testing-library/react";
import i18n from "i18next";
import { initReactI18next, I18nextProvider } from "react-i18next";

// Initialize i18n for testing without browser-specific plugins
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: { en: { translation: {} } },
    interpolation: { escapeValue: false },
  });
}

const customRender = (ui: React.ReactElement, options = {}) =>
    render(<I18nextProvider i18n={i18n} > {ui} </I18nextProvider >, options);

export * from "@testing-library/react";
export { customRender as render };
