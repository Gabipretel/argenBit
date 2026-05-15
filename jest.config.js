/** @type {import("jest").Config} */
module.exports = {
  preset: "jest-expo",
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/"],
  transformIgnorePatterns: [
    "/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|react-redux|@sentry/react-native|native-base|@reduxjs|immer))",
    "/node_modules/react-native-reanimated/plugin/",
  ],
};
