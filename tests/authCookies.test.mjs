import test from "node:test";
import assert from "node:assert/strict";
import { getUseSecureAuthCookies } from "../src/lib/authCookies.js";

test("auth cookies follow the configured public URL", () => {
  assert.equal(getUseSecureAuthCookies("https://app.example.com", "development"), true);
  assert.equal(getUseSecureAuthCookies("http://localhost:3000", "production"), false);
});

test("auth cookies are secure in production when no URL is configured", () => {
  assert.equal(getUseSecureAuthCookies(undefined, "production"), true);
  assert.equal(getUseSecureAuthCookies(undefined, "development"), false);
});
