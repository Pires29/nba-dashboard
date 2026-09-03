export const REFERRAL_DISCOUNT = 1;

export const PRICING_PLANS = [
  {
    id: "trial",
    name: "7-Day Trial",
    price: 0,
    suffix: "today",
    note: "Card required",
    description: "Explore the complete product before committing.",
    details: [
      "Nothing charged today",
      "7 days of full Pro access",
      "Then €7.99 per month",
      "Cancel before the trial ends",
    ],
    checkoutLabel: "Start Free Trial",
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 7.99,
    suffix: "month",
    note: "Automatic monthly renewal",
    description: "Maximum flexibility with no long-term commitment.",
    details: [
      "Pay one month at a time",
      "Cancel whenever you want",
      "No long-term commitment",
      "Pro access while subscribed",
    ],
    checkoutLabel: "Choose Monthly",
  },
  {
    id: "season",
    name: "NBA Season",
    price: 39.99,
    suffix: "season",
    note: "Access until June 30",
    description: "One payment covers the rest of the NBA season.",
    details: [
      "Single payment of €39.99",
      "No automatic renewal",
      "Access until June 30",
      "Best value for the full season",
    ],
    checkoutLabel: "Get Season Pass",
    featured: true,
  },
];

export const PREMIUM_BENEFITS = [
  "Unlock every NBA player",
  "Remove the 15-player Free limit",
  "Explore player trends and matchup context",
  "Track injuries, hit rates, and recent form",
  "Use the full props research table",
];

export const PAID_PLAN_PRICES = Object.fromEntries(
  PRICING_PLANS
    .filter((plan) => plan.price > 0)
    .map((plan) => [plan.id, plan.price]),
);
