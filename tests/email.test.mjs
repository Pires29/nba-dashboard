import test from "node:test";
import assert from "node:assert/strict";
import {
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
} from "../src/lib/email.js";

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL_ENV);
}

test.afterEach(() => {
  restoreEnv();
  globalThis.fetch = ORIGINAL_FETCH;
});

test("resend provider sends verification emails through the Resend API", async () => {
  process.env.EMAIL_PROVIDER = "resend";
  process.env.EMAIL_FROM = "PropInsight <noreply@propinsight.app>";
  process.env.RESEND_API_KEY = "re_test_key";

  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return Response.json({ id: "email_123" });
  };

  await sendEmailVerificationEmail({
    to: "user@example.com",
    verificationUrl: "https://www.propinsight.app/verify-email?token=abc",
  });

  assert.equal(request.url, "https://api.resend.com/emails");
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.headers.Authorization, "Bearer re_test_key");

  const body = JSON.parse(request.options.body);
  assert.equal(body.from, "PropInsight <noreply@propinsight.app>");
  assert.equal(body.to, "user@example.com");
  assert.equal(body.subject, "Verify your PropInsight email");
  assert.match(body.text, /24 hours/);
  assert.match(body.html, /Verify email/);
});

test("resend provider sends password reset emails", async () => {
  process.env.EMAIL_PROVIDER = "resend";
  process.env.RESEND_API_KEY = "re_test_key";

  let body;
  globalThis.fetch = async (_url, options) => {
    body = JSON.parse(options.body);
    return Response.json({ id: "email_456" });
  };

  await sendPasswordResetEmail({
    to: "user@example.com",
    resetUrl: "https://www.propinsight.app/reset-password?token=abc",
  });

  assert.equal(body.from, "PropInsight <noreply@propinsight.app>");
  assert.equal(body.subject, "Reset your PropInsight password");
  assert.match(body.text, /30 minutes/);
  assert.match(body.html, /Reset password/);
});

test("resend provider requires an API key", async () => {
  process.env.EMAIL_PROVIDER = "resend";
  delete process.env.RESEND_API_KEY;

  await assert.rejects(
    () => sendEmailVerificationEmail({
      to: "user@example.com",
      verificationUrl: "https://www.propinsight.app/verify-email?token=abc",
    }),
    /RESEND_API_KEY is not configured/,
  );
});

test("unsupported production email providers fail explicitly", async () => {
  process.env.NODE_ENV = "production";
  process.env.EMAIL_PROVIDER = "smtp";

  await assert.rejects(
    () => sendPasswordResetEmail({
      to: "user@example.com",
      resetUrl: "https://www.propinsight.app/reset-password?token=abc",
    }),
    /Unsupported EMAIL_PROVIDER: smtp/,
  );
});
