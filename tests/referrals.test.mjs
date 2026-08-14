import test from "node:test";
import assert from "node:assert/strict";
import { normalizeReferralCode, validateReferralForUser } from "../src/lib/referrals.js";

function referralDb({ referral = { id: "ref_1", partnerId: "partner_1" }, use = null } = {}) {
  const deleted = [];
  return {
    deleted,
    referralCode: { findUnique: async () => referral },
    referralUse: {
      findUnique: async () => use,
      delete: async ({ where }) => deleted.push(where.id),
    },
  };
}

test("normalizes referral codes and rejects unsafe syntax", () => {
  assert.equal(normalizeReferralCode("  hoop_20  "), "HOOP_20");
  assert.equal(normalizeReferralCode("<script>"), "");
});

test("rejects self-referrals and completed redemptions", async () => {
  const selfReferral = referralDb({ referral: { id: "ref_1", partnerId: "user_1" } });
  assert.equal(
    (await validateReferralForUser({ code: "HOOP20", userId: "user_1" }, selfReferral)).valid,
    false,
  );

  const completedUse = referralDb({
    use: { id: "use_1", discountApplied: true, createdAt: new Date(0) },
  });
  assert.equal(
    (await validateReferralForUser({ code: "HOOP20", userId: "user_1" }, completedUse)).reason,
    "ALREADY_USED",
  );
});

test("releases abandoned pending referral reservations after 30 minutes", async () => {
  const db = referralDb({
    use: {
      id: "use_stale",
      discountApplied: false,
      createdAt: new Date(Date.now() - 31 * 60 * 1000),
    },
  });

  const result = await validateReferralForUser({ code: "HOOP20", userId: "user_1" }, db);
  assert.equal(result.valid, true);
  assert.deepEqual(db.deleted, ["use_stale"]);
});
