import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;
let server;
let serverOutput = "";
const RUN_ID = `${process.pid}-${Date.now()}`;

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE_URL}/login`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Production server did not start:\n${serverOutput}`);
}

before(async () => {
  if (process.env.RUN_INTEGRATION_TESTS !== "true") {
    throw new Error("Integration tests require RUN_INTEGRATION_TESTS=true and a disposable database");
  }
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(PORT)],
    { env: { ...process.env, PORT: String(PORT) }, stdio: ["ignore", "pipe", "pipe"] },
  );
  server.stdout.on("data", (chunk) => { serverOutput += chunk; });
  server.stderr.on("data", (chunk) => { serverOutput += chunk; });
  await waitForServer();
});

after(async () => {
  if (!server || server.exitCode != null) return;
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
});

test("production server exposes public pages", async () => {
  const response = await fetch(`${BASE_URL}/login`);
  assert.equal(response.status, 200);
});

test("health endpoint verifies the database and NBA data source", async () => {
  const response = await fetch(`${BASE_URL}/api/health`);
  const body = await response.text();
  assert.equal(response.status, 200, body);
  const health = JSON.parse(body);
  assert.equal(health.status, "ok");
  assert.equal(health.database, "ok");
});

test("signup writes to the migrated database and rejects duplicates", async () => {
  const email = `ci-${Date.now()}@example.com`;
  const body = JSON.stringify({ name: "CI User", email, password: "SecurePass123!" });
  const headers = {
    "content-type": "application/json",
    "x-forwarded-for": `integration-signup-${RUN_ID}`,
  };
  const first = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers,
    body,
  });
  assert.equal(first.status, 201, await first.text());

  const duplicate = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers,
    body,
  });
  assert.ok([400, 409].includes(duplicate.status), await duplicate.text());
});

test("signup rejects oversized request bodies", async () => {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": `integration-oversized-${RUN_ID}`,
    },
    body: JSON.stringify({ name: "x".repeat(20_000), email: "large@example.com", password: "SecurePass123!" }),
  });
  assert.equal(response.status, 413);
});

test("critical APIs reject unauthenticated requests", async () => {
  const requests = [
    fetch(`${BASE_URL}/api/favorites`),
    fetch(`${BASE_URL}/api/referral/validate`, { method: "POST", body: "{}" }),
    fetch(`${BASE_URL}/api/stripe/checkout`, { method: "POST", body: "{}" }),
    fetch(`${BASE_URL}/api/stripe/cancel`, { method: "POST" }),
    fetch(`${BASE_URL}/api/user/delete`, { method: "DELETE" }),
  ];
  const responses = await Promise.all(requests);
  assert.deepEqual(responses.map((response) => response.status), [401, 401, 401, 401, 401]);
});
