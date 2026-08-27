import test from "node:test";
import assert from "node:assert/strict";
import {
  EMAIL_VERIFICATION_RESPONSE,
  hashEmailVerificationToken,
  requestEmailVerification,
  sendVerificationForUser,
  verifyEmailToken,
} from "../src/lib/emailVerification.js";

function createDb({ user = { id: "user_1", email: "user@example.com", emailVerifiedAt: null }, record } = {}) {
  const state = {
    user,
    record,
    createdToken: null,
    verifiedAt: null,
    deletedTokensForUser: null,
  };

  const tx = {
    user: {
      update: async ({ data }) => {
        state.verifiedAt = data.emailVerifiedAt;
        return { ...state.user, ...data };
      },
    },
    emailVerificationToken: {
      updateMany: async ({ where, data }) => {
        if (
          state.record?.id === where.id &&
          state.record?.usedAt === null &&
          state.record?.expiresAt > where.expiresAt.gt
        ) {
          state.record = { ...state.record, usedAt: data.usedAt };
          return { count: 1 };
        }
        return { count: 0 };
      },
      deleteMany: async ({ where }) => {
        state.deletedTokensForUser = where.userId;
        return { count: 0 };
      },
    },
  };

  return {
    state,
    db: {
      user: {
        findUnique: async () => state.user,
      },
      emailVerificationToken: {
        create: async ({ data }) => {
          state.createdToken = data;
          return data;
        },
        findUnique: async ({ where }) => (
          state.record?.tokenHash === where.tokenHash ? state.record : null
        ),
      },
      $transaction: async (fn) => fn(tx),
    },
  };
}

test("email verification request is generic for missing accounts", async () => {
  let sent = false;
  const { db } = createDb({ user: null });
  const result = await requestEmailVerification("missing@example.com", new Request("https://app.test/verify-request"), {
    db,
    sendVerification: async () => {
      sent = true;
    },
  });

  assert.equal(result.message, EMAIL_VERIFICATION_RESPONSE);
  assert.equal(sent, false);
});

test("email verification stores only token hash and sends verification URL", async () => {
  let verificationUrl;
  const token = "v".repeat(43);
  const { state, db } = createDb();

  await sendVerificationForUser(state.user, new Request("https://app.test/verify-request"), {
    db,
    createToken: () => token,
    sendEmail: async ({ verificationUrl: url }) => {
      verificationUrl = url;
    },
    now: () => new Date("2026-08-26T10:00:00Z"),
  });

  assert.equal(state.createdToken.tokenHash, hashEmailVerificationToken(token));
  assert.notEqual(state.createdToken.tokenHash, token);
  assert.equal(state.createdToken.expiresAt.toISOString(), "2026-08-27T10:00:00.000Z");
  assert.equal(verificationUrl, `https://app.test/verify-email?token=${token}`);
});

test("email verification rejects expired or used tokens", async () => {
  const token = "x".repeat(43);
  const now = new Date("2026-08-26T10:00:00Z");

  for (const record of [
    { id: "verify_1", tokenHash: hashEmailVerificationToken(token), usedAt: now, expiresAt: new Date("2026-08-26T10:30:00Z"), user: { id: "user_1" } },
    { id: "verify_1", tokenHash: hashEmailVerificationToken(token), usedAt: null, expiresAt: new Date("2026-08-26T09:59:00Z"), user: { id: "user_1" } },
  ]) {
    const { db } = createDb({ record });
    const result = await verifyEmailToken(token, { db, now: () => now });
    assert.equal(result.ok, false);
    assert.equal(result.error, "Invalid or expired verification link");
  }
});

test("email verification claims token once and marks user verified", async () => {
  const token = "y".repeat(43);
  const { state, db } = createDb({
    record: {
      id: "verify_1",
      tokenHash: hashEmailVerificationToken(token),
      usedAt: null,
      expiresAt: new Date("2026-08-26T10:30:00Z"),
      user: { id: "user_1" },
    },
  });

  const result = await verifyEmailToken(token, {
    db,
    now: () => new Date("2026-08-26T10:00:00Z"),
  });

  assert.equal(result.ok, true);
  assert.ok(state.verifiedAt);
  assert.ok(state.record.usedAt);
  assert.equal(state.deletedTokensForUser, "user_1");

  const reused = await verifyEmailToken(token, {
    db,
    now: () => new Date("2026-08-26T10:01:00Z"),
  });
  assert.equal(reused.ok, false);
});
