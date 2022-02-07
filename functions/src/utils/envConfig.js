import { config as fsConfig } from "firebase-functions";
import { existsSync } from "fs";

let config = fsConfig().env;

if (process.env.NODE_ENV !== "production") {
  if (existsSync("../env/local.json")) {
    import env from "../../../env/local.json";

    config = env;
  }
}

export default config;
