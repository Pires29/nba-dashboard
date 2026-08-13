export const runtime = "nodejs";

import Stripe from "stripe";
import prisma from "../../../../../prisma/prismaClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getSeasonAccessEnd(purchasedAt = new Date()) {
  const year = purchasedAt.getUTCFullYear();
  const endYear = purchasedAt.getUTCMonth() >= 6 ? year + 1 : year;
  return new Date(Date.UTC(endYear, 5, 30, 23, 59, 59, 999));
}

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return Response.json(
      { error: `Webhook error: ${err.message}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const referralCodeId = session.metadata?.referralCodeId;
      const billing = session.metadata?.billing;
      if (!userId) break;

      if (referralCodeId) {
        await prisma.referralUse.create({
          data: {
            referralCodeId,
            referredUserId: userId,
            discountApplied: true,
            amountPaid: session.amount_total,
            stripeSessionId: session.id,
          },
        });
      }

      if (billing === "season" && session.mode === "payment") {
        if (session.payment_status !== "paid") break;

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "pro",
            stripeSubscriptionId: null,
            planRenewsAt: getSeasonAccessEnd(),
            planInterval: "season",
          },
        });
        break;
      }

      const subscription = await stripe.subscriptions.retrieve(session.subscription);

      const renewsAt = new Date(
        subscription.items.data[0].current_period_end * 1000,
      );

      const interval = subscription.items.data[0].price.recurring.interval;

      console.log("subscription", subscription);
      console.log(
        "subscription",
        subscription.items.data[0].price.recurring.interval,
      );
      console.log("subscription", subscription.items.data);

      const plan = subscription.status === "trialing" ? "trial" : "pro";

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          stripeSubscriptionId: subscription.id,
          planRenewsAt: renewsAt,
          planInterval: interval,
          ...(subscription.status === "trialing" && {
            hasUsedTrial: true,
            trialStartedAt: new Date(),
          }),
        },
      });
      break;
    }
    case "customer.subscription.updated": {
      // When the trial ends, Stripe changes the status to "active"
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      const userId = customer.metadata?.userId;
      if (!userId) break;

      if (
        subscription.status === "active" &&
        subscription.trial_end &&
        Date.now() / 1000 > subscription.trial_end
      ) {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "pro" },
        });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      if (!invoice.subscription) break;
      const customer = await stripe.customers.retrieve(invoice.customer);
      const userId = customer.metadata?.userId;
      if (!userId) break;
      const renewsAt = invoice.period_end
        ? new Date(invoice.period_end * 1000)
        : null;
      await prisma.user.update({
        where: { id: userId },
        data: { planRenewsAt: renewsAt },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      const userId = customer.metadata?.userId;
      if (!userId) break;

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: "free",
          stripeSubscriptionId: null,
          planRenewsAt: null,
        },
      });
      break;
    }

    case "invoice.payment_failed": {
      console.warn("Payment failed for:", event.data.object.customer);
      break;
    }
  }

  return Response.json({ received: true });
}
