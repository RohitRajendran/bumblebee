// Sets env variables for tests
process.env = require("../env/local.sample.json");

// Mock Date.now()
require("jest-mock-now")();
