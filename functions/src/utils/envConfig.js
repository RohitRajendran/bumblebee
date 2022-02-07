import { config as fsConfig } from "firebase-functions";
import { existsSync } from "fs";

let config = fsConfig().bb;

if (process.env.NODE_ENV !== "production") {
  if (existsSync("../../../env/local.json")) {
    // eslint-disable-line
    const env = require("../../../env/local.json");

    config = env;
  }
}

export default config;
