// Mock Date.now()
require("jest-mock-now")();

// Use sample json
jest.mock("../src/utils/envConfig.js", () => {
  return require("../../env/local.sample.json");
});
