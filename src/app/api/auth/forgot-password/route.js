export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { getRequestIp, readJson, RequestError } from "@/lib/security";
import { requestPasswordReset, PASSWORD_RESET_RESPONSE } from "@/lib/passwordReset";

export async function POST(req) {
  try {
    const rateLimit = await checkRateLimit(`forgot-password:${getRequestIp(req)}`, {
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const body = await readJson(req);
    const flowId = typeof body.flowId === "string" ? body.flowId : "";
    await requestPasswordReset(body.email, req, { flowId });

    return NextResponse.json({ message: PASSWORD_RESET_RESPONSE });
  } catch (err) {
    if (err instanceof RequestError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error("Forgot password error:", { code: err?.code, message: err?.message });
    return NextResponse.json({ message: PASSWORD_RESET_RESPONSE });
  }
}
