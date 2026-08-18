import test from "node:test";
import assert from "node:assert/strict";
import {
  CheckoutInProgressError,
  claimWebhookEvent,
  completeSeasonCheckout,
  releaseCheckoutAttempt,
  releaseWebhookClaim,
  removeStripeCustomerAndSubscriptions,
  reserveCheckoutAttempt,
  shouldApplySubscriptionUpdate,
} from "../src/lib/stripeBilling.js";

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

function checkoutDb() {
  let attempt = null;
  let queue = Promise.resolve();
  const query = async (strings) => {
    const sql = strings.join(" ");
    return sql.includes('FROM "CheckoutAttempt"') ? (attempt ? [attempt] : []) : [];
  };
  const execute = async (strings, ...values) => {
    const sql = strings.join(" ");
    if (sql.includes('INSERT INTO "CheckoutAttempt"')) {
      attempt = {
        id: values[0],
        userId: values[1],
        billing: values[2],
        stripeSessionId: null,
        expiresAt: values[3],
      };
    } else if (sql.includes('DELETE FROM "CheckoutAttempt"')) {
      attempt = null;
    }
  };
  return {
    $executeRaw: execute,
    $transaction: (callback) => {
      const result = queue.then(() => callback({
        $queryRaw: query,
        $executeRaw: execute,
      }));
      queue = result.catch(() => undefined);
      return result;
    },
    current: () => attempt,
  };
}

test("two concurrent checkout requests reserve only one active attempt", async () => {
  const db = checkoutDb();
  const requests = await Promise.allSettled([
    reserveCheckoutAttempt(db, { userId: "user_1", billing: "monthly" }),
    reserveCheckoutAttempt(db, { userId: "user_1", billing: "monthly" }),
  ]);
  assert.equal(requests.filter(({ status }) => status === "fulfilled").length, 1);
  const rejection = requests.find(({ status }) => status === "rejected");
  assert.ok(rejection.reason instanceof CheckoutInProgressError);
});

test("a returning user resumes the existing Stripe checkout", async () => {
  const db = checkoutDb();
  const first = await reserveCheckoutAttempt(db, {
    userId: "user_1",
    billing: "monthly",
  });
  db.current().stripeSessionId = "cs_test_existing";

  const resumed = await reserveCheckoutAttempt(db, {
    userId: "user_1",
    billing: "monthly",
  });

  assert.equal(resumed.id, first.id);
  assert.equal(resumed.stripeSessionId, "cs_test_existing");
  assert.equal(resumed.reused, true);
});

test("abandoned or failed checkout releases its server reservation", async () => {
  const db = checkoutDb();
  await reserveCheckoutAttempt(db, { userId: "user_1", billing: "monthly" });
  await releaseCheckoutAttempt(db, { userId: "user_1" });
  assert.equal(db.current(), null);
  await assert.doesNotReject(() =>
    reserveCheckoutAttempt(db, { userId: "user_1", billing: "monthly" }),
  );
});

test("season checkout cancels trial only after payment is confirmed", async () => {
  const calls = [];
  const db = {
    user: { update: async (value) => calls.push(["update", value]) },
    $executeRaw: async () => calls.push(["release"]),
  };
  const stripe = { subscriptions: { cancel: async (id) => calls.push(["cancel", id]) } };
  const session = {
    payment_status: "unpaid",
    metadata: { userId: "user_1", priorSubscriptionId: "sub_trial", checkoutAttemptId: "attempt_1" },
  };
  assert.equal(await completeSeasonCheckout({ stripe, db, session, accessEnd: new Date(0) }), false);
  assert.deepEqual(calls, []);

  session.payment_status = "paid";
  assert.equal(await completeSeasonCheckout({ stripe, db, session, accessEnd: new Date(0) }), true);
  assert.deepEqual(calls.map(([name]) => name), ["cancel", "update", "release"]);
});

test("webhook replay is claimed once and a failed claim can be retried", async () => {
  const ids = new Set();
  const duplicate = Object.assign(new Error("duplicate"), { code: "P2002" });
  const db = {
    stripeWebhookEvent: {
      create: async ({ data }) => {
        if (ids.has(data.id)) throw duplicate;
        ids.add(data.id);
      },
      delete: async ({ where }) => { ids.delete(where.id); },
    },
  };
  const event = { id: "evt_1", type: "checkout.session.completed" };
  assert.equal(await claimWebhookEvent(db, event), true);
  assert.equal(await claimWebhookEvent(db, event), false);
  await releaseWebhookClaim(db, event.id);
  assert.equal(await claimWebhookEvent(db, event), true);
});

test("late events from a cancelled trial cannot overwrite a season pass", () => {
  assert.equal(
    shouldApplySubscriptionUpdate(
      { planInterval: "season", stripeSubscriptionId: null },
      "sub_old_trial",
    ),
    false,
  );
  assert.equal(
    shouldApplySubscriptionUpdate(
      { planInterval: "month", stripeSubscriptionId: "sub_current" },
      "sub_old_trial",
    ),
    false,
  );
  assert.equal(
    shouldApplySubscriptionUpdate(
      { planInterval: "month", stripeSubscriptionId: "sub_current" },
      "sub_current",
    ),
    true,
  );
});
