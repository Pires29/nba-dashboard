import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import prisma from "../../prisma/prismaClient.js";
import { sendPasswordResetEmail } from "./email.js";
import { isValidEmail, normalizeEmail, validatePassword } from "./security.js";

export const PASSWORD_RESET_EXPIRES_MS = 30 * 60 * 1000;
export const PASSWORD_RESET_RESPONSE = "If an account exists for that email, a password reset link has been sent.";

export function generateResetToken() {
  return randomBytes(32).toString("base64url");
}

export function hashResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function isSameHash(a, b) {
  const left = Buffer.from(a || "", "hex");
  const right = Buffer.from(b || "", "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function getPasswordResetUrl(req, token, flowId = "") {
  const configuredBaseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL;
  const baseUrl = configuredBaseUrl || new URL(req.url).origin;
  const url = new URL(`/reset-password?token=${encodeURIComponent(token)}`, baseUrl);
  if (flowId) url.searchParams.set("flow", flowId);
  return url.toString();
}

export async function requestPasswordReset(
  emailInput,
  req,
  {
    db = prisma,
    createToken = generateResetToken,
    sendEmail = sendPasswordResetEmail,
    now = () => new Date(),
    flowId = "",
  } = {},
) {
  const email = normalizeEmail(emailInput);
  if (!isValidEmail(email)) return { message: PASSWORD_RESET_RESPONSE };

  const user = await db.user.findUnique({ where: { email }, select: { id: true, email: true } });
  if (!user) return { message: PASSWORD_RESET_RESPONSE };

  const token = createToken();
  const expiresAt = new Date(now().getTime() + PASSWORD_RESET_EXPIRES_MS);
  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashResetToken(token),
      expiresAt,
    },
  });

  await sendEmail({
    to: user.email,
    resetUrl: getPasswordResetUrl(req, token, flowId),
  });

  return { message: PASSWORD_RESET_RESPONSE };
}

export async function resetPasswordWithToken(
  token,
  password,
  {
    db = prisma,
    hashPassword = (value) => bcrypt.hash(value, 12),
    now = () => new Date(),
  } = {},
) {
  if (typeof token !== "string" || token.length < 32 || token.length > 256) {
    return { ok: false, error: "Invalid or expired reset link" };
  }

  const passwordError = validatePassword(password);
  if (passwordError) return { ok: false, error: passwordError };

  const tokenHash = hashResetToken(token);
  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true } } },
  });

  if (
    !record ||
    record.usedAt ||
    record.expiresAt <= now() ||
    !record.user ||
    !isSameHash(record.tokenHash, tokenHash)
  ) {
    return { ok: false, error: "Invalid or expired reset link" };
  }

  const hashedPassword = await hashPassword(password);
  const usedAt = now();
  const claimed = await db.$transaction(async (tx) => {
    const claim = await tx.passwordResetToken.updateMany({
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
      data: { password: hashedPassword },
    });
    await tx.passwordResetToken.deleteMany({
      where: {
        userId: record.user.id,
        id: { not: record.id },
      },
    });

    return true;
  });

  if (!claimed) {
    return { ok: false, error: "Invalid or expired reset link" };
  }

  return { ok: true };
}
