import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import prisma from "../../prisma/prismaClient.js";
import { sendEmailVerificationEmail } from "./email.js";
import { isValidEmail, normalizeEmail } from "./security.js";

export const EMAIL_VERIFICATION_EXPIRES_MS = 24 * 60 * 60 * 1000;
export const EMAIL_VERIFICATION_RESPONSE = "If an account needs verification, a verification link has been sent.";

export function generateEmailVerificationToken() {
  return randomBytes(32).toString("base64url");
}

export function hashEmailVerificationToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function isSameHash(a, b) {
  const left = Buffer.from(a || "", "hex");
  const right = Buffer.from(b || "", "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function getEmailVerificationUrl(req, token, flowId = "") {
  const configuredBaseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL;
  const baseUrl = configuredBaseUrl || new URL(req.url).origin;
  const url = new URL(`/verify-email?token=${encodeURIComponent(token)}`, baseUrl);
  if (flowId) url.searchParams.set("flow", flowId);
  return url.toString();
}

export async function sendVerificationForUser(
  user,
  req,
  {
    db = prisma,
    createToken = generateEmailVerificationToken,
    sendEmail = sendEmailVerificationEmail,
    now = () => new Date(),
    flowId = "",
  } = {},
) {
  if (!user || user.emailVerifiedAt) return;

  const token = createToken();
  await db.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashEmailVerificationToken(token),
      expiresAt: new Date(now().getTime() + EMAIL_VERIFICATION_EXPIRES_MS),
    },
  });

  await sendEmail({
    to: user.email,
    verificationUrl: getEmailVerificationUrl(req, token, flowId),
  });
}

export async function requestEmailVerification(
  emailInput,
  req,
  { db = prisma, sendVerification = sendVerificationForUser, flowId = "" } = {},
) {
  const email = normalizeEmail(emailInput);
  if (!isValidEmail(email)) return { message: EMAIL_VERIFICATION_RESPONSE };

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, emailVerifiedAt: true },
  });

  if (user && !user.emailVerifiedAt) {
    await sendVerification(user, req, { db, flowId });
  }

  return { message: EMAIL_VERIFICATION_RESPONSE };
}

export async function verifyEmailToken(
  token,
  { db = prisma, now = () => new Date() } = {},
) {
  if (typeof token !== "string" || token.length < 32 || token.length > 256) {
    return { ok: false, error: "Invalid or expired verification link" };
  }

  const tokenHash = hashEmailVerificationToken(token);
  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true } } },
  });

  if (
    !record ||
    record.usedAt ||
    record.expiresAt <= now() ||
    !record.user ||
    !isSameHash(record.tokenHash, tokenHash)
  ) {
    return { ok: false, error: "Invalid or expired verification link" };
  }

  const usedAt = now();
  const claimed = await db.$transaction(async (tx) => {
    const claim = await tx.emailVerificationToken.updateMany({
      where: {
        id: record.id,
        usedAt: null,
        expiresAt: { gt: usedAt },
      },
      data: { usedAt },
    });

    if (claim.count !== 1) return false;

    await tx.user.update({
      where: { id: record.user.id },
      data: { emailVerifiedAt: usedAt },
    });
    await tx.emailVerificationToken.deleteMany({
      where: {
        userId: record.user.id,
        id: { not: record.id },
      },
    });

    return true;
  });

  if (!claimed) {
    return { ok: false, error: "Invalid or expired verification link" };
  }

  return { ok: true, email: record.user.email };
}
