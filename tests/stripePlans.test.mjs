import test from "node:test";
import assert from "node:assert/strict";
import { getSeasonAccessEnd, validateCheckoutPlan } from "../src/lib/stripePlans.js";

const prices = { monthly: "price_monthly", trial: "price_monthly", season: "price_season" };

test("checkout plan distinguishes subscriptions, trials, and season payments", () => {
  assert.deepEqual(
    validateCheckoutPlan({ billing: "monthly", user: { plan: "free" }, prices }),
    { valid: true, priceId: "price_monthly", mode: "subscription", applyTrial: false },
  );
  assert.deepEqual(
    validateCheckoutPlan({ billing: "trial", user: { plan: "free", hasUsedTrial: false }, prices }),
    { valid: true, priceId: "price_monthly", mode: "subscription", applyTrial: true },
  );
  assert.equal(validateCheckoutPlan({ billing: "season", user: { plan: "free" }, prices }).mode, "payment");
});

test("checkout plan rejects invalid, repeated trial, and duplicate subscription purchases", () => {
  assert.equal(validateCheckoutPlan({ billing: "unknown", user: {}, prices }).status, 400);
  assert.equal(validateCheckoutPlan({ billing: "trial", user: { hasUsedTrial: true }, prices }).status, 409);
  assert.equal(validateCheckoutPlan({ billing: "monthly", user: { plan: "pro", planInterval: "month" }, prices }).status, 409);
});

test("trial converts to monthly without opening a second subscription", () => {
  const result = validateCheckoutPlan({
    billing: "monthly",
    user: { plan: "trial", stripeSubscriptionId: "sub_trial" },
    prices,
  });
  assert.equal(result.valid, false);
  assert.equal(result.status, 409);
});

test("trial may buy a season pass while retaining its subscription until payment", () => {
  assert.deepEqual(
    validateCheckoutPlan({
      billing: "season",
      user: { plan: "trial", stripeSubscriptionId: "sub_trial" },
      prices,
    }),
    {
      valid: true,
      priceId: "price_season",
      mode: "payment",
      applyTrial: false,
      priorSubscriptionId: "sub_trial",
    },
  );
});

test("pro account with an active monthly subscription may buy a season pass", () => {
  assert.deepEqual(
    validateCheckoutPlan({
      billing: "season",
      user: { plan: "pro", stripeSubscriptionId: "sub_active" },
      prices,
    }),
    {
      valid: true,
      priceId: "price_season",
      mode: "payment",
      applyTrial: false,
      priorSubscriptionId: "sub_active",
    },
  );
  assert.equal(validateCheckoutPlan({
    billing: "monthly",
    user: { plan: "pro", stripeSubscriptionId: "sub_active" },
    prices,
  }).status, 409);
});

test("active season pass cannot open another checkout without a subscription id", () => {
  for (const billing of ["monthly", "season"]) {
    const result = validateCheckoutPlan({
      billing,
      user: {
        plan: "pro",
        planInterval: "season",
        stripeSubscriptionId: null,
      },
      prices,
    });

    assert.equal(result.valid, false);
    assert.equal(result.status, 409);
  }
});

test("season access ends on June 30 following the active season", () => {
  assert.equal(getSeasonAccessEnd(new Date("2026-08-17T12:00:00Z")).toISOString(), "2027-06-30T23:59:59.999Z");
  assert.equal(getSeasonAccessEnd(new Date("2027-03-01T12:00:00Z")).toISOString(), "2027-06-30T23:59:59.999Z");
});
