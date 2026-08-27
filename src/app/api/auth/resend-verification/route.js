export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { requestEmailVerification, EMAIL_VERIFICATION_RESPONSE } from "@/lib/emailVerification";
import { getRequestIp, isValidEmail, normalizeEmail, readJson, RequestError } from "@/lib/security";

const VERIFICATION_LIMIT_MESSAGE = "Too many verification emails. Please wait a bit before trying again.";

function verificationRateLimitResponse(result) {
  return NextResponse.json(
    { error: VERIFICATION_LIMIT_MESSAGE },
    { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
  );
}

export async function POST(req) {
  try {
    const body = await readJson(req);
    const email = normalizeEmail(body.email);
    const flowId = typeof body.flowId === "string" ? body.flowId : "";
    const ipLimit = await checkRateLimit(`resend-verification:ip:${getRequestIp(req)}`, {
      limit: 6,
      windowMs: 60 * 60 * 1000,
    });
    if (!ipLimit.allowed) return verificationRateLimitResponse(ipLimit);

    if (isValidEmail(email)) {
      const emailLimit = await checkRateLimit(`resend-verification:email:${email}`, {
        limit: 3,
        windowMs: 60 * 60 * 1000,
      });
      if (!emailLimit.allowed) return verificationRateLimitResponse(emailLimit);
    }

    if (flowId) {
      const flowLimit = await checkRateLimit(`resend-verification:flow:${flowId}`, {
        limit: 1,
        windowMs: 24 * 60 * 60 * 1000,
      });
      if (!flowLimit.allowed) return verificationRateLimitResponse(flowLimit);
    }

    await requestEmailVerification(email, req, { flowId });

    return NextResponse.json({ message: EMAIL_VERIFICATION_RESPONSE });
  } catch (err) {
    if (err instanceof RequestError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error("Resend verification error:", { code: err?.code, message: err?.message });
    return NextResponse.json({ message: EMAIL_VERIFICATION_RESPONSE });
  }
}
