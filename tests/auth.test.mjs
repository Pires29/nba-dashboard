import test from "node:test";
import assert from "node:assert/strict";
import { authorizeCredentials } from "../src/lib/credentialsAuth.js";
import { enrichSessionWithUser } from "../src/lib/enrichSessionWithUser.js";

const user = {
  id: "user_1",
  name: "Test User",
  email: "user@example.com",
  image: null,
  password: "stored-hash",
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
