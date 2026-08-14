import test from "node:test";
import assert from "node:assert/strict";
import { removeStripeCustomerAndSubscriptions } from "../src/lib/stripeBilling.js";

test("cancels the subscription before deleting the Stripe customer", async () => {
  const calls = [];
  const stripe = {
    subscriptions: { cancel: async (id) => calls.push(["subscription", id]) },
    customers: { del: async (id) => calls.push(["customer", id]) },
  };

  await removeStripeCustomerAndSubscriptions(stripe, {
    stripeSubscriptionId: "sub_test",
    stripeCustomerId: "cus_test",
  });

  assert.deepEqual(calls, [
    ["subscription", "sub_test"],
    ["customer", "cus_test"],
  ]);
});

test("ignores resources already removed but propagates Stripe outages", async () => {
  const missing = Object.assign(new Error("missing"), { code: "resource_missing" });
  const stripeWithMissingResources = {
    subscriptions: { cancel: async () => { throw missing; } },
    customers: { del: async () => { throw missing; } },
  };
  await assert.doesNotReject(() =>
    removeStripeCustomerAndSubscriptions(stripeWithMissingResources, {
      stripeSubscriptionId: "sub_missing",
      stripeCustomerId: "cus_missing",
    }),
  );

  const stripeUnavailable = {
    subscriptions: { cancel: async () => { throw new Error("network down"); } },
    customers: { del: async () => {} },
  };
  await assert.rejects(() =>
    removeStripeCustomerAndSubscriptions(stripeUnavailable, {
      stripeSubscriptionId: "sub_test",
      stripeCustomerId: "cus_test",
    }),
  );
});
