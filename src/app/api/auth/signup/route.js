export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../../prisma/prismaClient";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  getRequestIp,
  isValidEmail,
  normalizeEmail,
  readJson,
  RequestError,
  validatePassword,
} from "@/lib/security";
import { sendVerificationForUser } from "@/lib/emailVerification";

export async function POST(req) {
  try {
    const rateLimit = await checkRateLimit(`signup:${getRequestIp(req)}`, {
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const body = await readJson(req);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    const flowId = typeof body.flowId === "string" ? body.flowId : "";

    if (!name || !email || !password)
      return NextResponse.json({ error: "Campos em falta" }, { status: 400 });

    if (name.length > 100)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const passwordError = validatePassword(password);
    if (passwordError)
      return NextResponse.json(
        { error: passwordError },
        { status: 400 },
      );

    if (!isValidEmail(email))
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 400 },
      );

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    await sendVerificationForUser(user, req, { flowId });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    if (err instanceof RequestError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
    }
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
