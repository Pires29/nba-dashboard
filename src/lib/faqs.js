export const ALL_FAQS = [
  {
    id: "trial",
    question: "Can I try PRO for free?",
    answer:
      "Yes. The 7-day trial includes full Pro access. A payment method is required and the monthly plan starts automatically when the trial ends unless you cancel first.",
  },
  {
    id: "trial-end",
    question: "What happens after my trial ends?",
    answer:
      "After 7 days, the monthly plan starts automatically unless you cancel before the trial ends. You can review or cancel it from your account settings.",
  },
  {
    id: "cancel",
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. Cancel your subscription at any time from your account settings. No questions asked. You'll keep access until the end of your billing period.",
  },
  {
    id: "payment",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards and SEPA Direct Debit via Stripe.",
  },
  {
    id: "security",
    question: "Is my data secure?",
    answer:
      "Passwords are stored as secure hashes and payment details are handled by Stripe. HoopiQ stores the account and plan information needed to provide the service.",
  },
];

export const PRICING_FAQS = ALL_FAQS.filter((f) =>
  ["trial", "cancel", "security"].includes(f.id),
);
