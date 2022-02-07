/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  clearMocks: true,
  resetMocks: true,
  coverageDirectory: "coverage",
  errorOnDeprecated: true,
  setupFiles: ["<rootDir>/.jest/setupJest.js"],
  testEnvironment: "node",
  transformIgnorePatterns: ["node_modules/(?!(firebase-functions|fs)/)"],
};
