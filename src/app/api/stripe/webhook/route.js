export const runtime = "nodejs";

import Stripe from "stripe";
import prisma from "../../../../../prisma/prismaClient";
import { getSeasonAccessEnd } from "@/lib/stripePlans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const contentLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 1_048_576) {
    return Response.json({ error: "Webhook payload too large" }, { status: 413 });
  }

  const body = await req.text();
  if (new TextEncoder().encode(body).length > 1_048_576) {
    return Response.json({ error: "Webhook payload too large" }, { status: 413 });
  }
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return Response.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const alreadyProcessed = await prisma.stripeWebhookEvent.findUnique({
    where: { id: event.id },
    select: { id: true },
  });
  if (alreadyProcessed) {
    return Response.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const referralCodeId = session.metadata?.referralCodeId;
      const billing = session.metadata?.billing;
      if (!userId) break;

      if (referralCodeId) {
        await prisma.referralUse.upsert({
          where: { referredUserId: userId },
          update: {
            discountApplied: true,
            amountPaid: session.amount_total,
            stripeSessionId: session.id,
          },
          create: {
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

      const plan = subscription.status === "trialing" ? "trial" : "pro";

      await prisma.user.updateMany({
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
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const userId = subscription.metadata?.userId || customer.metadata?.userId;
        if (!userId) break;

        const item = subscription.items.data[0];
        const hasAccess = ["active", "trialing"].includes(subscription.status);
        await prisma.user.updateMany({
          where: { id: userId },
          data: {
            plan: hasAccess
              ? subscription.status === "trialing" ? "trial" : "pro"
              : "free",
            stripeSubscriptionId: subscription.id,
            planRenewsAt: item?.current_period_end
              ? new Date(item.current_period_end * 1000)
              : null,
            planInterval: item?.price?.recurring?.interval ?? null,
          },
        });
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
      await prisma.user.updateMany({
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

      await prisma.user.updateMany({
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
      const invoice = event.data.object;
      const customer = await stripe.customers.retrieve(invoice.customer);
      const userId = customer.metadata?.userId;
      if (userId) {
        await prisma.user.updateMany({
          where: { id: userId },
          data: { plan: "free" },
        });
      }
      console.warn("Stripe invoice payment failed", {
        customerId: invoice.customer,
        invoiceId: invoice.id,
      });
      break;
    }
    }

    await prisma.stripeWebhookEvent.create({
      data: { id: event.id, type: event.type },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return Response.json({ received: true, duplicate: true });
    }
    console.error("Stripe webhook processing failed", {
      eventId: event.id,
      eventType: event.type,
      code: error?.code,
    });
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}
