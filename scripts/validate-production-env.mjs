import { validateProductionPublicUrls } from "../src/lib/productionEnvironment.js";

if (process.argv.includes("--production")) {
  process.env.NODE_ENV = "production";
}

validateProductionPublicUrls();
