import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/prismaClient";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  getRequestIp,
  isValidEmail,
  normalizeEmail,
  readJson,
  RequestError,
} from "@/lib/security";
import { verifyBotToken } from "@/lib/botProtection";

export async function POST(req) {
  try {
    const rateLimit = await checkRateLimit(`beta-waitlist:${getRequestIp(req)}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const body = await readJson(req, { maxBytes: 1_024 });
    await verifyBotToken(req, body.turnstileToken);
    const email = normalizeEmail(body.email);

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
    }

    await prisma.betaWaitlist.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RequestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: "Unable to join the waitlist" },
      { status: 500 },
    );
  }
}
