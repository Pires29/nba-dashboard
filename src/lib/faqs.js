export const ALL_FAQS = [
  {
    id: "trial",
    question: "Can I try PRO for free?",
    answer:
      "Yes! Start a 14-day free trial with full access to all PRO features. No credit card required.",
  },
  {
    id: "trial-end",
    question: "What happens after my trial ends?",
    answer:
      "After 14 days, you'll be charged for your chosen plan. We'll send you a reminder email 3 days before your trial expires.",
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
      "Yes. All calculations run locally in your browser — your data never leaves your device. Payments are processed securely by Stripe (PCI-DSS Level 1 certified).",
  },
];

export const PRICING_FAQS = ALL_FAQS.filter((f) =>
  ["trial", "cancel", "security"].includes(f.id),
);