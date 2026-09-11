import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  BETA_REDEMPTION_COOKIE_NAME,
  isClosedBetaEnabled,
  readBetaRedemptionToken,
} from "@/lib/betaAccess";
import { grantUserBetaAccess } from "@/lib/betaUserAccess";
import { grantBetaProAccess } from "@/lib/betaProAccess";
import { normalizeEmail } from "@/lib/security";
import prisma from "../../../../../prisma/prismaClient";
import { consumeBetaInvite, findBetaInviteById } from "@/lib/betaInvites";

function clearRedemptionCookie(response) {
  response.cookies.set(BETA_REDEMPTION_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function POST(req) {
  if (!isClosedBetaEnabled()) {
    return clearRedemptionCookie(NextResponse.json({ success: true, closedBeta: false }));
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to redeem your beta code" }, { status: 401 });
  }

  const token = await readBetaRedemptionToken(
    req.cookies.get(BETA_REDEMPTION_COOKIE_NAME)?.value,
  );
  if (!token) {
    return clearRedemptionCookie(
      NextResponse.json({ error: "Your beta code confirmation has expired" }, { status: 400 }),
    );
  }

  const invite = await findBetaInviteById(token.inviteId, { db: prisma });
  if (
    !invite ||
    normalizeEmail(session.user.email) !== invite.waitlistEmail
  ) {
    return clearRedemptionCookie(
      NextResponse.json({ error: "This beta invitation is assigned to another email" }, { status: 403 }),
    );
  }

  const grant = await grantUserBetaAccess(session.user.id);
  if (!grant) {
    return NextResponse.json(
      { error: "Unable to save beta access to your account" },
      { status: 503 },
    );
  }

  if (!(await grantBetaProAccess(session.user.id))) {
    return NextResponse.json(
      { error: "Unable to grant beta access to your account" },
      { status: 503 },
    );
  }

  if (!(await consumeBetaInvite(invite.id, session.user.id, { db: prisma }))) {
    return NextResponse.json({ error: "This beta invitation has already been used" }, { status: 409 });
  }

  return clearRedemptionCookie(NextResponse.json({ success: true }));
}
