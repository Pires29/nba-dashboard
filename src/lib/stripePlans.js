export function getSeasonAccessEnd(purchasedAt = new Date()) {
  const year = purchasedAt.getUTCFullYear();
  const endYear = purchasedAt.getUTCMonth() >= 6 ? year + 1 : year;
  return new Date(Date.UTC(endYear, 5, 30, 23, 59, 59, 999));
}

export function validateCheckoutPlan({ billing, user, prices }) {
  if (!Object.hasOwn(prices, billing) || !prices[billing]) {
    return { valid: false, status: 400, error: "Invalid billing option" };
  }
  if (user.stripeSubscriptionId) {
    if (user.plan === "trial" && billing === "season") {
      return {
        valid: true,
        priceId: prices[billing],
        mode: "payment",
        applyTrial: false,
        priorSubscriptionId: user.stripeSubscriptionId,
      };
    }
    return { valid: false, status: 409, error: "An active subscription already exists" };
  }
  if (user.plan === "pro") {
    return { valid: false, status: 409, error: "An active subscription already exists" };
  }
  if (billing === "trial" && user.hasUsedTrial) {
    return { valid: false, status: 409, error: "Trial already used" };
  }

  return {
    valid: true,
    priceId: prices[billing],
    mode: billing === "season" ? "payment" : "subscription",
    applyTrial: billing === "trial" && !user.hasUsedTrial,
  };
}
