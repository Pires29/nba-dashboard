import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  isClosedBetaEnabled,
  isValidBetaCode,
} from "@/lib/betaAccess";
import { grantUserBetaAccess } from "@/lib/betaUserAccess";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { getRequestIp, readJson, RequestError } from "@/lib/security";

export async function POST(req) {
  try {
    const rateLimit = await checkRateLimit(`beta-access:${getRequestIp(req)}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const { code } = await readJson(req, { maxBytes: 1_024 });
    if (!isClosedBetaEnabled()) {
      return NextResponse.json({ success: true, closedBeta: false });
    }

    if (!isValidBetaCode(code)) {
      return NextResponse.json({ error: "Invalid beta code" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Sign in to redeem your beta code" },
        { status: 401 },
      );
    }

    const grant = await grantUserBetaAccess(session.user.id);
    if (!grant) {
      return NextResponse.json(
        { error: "Unable to save beta access to your account" },
        { status: 503 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RequestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: "Unable to validate beta code" },
      { status: 500 },
    );
  }
}
