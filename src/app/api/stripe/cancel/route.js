export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Stripe from "stripe";
import prisma from "../../../../../prisma/prismaClient";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`cancel-subscription:${session.user.id}`, {
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.stripeSubscriptionId) {
      return Response.json({ error: "No active subscription" }, { status: 400 });
    }

  // Cancel at the end of the current period, not immediately
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Subscription cancellation failed", {
      code: error?.code,
      type: error?.type,
    });
    return Response.json({ error: "Unable to cancel subscription" }, { status: 500 });
  }
}
