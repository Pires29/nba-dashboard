import test from "node:test";
import assert from "node:assert/strict";
import { authorizeCredentials } from "../src/lib/credentialsAuth.js";
import { enrichSessionWithUser } from "../src/lib/enrichSessionWithUser.js";
import {
  grantUserBetaAccess,
  userHasBetaAccess,
} from "../src/lib/betaUserAccess.js";

const user = {
  id: "user_1",
  name: "Test User",
  email: "user@example.com",
  image: null,
  password: "stored-hash",
  emailVerifiedAt: new Date("2026-08-26T10:00:00Z"),
};

const dependencies = (overrides = {}) => ({
  db: { user: { findUnique: async () => user } },
  comparePassword: async () => true,
  rateLimit: async () => ({ allowed: true }),
  ...overrides,
});

test("credentials authentication normalizes email and returns a safe user", async () => {
  let queriedEmail;
  const result = await authorizeCredentials(
    { email: " USER@Example.com ", password: "correct-password" },
    { headers: { "x-forwarded-for": "203.0.113.1" } },
    dependencies({
      db: { user: { findUnique: async ({ where }) => { queriedEmail = where.email; return user; } } },
    }),
  );

  assert.equal(queriedEmail, "user@example.com");
  assert.deepEqual(result, { id: user.id, name: user.name, email: user.email, image: null });
  assert.equal("password" in result, false);
});

test("credentials authentication rejects invalid passwords and rate-limited attempts", async () => {
  assert.equal(
    await authorizeCredentials(
      { email: user.email, password: "wrong-password" },
      {},
      dependencies({ comparePassword: async () => false }),
    ),
    null,
  );
  assert.equal(
    await authorizeCredentials(
      { email: user.email, password: "correct-password" },
      {},
      dependencies({ rateLimit: async () => ({ allowed: false }) }),
    ),
    null,
  );
});

test("credentials authentication reports unverified emails after a valid password", async () => {
  await assert.rejects(
    authorizeCredentials(
      { email: user.email, password: "correct-password" },
      {},
      dependencies({
        db: {
          user: {
            findUnique: async () => ({ ...user, emailVerifiedAt: null }),
          },
        },
      }),
    ),
    /EMAIL_NOT_VERIFIED/,
  );
});

test("session enrichment keeps the base session when the database lookup fails", async () => {
  const session = { user: { email: "user@example.com", name: "Test User" } };
  const result = await enrichSessionWithUser(
    session,
    {
      db: {
        user: {
          findUnique: async () => {
            const error = new Error("database unavailable");
            error.code = "ENOTFOUND";
            throw error;
          },
        },
      },
    },
  );

  assert.equal(result, session);
  assert.deepEqual(result.user, { email: "user@example.com", name: "Test User" });
});

test("session enrichment marks sessions invalid when the user no longer exists", async () => {
  const session = {
    user: {
      id: "stale",
      email: "user@example.com",
      name: "Test User",
      plan: "pro",
    },
  };
  const result = await enrichSessionWithUser(session, {
    db: { user: { findUnique: async () => null } },
  });

  assert.equal(result, session);
  assert.equal(result.user.id, undefined);
  assert.equal(result.user.plan, "free");
  assert.equal(result.user.accountDeleted, true);
});

test("session enrichment includes account beta access", async () => {
  const betaAccessGrantedAt = new Date("2026-09-10T10:00:00Z");
  const session = { user: { email: "user@example.com", name: "Test User" } };
  const result = await enrichSessionWithUser(session, {
    db: {
      user: {
        findUnique: async () => ({ ...user, betaAccessGrantedAt }),
      },
    },
  });

  assert.equal(result.user.id, user.id);
  assert.equal(result.user.betaAccessGrantedAt, betaAccessGrantedAt);
});

test("beta user access grants once without overwriting its original timestamp", async () => {
  let updateManyArgs;
  const betaAccessGrantedAt = new Date("2026-09-10T12:00:00Z");
  const db = {
    user: {
      findUnique: async ({ where, select }) => {
        assert.deepEqual(where, { id: "user_1" });
        assert.deepEqual(select, { betaAccessGrantedAt: true });
        return { betaAccessGrantedAt };
      },
      updateMany: async (args) => {
        updateManyArgs = args;
        return { count: 0 };
      },
    },
  };

  assert.equal(userHasBetaAccess({ betaAccessGrantedAt }), true);
  assert.equal(userHasBetaAccess({ betaAccessGrantedAt: null }), false);

  const granted = await grantUserBetaAccess("user_1", { db });
  assert.equal(granted.betaAccessGrantedAt instanceof Date, true);
  assert.deepEqual(updateManyArgs.where, {
    id: "user_1",
    betaAccessGrantedAt: null,
  });
  assert.equal(updateManyArgs.data.betaAccessGrantedAt instanceof Date, true);
});
