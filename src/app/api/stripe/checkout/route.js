export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Stripe from "stripe";
import prisma from "../../../../../prisma/prismaClient";
import { validateReferralForUser } from "@/lib/referrals";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { readJson, RequestError } from "@/lib/security";
import { validateCheckoutPlan } from "@/lib/stripePlans";
import {
  CheckoutInProgressError,
  releaseCheckoutAttempt,
  reserveCheckoutAttempt,
} from "@/lib/stripeBilling";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_MAP = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  season: process.env.STRIPE_PRICE_SEASON,
  trial: process.env.STRIPE_PRICE_MONTHLY,
};
const REFERRAL_COUPON_ID = process.env.STRIPE_REFERRAL_COUPON_ID;

export async function POST(req) {
  let checkoutAttempt = null;
  let checkoutSession = null;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(`checkout:${session.user.id}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const { billing, referralCode, returnPath } = await readJson(req, { maxBytes: 2_048 });
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const plan = validateCheckoutPlan({ billing, user, prices: PRICE_MAP });
    if (!plan.valid) {
      return Response.json({ error: plan.error }, { status: plan.status });
    }

    let referralCodeId = null;
    if (referralCode) {
      if (!REFERRAL_COUPON_ID) {
        console.error("Stripe referral coupon is not configured");
        return Response.json({ error: "Referral discounts are unavailable" }, { status: 503 });
      }
      const referralResult = await validateReferralForUser({
        code: referralCode,
        userId: user.id,
      });
      if (!referralResult.valid) {
        return Response.json({ error: "Invalid or unavailable referral code" }, { status: 400 });
      }
      referralCodeId = referralResult.referral.id;
    }

    checkoutAttempt = await reserveCheckoutAttempt(prisma, {
      userId: user.id,
      billing,
    });

    if (checkoutAttempt.previousStripeSessionId) {
      await stripe.checkout.sessions
        .expire(checkoutAttempt.previousStripeSessionId)
        .catch(() => undefined);
    }

    if (checkoutAttempt.reused) {
      const existingSession = await stripe.checkout.sessions.retrieve(
        checkoutAttempt.stripeSessionId,
      );
      if (existingSession.status === "open" && existingSession.url && !referralCodeId) {
        return Response.json({ url: existingSession.url, resumed: true });
      }

      if (existingSession.status === "open") {
        await stripe.checkout.sessions.expire(existingSession.id).catch(() => undefined);
      }
      await releaseCheckoutAttempt(prisma, { id: checkoutAttempt.id });
      checkoutAttempt = await reserveCheckoutAttempt(prisma, {
        userId: user.id,
        billing,
      });
    }

    let customerId = user.stripeCustomerId;
    if (customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) customerId = null;
      } catch (error) {
        if (error?.code === "resource_missing") {
          customerId = null;
        } else {
          throw error;
        }
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const safeReturnPath =
      typeof returnPath === "string" &&
      returnPath.startsWith("/") &&
      !returnPath.startsWith("//")
        ? returnPath
        : "/#pricing";
    checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      mode: plan.mode,
      discounts: referralCodeId ? [{ coupon: REFERRAL_COUPON_ID }] : [],
      ...(plan.mode === "subscription" && {
        subscription_data: plan.applyTrial
          ? {
              trial_period_days: 7,
              metadata: { userId: user.id },
            }
          : { metadata: { userId: user.id } },
      }),
      success_url: `${appUrl}/settings?upgraded=true`,
      cancel_url: `${appUrl}${safeReturnPath}`,
      metadata: {
        userId: user.id,
        billing,
        referralCodeId: referralCodeId ?? "",
        checkoutAttemptId: checkoutAttempt.id,
        priorSubscriptionId: plan.priorSubscriptionId ?? "",
      },
      expires_at: Math.floor(checkoutAttempt.expiresAt.getTime() / 1000),
    }, {
      idempotencyKey: `checkout:${checkoutAttempt.id}`,
    });

    await prisma.$executeRaw`
      UPDATE "CheckoutAttempt"
      SET "stripeSessionId" = ${checkoutSession.id}
      WHERE "id" = ${checkoutAttempt.id}
    `;

    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    if (checkoutSession?.id) {
      await stripe.checkout.sessions.expire(checkoutSession.id).catch(() => undefined);
    }
    if (checkoutAttempt) {
      await releaseCheckoutAttempt(prisma, { id: checkoutAttempt.id }).catch(() => undefined);
    }
    if (error instanceof RequestError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    if (error?.code === "P2002") {
      return Response.json({ error: "Referral code is already in use" }, { status: 409 });
    }
    if (error instanceof CheckoutInProgressError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("Stripe checkout failed", {
      name: error?.name,
      type: error?.type,
      code: error?.code,
      message: error?.message,
    });
    return Response.json(
      { error: "Unable to create checkout session" },
      { status: 500 },
    );
  }
}
