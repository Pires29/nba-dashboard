import test from "node:test";
import assert from "node:assert/strict";
import {
  CLOSED_BETA_CAMPAIGN_SLUG,
  grantBetaProAccess,
  hasActiveBetaProAccess,
} from "../src/lib/betaProAccess.js";

const now = new Date("2026-09-10T12:00:00Z");

test("an active beta grant gives Pro access until either expiry boundary", () => {
  const grant = {
    access: "pro_access",
    status: "active",
    campaign: { endsAt: new Date("2026-10-07T00:00:00Z") },
  };

  assert.equal(hasActiveBetaProAccess({ accessGrants: [grant] }, now), true);
  assert.equal(
    hasActiveBetaProAccess({
      accessGrants: [{ ...grant, expiresAt: new Date("2026-09-10T11:59:59Z") }],
    }, now),
    false,
  );
  assert.equal(
    hasActiveBetaProAccess({
      accessGrants: [{ ...grant, status: "revoked", revokedAt: now }],
    }, now),
    false,
  );
});

test("a redeemed beta invitation grants Pro exactly once", async () => {
  const calls = [];
  const db = {
    betaCampaign: {
      findUnique: async ({ where }) => {
        assert.equal(where.slug, CLOSED_BETA_CAMPAIGN_SLUG);
        return { id: "campaign_1", endsAt: null };
      },
    },
    accessGrant: {
      findUnique: async () => null,
      upsert: async ({ create }) => calls.push(["grant", create]),
    },
  };

  const result = await grantBetaProAccess("user_1", { db });

  assert.equal(result, true);
  assert.deepEqual(calls[0], ["grant", {
    userId: "user_1",
    campaignId: "campaign_1",
    access: "pro_access",
    notes: "Granted after redeeming a beta invitation.",
  }]);
});

test("a revoked beta grant is never recreated by an invitation", async () => {
  let writes = 0;
  const db = {
    betaCampaign: { findUnique: async () => ({ id: "campaign_1", endsAt: null }) },
    accessGrant: {
      findUnique: async () => ({
        access: "pro_access", status: "revoked", revokedAt: now, expiresAt: null,
      }),
      upsert: async () => { writes += 1; },
    },
  };

  const result = await grantBetaProAccess("user_1", { db });

  assert.equal(result, false);
  assert.equal(writes, 0);
});
