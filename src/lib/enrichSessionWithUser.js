import prisma from "../../prisma/prismaClient.js";
import { logWarning } from "./logger.js";
import { isValidEmail, normalizeEmail } from "./security.js";

export async function enrichSessionWithUser(session, dependencies = { db: prisma }) {
  const email = normalizeEmail(session.user?.email);
  if (!isValidEmail(email)) return session;

  let dbUser;
  try {
    dbUser = await dependencies.db.user.findUnique({
      where: { email },
    });
  } catch (error) {
    logWarning("auth_session_user_lookup_failed", {
      name: error?.name,
      code: error?.code,
    });
    return session;
  }

  if (!dbUser) {
    delete session.user.id;
    session.user.plan = "free";
    session.user.planRenewsAt = null;
    session.user.planInterval = null;
    session.user.accountDeleted = true;
    return session;
  }

  const planExpired =
    dbUser.plan === "pro" &&
    dbUser.planInterval === "season" &&
    dbUser.planRenewsAt &&
    dbUser.planRenewsAt <= new Date();

  if (planExpired) {
    try {
      await dependencies.db.user.update({
        where: { id: dbUser.id },
        data: { plan: "free", planRenewsAt: null, planInterval: null },
      });
    } catch (error) {
      logWarning("auth_session_plan_expiry_update_failed", {
        name: error?.name,
        code: error?.code,
        userId: dbUser.id,
      });
    }
  }

  session.user.id = dbUser.id;
  session.user.plan = planExpired ? "free" : (dbUser.plan ?? "free");
  session.user.planRenewsAt = planExpired
    ? null
    : (dbUser.planRenewsAt ?? null);
  session.user.planInterval = planExpired ? null : dbUser.planInterval;
  delete session.user.accountDeleted;

  return session;
}
