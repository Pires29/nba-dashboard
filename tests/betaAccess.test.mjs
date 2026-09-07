import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  createBetaAccessToken,
  isValidBetaAccessToken,
  isValidBetaCode,
} from "../src/lib/betaAccess.js";

const ORIGINAL_ENV = {
  APP_PHASE: process.env.APP_PHASE,
  BETA_ACCESS_CODES: process.env.BETA_ACCESS_CODES,
  BETA_ACCESS_SECRET: process.env.BETA_ACCESS_SECRET,
  CLOSED_BETA: process.env.CLOSED_BETA,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXT_PUBLIC_APP_PHASE: process.env.NEXT_PUBLIC_APP_PHASE,
};

afterEach(() => {
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

test("validates beta access codes from the environment", () => {
  process.env.BETA_ACCESS_CODES = "alpha,beta";

  assert.equal(isValidBetaCode("alpha"), true);
  assert.equal(isValidBetaCode(" beta "), true);
  assert.equal(isValidBetaCode("gamma"), false);
});

test("creates and validates signed beta access tokens", async () => {
  process.env.APP_PHASE = "beta";
  process.env.BETA_ACCESS_SECRET = "test-secret";
  delete process.env.CLOSED_BETA;
  delete process.env.NEXTAUTH_SECRET;
  delete process.env.NEXT_PUBLIC_APP_PHASE;

  const token = await createBetaAccessToken();

  assert.equal(await isValidBetaAccessToken(token), true);
  assert.equal(await isValidBetaAccessToken(`${token}x`), false);
});

test("allows access when closed beta is disabled", async () => {
  process.env.APP_PHASE = "public";
  delete process.env.CLOSED_BETA;
  delete process.env.NEXT_PUBLIC_APP_PHASE;

  assert.equal(await isValidBetaAccessToken(""), true);
});
