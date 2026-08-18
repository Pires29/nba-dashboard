export const runtime = "nodejs";

import Stripe from "stripe";
import prisma from "../../../../../prisma/prismaClient";
import { getSeasonAccessEnd } from "@/lib/stripePlans";
import {
  claimWebhookEvent,
  completeSeasonCheckout,
  releaseCheckoutAttempt,
  releaseWebhookClaim,
  shouldApplySubscriptionUpdate,
} from "@/lib/stripeBilling";

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

  if (!(await claimWebhookEvent(prisma, event))) {
    return Response.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const referralCodeId = session.metadata?.referralCodeId;
      const billing = session.metadata?.billing;
      const checkoutAttemptId = session.metadata?.checkoutAttemptId;
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
        await completeSeasonCheckout({
          stripe,
          db: prisma,
          session,
          accessEnd: getSeasonAccessEnd(new Date(session.created * 1000)),
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
      await releaseCheckoutAttempt(prisma, checkoutAttemptId
        ? { id: checkoutAttemptId }
        : { userId });
      break;
    }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const checkoutAttemptId = session.metadata?.checkoutAttemptId;
        if (checkoutAttemptId || userId) {
          await releaseCheckoutAttempt(prisma, checkoutAttemptId
            ? { id: checkoutAttemptId }
            : { userId });
        }
        if (userId) {
          await prisma.referralUse.deleteMany({
            where: { referredUserId: userId, discountApplied: false },
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const userId = subscription.metadata?.userId || customer.metadata?.userId;
        if (!userId) break;

        const currentUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { stripeSubscriptionId: true, planInterval: true },
        });
        if (!shouldApplySubscriptionUpdate(currentUser, subscription.id)) break;

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
        where: { id: userId, stripeSubscriptionId: invoice.subscription },
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
        where: { id: userId, stripeSubscriptionId: subscription.id },
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
          where: { id: userId, stripeSubscriptionId: invoice.subscription },
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

  } catch (error) {
    await releaseWebhookClaim(prisma, event.id).catch(() => undefined);
    console.error("Stripe webhook processing failed", {
      eventId: event.id,
      eventType: event.type,
      code: error?.code,
    });
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}
