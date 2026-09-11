import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  createBetaRedemptionToken,
  isValidBetaRedemptionToken,
} from "../src/lib/betaAccess.js";
import { resolveBetaAccess } from "../src/lib/resolveBetaAccess.js";

const ORIGINAL_ENV = {
  APP_PHASE: process.env.APP_PHASE,
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

test("creates short-lived beta redemption tokens", async () => {
  process.env.APP_PHASE = "beta";
  process.env.BETA_ACCESS_SECRET = "test-secret";
  delete process.env.CLOSED_BETA;
  delete process.env.NEXTAUTH_SECRET;
  delete process.env.NEXT_PUBLIC_APP_PHASE;

  const token = await createBetaRedemptionToken("invite_1");

  assert.equal(await isValidBetaRedemptionToken(token), true);
});

test("allows access when closed beta is disabled", async () => {
  process.env.APP_PHASE = "public";
  delete process.env.CLOSED_BETA;
  delete process.env.NEXT_PUBLIC_APP_PHASE;

  assert.equal(await isValidBetaRedemptionToken(""), false);
});

test("requires account-level beta access when the closed beta is enabled", async () => {
  process.env.APP_PHASE = "beta";
  delete process.env.CLOSED_BETA;
  delete process.env.NEXT_PUBLIC_APP_PHASE;

  assert.equal(await resolveBetaAccess(null), false);
  assert.equal(
    await resolveBetaAccess({ user: { betaAccessGrantedAt: null } }),
    false,
  );
  assert.equal(
    await resolveBetaAccess({ user: { betaAccessGrantedAt: new Date() } }),
    true,
  );
});
