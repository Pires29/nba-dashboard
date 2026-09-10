import test from "node:test";
import assert from "node:assert/strict";
import { validateProductionPublicUrls } from "../src/lib/productionEnvironment.js";

const productionEnvironment = {
  NODE_ENV: "production",
  NEXTAUTH_URL: "https://www.propinsight.app",
  NEXT_PUBLIC_APP_URL: "https://www.propinsight.app",
};

test("accepts matching HTTPS public origins in production", () => {
  assert.doesNotThrow(() => validateProductionPublicUrls(productionEnvironment));
});

test("rejects insecure, missing, or mismatched production public origins", () => {
  assert.throws(
    () =>
      validateProductionPublicUrls({
        ...productionEnvironment,
        NEXTAUTH_URL: "http://www.propinsight.app",
      }),
    /NEXTAUTH_URL must be an HTTPS origin/,
  );
  assert.throws(
    () =>
      validateProductionPublicUrls({
        ...productionEnvironment,
        NEXT_PUBLIC_APP_URL: "https://app.propinsight.app",
      }),
    /must use the same origin/,
  );
  assert.throws(
    () =>
      validateProductionPublicUrls({
        ...productionEnvironment,
        NEXTAUTH_URL: "",
      }),
    /NEXTAUTH_URL is required/,
  );
});

test("allows the explicit localhost-only QA production build", () => {
  assert.doesNotThrow(() =>
    validateProductionPublicUrls({
      NODE_ENV: "production",
      QA_MODE: "true",
      QA_ALLOW_PRODUCTION_LOCAL: "true",
      NEXTAUTH_URL: "http://localhost:3000",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    }),
  );
});
