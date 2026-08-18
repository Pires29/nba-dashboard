import { randomUUID } from "node:crypto";

export async function removeStripeCustomerAndSubscriptions(stripe, user) {
  if (user.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch (error) {
      if (error?.code !== "resource_missing") throw error;
    }
  }

  if (user.stripeCustomerId) {
    try {
      await stripe.customers.del(user.stripeCustomerId);
    } catch (error) {
      if (error?.code !== "resource_missing") throw error;
    }
  }
}

export const CHECKOUT_ATTEMPT_TTL_MS = 31 * 60 * 1000;

export class CheckoutInProgressError extends Error {
  constructor() {
    super("A checkout is already in progress");
    this.name = "CheckoutInProgressError";
  }
}

export async function reserveCheckoutAttempt(
  db,
  { userId, billing, now = new Date(), ttlMs = CHECKOUT_ATTEMPT_TTL_MS },
) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT 1 AS "locked"
      FROM pg_advisory_xact_lock(hashtext(${`checkout:${userId}`})::bigint)
    `;
    const [existing] = await tx.$queryRaw`
      SELECT "id", "userId", "billing", "stripeSessionId", "expiresAt"
      FROM "CheckoutAttempt"
      WHERE "userId" = ${userId}
      LIMIT 1
    `;
    if (existing?.expiresAt > now) {
      if (existing.billing === billing && existing.stripeSessionId) {
        return { ...existing, reused: true };
      }
      throw new CheckoutInProgressError();
    }
    if (existing) {
      await tx.$executeRaw`DELETE FROM "CheckoutAttempt" WHERE "userId" = ${userId}`;
    }
    const id = randomUUID();
    const expiresAt = new Date(now.getTime() + ttlMs);
    await tx.$executeRaw`
      INSERT INTO "CheckoutAttempt" ("id", "userId", "billing", "expiresAt", "createdAt")
      VALUES (${id}, ${userId}, ${billing}, ${expiresAt}, ${now})
    `;
    return { id, userId, billing, expiresAt };
  });
}

export async function releaseCheckoutAttempt(db, where) {
  if (where.id) {
    await db.$executeRaw`DELETE FROM "CheckoutAttempt" WHERE "id" = ${where.id}`;
  } else if (where.userId) {
    await db.$executeRaw`DELETE FROM "CheckoutAttempt" WHERE "userId" = ${where.userId}`;
  }
}

export async function cancelSubscriptionIfPresent(stripe, subscriptionId) {
  if (!subscriptionId) return;
  try {
    await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    if (error?.code !== "resource_missing") throw error;
  }
}

export async function completeSeasonCheckout(
  { stripe, db, session, accessEnd },
) {
  if (session.payment_status !== "paid") return false;

  await cancelSubscriptionIfPresent(
    stripe,
    session.metadata?.priorSubscriptionId,
  );
  await db.user.update({
    where: { id: session.metadata.userId },
    data: {
      plan: "pro",
      stripeSubscriptionId: null,
      planRenewsAt: accessEnd,
      planInterval: "season",
    },
  });
  await releaseCheckoutAttempt(db, session.metadata?.checkoutAttemptId
    ? { id: session.metadata.checkoutAttemptId }
    : { userId: session.metadata.userId });
  return true;
}

export async function claimWebhookEvent(db, event) {
  try {
    await db.stripeWebhookEvent.create({
      data: { id: event.id, type: event.type },
    });
    return true;
  } catch (error) {
    if (error?.code === "P2002") return false;
    throw error;
  }
}

export async function releaseWebhookClaim(db, eventId) {
  await db.stripeWebhookEvent.delete({ where: { id: eventId } });
}

export function shouldApplySubscriptionUpdate(user, subscriptionId) {
  if (!user) return false;
  if (user.stripeSubscriptionId) {
    return user.stripeSubscriptionId === subscriptionId;
  }
  return user.planInterval !== "season";
}
