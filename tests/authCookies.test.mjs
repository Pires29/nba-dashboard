import test from "node:test";
import assert from "node:assert/strict";
import { getUseSecureAuthCookies } from "../src/lib/authCookies.js";

test("auth cookies follow the configured public URL", () => {
  assert.equal(getUseSecureAuthCookies("https://app.example.com", "development"), true);
  assert.equal(getUseSecureAuthCookies("http://localhost:3000", "development"), false);
});

test("auth cookies are always secure in production", () => {
  assert.equal(getUseSecureAuthCookies("https://app.example.com", "production"), true);
  assert.equal(getUseSecureAuthCookies("http://localhost:3000", "production"), true);
  assert.equal(getUseSecureAuthCookies(null, "production"), true);
});

test("local QA builds can deliberately use localhost cookies", () => {
  assert.equal(
    getUseSecureAuthCookies("http://localhost:3000", "production", {
      QA_MODE: "true",
      QA_ALLOW_PRODUCTION_LOCAL: "true",
    }),
    false,
  );
});
