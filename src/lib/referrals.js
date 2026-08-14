import prisma from "../../prisma/prismaClient.js";

export function normalizeReferralCode(value) {
  if (typeof value !== "string") return "";
  const code = value.normalize("NFKC").trim().toUpperCase();
  return /^[A-Z0-9_-]{3,32}$/.test(code) ? code : "";
}

const PENDING_REFERRAL_TTL_MS = 30 * 60 * 1000;

export async function validateReferralForUser({ code, userId }, db = prisma) {
  const normalizedCode = normalizeReferralCode(code);
  if (!normalizedCode) return { valid: false, reason: "INVALID_CODE" };

  const referral = await db.referralCode.findUnique({
    where: { code: normalizedCode },
    select: { id: true, partnerId: true },
  });

  if (!referral || referral.partnerId === userId) {
    return { valid: false, reason: "INVALID_CODE" };
  }

  const alreadyUsed = await db.referralUse.findUnique({
    where: { referredUserId: userId },
    select: { id: true, discountApplied: true, createdAt: true },
  });

  if (alreadyUsed) {
    const isExpiredPendingUse =
      !alreadyUsed.discountApplied &&
      alreadyUsed.createdAt.getTime() < Date.now() - PENDING_REFERRAL_TTL_MS;

    if (!isExpiredPendingUse) {
      return { valid: false, reason: "ALREADY_USED" };
    }

    await db.referralUse.delete({ where: { id: alreadyUsed.id } });
  }

  return { valid: true, referral };
}
