export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "../../../../../prisma/prismaClient";
import Stripe from "stripe";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { removeStripeCustomerAndSubscriptions } from "@/lib/stripeBilling";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`delete-account:${session.user.id}`, {
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Billing is stopped before local data is removed. If Stripe is unavailable,
    // keep the local account so support can still identify the subscription.
    await removeStripeCustomerAndSubscriptions(stripe, user);

    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Delete account failed", { code: err?.code, type: err?.type });
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}
