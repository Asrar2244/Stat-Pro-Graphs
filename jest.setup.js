import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import "@testing-library/jest-dom";

// Mock import.meta for Jest
globalThis.import = {
    meta: {
        env: {
            MODE: 'test',
            DEV: false,
            PROD: false,
            SSR: false
        }
    }
};

// Mock Tauri APIs
globalThis.window = globalThis.window || {};
globalThis.window.__TAURI_INTERNALS__ = {
    invoke: jest.fn(),
    transformCallback: jest.fn(),
};

// Mock HTMLCanvasElement for plotly
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
}));

// Mock ComlinkWorker for Jest
globalThis.ComlinkWorker = class ComlinkWorker {
    constructor(url, options) {
        // Mock the worker without actually creating it
        this.url = url;
        this.options = options;
        // Return a proxy that mocks any method calls
        return new Proxy(this, {
            get(target, prop) {
                if (prop in target) return target[prop];
                return jest.fn();
            }
        });
    }
};

// Mock URL constructor for worker paths
const OriginalURL = globalThis.URL;
globalThis.URL = class extends OriginalURL {
    constructor(url, base) {
        // Handle worker file paths
        if (typeof url === 'string' && url.startsWith('./')) {
            super('http://localhost/' + url.replace('./', ''));
        } else if (url && base) {
            try {
                super(url, base);
            } catch (e) {
                // Fallback for invalid URLs
                super('http://localhost/' + String(url));
            }
        } else {
            super(url, base);
        }
    }

    static createObjectURL = jest.fn(() => 'mock-object-url');
    static revokeObjectURL = jest.fn();
};

i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: { en: { translation: {} } },
    interpolation: { escapeValue: false },
});

// Mock i18next-http-backend to avoid errors
jest.mock('i18next-http-backend', () => {
    return function() {
        return {
            type: 'backend',
            init: jest.fn(),
            read: jest.fn(),
        };
    };
});

// Mock i18next-browser-languagedetector
jest.mock('i18next-browser-languagedetector', () => {
    return function() {
        return {
            type: 'languageDetector',
            init: jest.fn(),
            detect: jest.fn(() => 'en'),
            cacheUserLanguage: jest.fn(),
        };
    };
});

export default i18n;
