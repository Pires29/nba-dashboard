import test from "node:test";
import assert from "node:assert/strict";
import {
  generateResetToken,
  hashResetToken,
  PASSWORD_RESET_RESPONSE,
  requestPasswordReset,
  resetPasswordWithToken,
} from "../src/lib/passwordReset.js";

function createDb({ user = { id: "user_1", email: "user@example.com" }, record } = {}) {
  const state = {
    user,
    record,
    createdToken: null,
    updatedPassword: null,
    deletedTokensForUser: null,
  };

  const tx = {
    user: {
      update: async ({ data }) => {
        state.updatedPassword = data.password;
        return { ...state.user, ...data };
      },
    },
    passwordResetToken: {
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
      passwordResetToken: {
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

test("generates strong reset tokens and hashes them deterministically", () => {
  const token = generateResetToken();
  assert.ok(token.length >= 40);
  assert.notEqual(generateResetToken(), token);
  assert.equal(hashResetToken(token), hashResetToken(token));
  assert.notEqual(hashResetToken(token), token);
});

test("forgot password response is generic and does not create tokens for unknown emails", async () => {
  let sent = false;
  const { state, db } = createDb({ user: null });

  const result = await requestPasswordReset("missing@example.com", new Request("https://app.test/forgot-password"), {
    db,
    sendEmail: async () => {
      sent = true;
    },
  });

  assert.equal(result.message, PASSWORD_RESET_RESPONSE);
  assert.equal(state.createdToken, null);
  assert.equal(sent, false);
});

test("forgot password stores only the token hash and sends a reset URL", async () => {
  let resetUrl;
  const token = "a".repeat(43);
  const { state, db } = createDb();

  const result = await requestPasswordReset(" USER@example.com ", new Request("https://app.test/forgot-password"), {
    db,
    createToken: () => token,
    sendEmail: async ({ resetUrl: url }) => {
      resetUrl = url;
    },
    now: () => new Date("2026-08-26T10:00:00Z"),
  });

  assert.equal(result.message, PASSWORD_RESET_RESPONSE);
  assert.equal(state.createdToken.tokenHash, hashResetToken(token));
  assert.notEqual(state.createdToken.tokenHash, token);
  assert.equal(state.createdToken.expiresAt.toISOString(), "2026-08-26T10:30:00.000Z");
  assert.equal(resetUrl, `https://app.test/reset-password?token=${token}`);
});

test("reset password rejects expired, used, or weak reset attempts", async () => {
  const token = "b".repeat(43);
  const now = new Date("2026-08-26T10:00:00Z");

  for (const record of [
    { id: "reset_1", tokenHash: hashResetToken(token), usedAt: now, expiresAt: new Date("2026-08-26T10:30:00Z"), user: { id: "user_1" } },
    { id: "reset_1", tokenHash: hashResetToken(token), usedAt: null, expiresAt: new Date("2026-08-26T09:59:00Z"), user: { id: "user_1" } },
  ]) {
    const { db } = createDb({ record });
    const result = await resetPasswordWithToken(token, "new-password", { db, now: () => now });
    assert.equal(result.ok, false);
    assert.equal(result.error, "Invalid or expired reset link");
  }

  const { db } = createDb({
    record: { id: "reset_1", tokenHash: hashResetToken(token), usedAt: null, expiresAt: new Date("2026-08-26T10:30:00Z"), user: { id: "user_1" } },
  });
  const weak = await resetPasswordWithToken(token, "short", { db, now: () => now });
  assert.equal(weak.ok, false);
  assert.equal(weak.error, "Password must be at least 8 characters long");
});

test("reset password claims token once and can set password for Google-only users", async () => {
  const token = "c".repeat(43);
  const { state, db } = createDb({
    user: { id: "user_1", email: "user@example.com", password: null },
    record: {
      id: "reset_1",
      tokenHash: hashResetToken(token),
      usedAt: null,
      expiresAt: new Date("2026-08-26T10:30:00Z"),
      user: { id: "user_1" },
    },
  });

  const result = await resetPasswordWithToken(token, "new-password", {
    db,
    hashPassword: async () => "hashed-password",
    now: () => new Date("2026-08-26T10:00:00Z"),
  });

  assert.equal(result.ok, true);
  assert.equal(state.updatedPassword, "hashed-password");
  assert.ok(state.record.usedAt);
  assert.equal(state.deletedTokensForUser, "user_1");

  const reused = await resetPasswordWithToken(token, "new-password", {
    db,
    hashPassword: async () => "another-hash",
    now: () => new Date("2026-08-26T10:01:00Z"),
  });
  assert.equal(reused.ok, false);
  assert.equal(state.updatedPassword, "hashed-password");
});
