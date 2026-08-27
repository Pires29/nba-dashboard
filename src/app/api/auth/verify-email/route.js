export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { verifyEmailToken } from "@/lib/emailVerification";
import { getRequestIp, readJson, RequestError } from "@/lib/security";

export async function POST(req) {
  try {
    const rateLimit = await checkRateLimit(`verify-email:${getRequestIp(req)}`, {
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const body = await readJson(req);
    const result = await verifyEmailToken(body.token);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, email: result.email });
  } catch (err) {
    if (err instanceof RequestError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error("Verify email error:", { code: err?.code, message: err?.message });
    return NextResponse.json({ error: "Unable to verify email" }, { status: 500 });
  }
}
