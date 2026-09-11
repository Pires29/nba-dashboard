import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  BETA_REDEMPTION_COOKIE_NAME,
  BETA_REDEMPTION_MAX_AGE_SECONDS,
  createBetaRedemptionToken,
  isClosedBetaEnabled,
} from "@/lib/betaAccess";
import prisma from "../../../../../prisma/prismaClient";
import { findBetaInviteByCode } from "@/lib/betaInvites";
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

    const invite = await findBetaInviteByCode(code, { db: prisma });
    if (!invite) {
      return NextResponse.json({ error: "Invalid beta code" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const token = await createBetaRedemptionToken(invite.id);
    if (!token) {
      return NextResponse.json(
        { error: "Beta access is not configured" },
        { status: 500 },
      );
    }

    const response = NextResponse.json({
      success: true,
      requiresSignIn: !session?.user?.id,
    });
    response.cookies.set(BETA_REDEMPTION_COOKIE_NAME, token, {
      httpOnly: true,
      maxAge: BETA_REDEMPTION_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
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
