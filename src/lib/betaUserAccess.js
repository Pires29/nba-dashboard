import prisma from "../../prisma/prismaClient.js";
import { logWarning } from "./logger.js";

export function userHasBetaAccess(user) {
  return Boolean(user?.betaAccessGrantedAt);
}

export async function grantUserBetaAccess(userId, dependencies = { db: prisma }) {
  if (!userId) return null;

  try {
    // Preserve the original grant time even if the user submits a valid code
    // again. updateMany makes the null check and write atomic.
    await dependencies.db.user.updateMany({
      where: { id: userId, betaAccessGrantedAt: null },
      data: { betaAccessGrantedAt: new Date() },
    });

    return await dependencies.db.user.findUnique({
      where: { id: userId },
      select: { betaAccessGrantedAt: true },
    });
  } catch (error) {
    logWarning("beta_user_access_grant_failed", {
      name: error?.name,
      code: error?.code,
      userId,
    });
    return null;
  }
}
