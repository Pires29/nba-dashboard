export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Stripe from "stripe";
import prisma from "../../../../../prisma/prismaClient";
import { validateReferralForUser } from "@/lib/referrals";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { readJson, RequestError } from "@/lib/security";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_MAP = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  season: process.env.STRIPE_PRICE_SEASON,
  trial: process.env.STRIPE_PRICE_MONTHLY,
};
const REFERRAL_COUPON_ID = process.env.STRIPE_REFERRAL_COUPON_ID;

export async function POST(req) {
  let referralReservedForUserId = null;
  let checkoutSessionCreated = false;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`checkout:${session.user.id}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const { billing, referralCode } = await readJson(req, { maxBytes: 2_048 });
    const priceId = PRICE_MAP[billing];

    if (!priceId) {
      return Response.json({ error: "Invalid billing option" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (user.plan === "pro" && user.planInterval !== "season") {
      return Response.json({ error: "An active subscription already exists" }, { status: 409 });
    }

    if (billing === "trial" && user.hasUsedTrial) {
      return Response.json({ error: "Trial already used" }, { status: 409 });
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

      // Reserve the one-time referral before contacting Stripe. The unique
      // referredUserId constraint prevents concurrent discounted checkouts.
      await prisma.referralUse.create({
        data: {
          referralCodeId,
          referredUserId: user.id,
          discountApplied: false,
        },
      });
      referralReservedForUserId = user.id;
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
    const hasUsedTrial = user.hasUsedTrial ?? false;
    const applyTrial = billing === "trial" && !hasUsedTrial;
    const isSeasonPayment = billing === "season";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isSeasonPayment ? "payment" : "subscription",
      discounts: referralCodeId ? [{ coupon: REFERRAL_COUPON_ID }] : [],
      ...(!isSeasonPayment && {
        subscription_data: applyTrial
          ? {
              trial_period_days: 7,
              metadata: { userId: user.id },
            }
          : { metadata: { userId: user.id } },
      }),
      success_url: `${appUrl}/settings?upgraded=true`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        userId: user.id,
        billing,
        referralCodeId: referralCodeId ?? "",
      },
    });
    checkoutSessionCreated = true;

    if (referralReservedForUserId) {
      await prisma.referralUse.update({
        where: { referredUserId: referralReservedForUserId },
        data: { stripeSessionId: checkoutSession.id },
      });
    }

    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    if (referralReservedForUserId && !checkoutSessionCreated) {
      await prisma.referralUse.deleteMany({
        where: {
          referredUserId: referralReservedForUserId,
          discountApplied: false,
        },
      }).catch(() => undefined);
    }
    if (error instanceof RequestError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    if (error?.code === "P2002") {
      return Response.json({ error: "Referral code is already in use" }, { status: 409 });
    }
    console.error("Stripe checkout failed", { type: error?.type, code: error?.code });
    return Response.json(
      { error: "Unable to create checkout session" },
      { status: 500 },
    );
  }
}
