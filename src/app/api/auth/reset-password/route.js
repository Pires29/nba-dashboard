export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { getRequestIp, readJson, RequestError } from "@/lib/security";
import { resetPasswordWithToken } from "@/lib/passwordReset";

export async function POST(req) {
  try {
    const rateLimit = await checkRateLimit(`reset-password:${getRequestIp(req)}`, {
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const body = await readJson(req);
    const result = await resetPasswordWithToken(body.token, body.password);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof RequestError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error("Reset password error:", { code: err?.code, message: err?.message });
    return NextResponse.json({ error: "Unable to reset password" }, { status: 500 });
  }
}
