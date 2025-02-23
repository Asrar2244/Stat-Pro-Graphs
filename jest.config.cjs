module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom", // ✅ Ensures Jest runs in a browser-like environment
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
    },
    moduleNameMapper: {
        "^@libs/(.*)$": "<rootDir>/src/libs/$1",
        "^@libs$": "<rootDir>/src/libs",
        "^@constants/(.*)$": "<rootDir>/src/constants/$1",
        "^@constants$": "<rootDir>/src/constants",
        "^@backend/(.*)$": "<rootDir>/src/backend/$1",
        "^@backend$": "<rootDir>/src/backend",
        "^@utils/(.*)$": "<rootDir>/src/utils/$1",
        "^@utils$": "<rootDir>/src/utils",
        "^@store/(.*)$": "<rootDir>/src/store/$1",
        "^@store$": "<rootDir>/src/store",
        "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
        "^@hooks$": "<rootDir>/src/hooks",
        "^@workers/(.*)$": "<rootDir>/src/workers/$1",
        "^@workers$": "<rootDir>/src/workers"
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
