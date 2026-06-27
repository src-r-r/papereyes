module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/tests", "<rootDir>/src"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/background/**/*.js",
    "!src/content/**/*.js",
    "!src/popup/**/*.js",
    "!src/options/**/*.js",
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
