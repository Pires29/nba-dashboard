import test from "node:test";
import assert from "node:assert/strict";
import { isValidEmail, normalizeEmail, safeInternalPath } from "../src/lib/security.js";
import { checkRateLimit } from "../src/lib/rateLimit.js";

test("normalizes and validates email addresses", () => {
  assert.equal(normalizeEmail("  USER@Example.COM  "), "user@example.com");
  assert.equal(isValidEmail("user@example.com"), true);
  assert.equal(isValidEmail("not-an-email"), false);
});

test("allows internal callback paths and rejects external redirects", () => {
  assert.equal(safeInternalPath("/playersStats?playerId=1"), "/playersStats?playerId=1");
  assert.equal(safeInternalPath("https://example.com/phishing"), "/");
  assert.equal(safeInternalPath("//example.com/phishing"), "/");
  assert.equal(safeInternalPath("/\\example.com"), "/");
});

test("rate limiter blocks requests after the configured limit", () => {
  const key = `test:${crypto.randomUUID()}`;
  assert.equal(checkRateLimit(key, { limit: 2, windowMs: 60_000 }).allowed, true);
  assert.equal(checkRateLimit(key, { limit: 2, windowMs: 60_000 }).allowed, true);
  const blocked = checkRateLimit(key, { limit: 2, windowMs: 60_000 });
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfter > 0);
});

