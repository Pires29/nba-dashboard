export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import prisma from "../../../../../prisma/prismaClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_MAP = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  yearly: process.env.STRIPE_PRICE_YEARLY,
  trial: process.env.STRIPE_PRICE_MONTHLY,
};

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // NOVO: recebe também o referralCodeId
  const { billing, referralCodeId } = await req.json();
  const priceId = PRICE_MAP[billing];

  if (!priceId) {
    return Response.json({ error: "Invalid billing option" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  let customerId = user?.stripeCustomerId;
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
  const hasUsedTrial = user?.hasUsedTrial ?? false;
  const applyTrial = billing === "trial" && !hasUsedTrial;

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    discounts: referralCodeId ? [{ coupon: "REFERRAL20" }] : [],
    subscription_data: applyTrial
      ? {
          trial_period_days: 7,
          metadata: { userId: user.id },
        }
      : { metadata: { userId: user.id } },
    success_url: `${appUrl}/settings?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { userId: user.id, billing, referralCodeId: referralCodeId ?? "" },
  });

  return Response.json({ url: checkoutSession.url });
}