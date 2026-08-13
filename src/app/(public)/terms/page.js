import Footer from "@/components/Footer";

const LAST_UPDATED = "March 2025";

const sections = [
  {
    title: "1. Acceptance of terms",
    content: `By creating an account or using HoopiQ, you agree to these Terms of Service. If you do not agree, do not use the service. These terms apply to all users, including free and paid subscribers.`,
  },
  {
    title: "2. Description of service",
    content: `HoopiQ is a sports analytics platform providing NBA player statistics, hit rate tracking, and betting insights. The service is provided for informational and entertainment purposes only. We do not provide financial or gambling advice. Use of our data for betting decisions is entirely at your own risk.`,
  },
  {
    title: "3. Accounts",
    content: null,
    list: [
      "You must provide a valid email address to create an account.",
      "You are responsible for maintaining the security of your account credentials.",
      "You must be at least 18 years old to use this service.",
      "One account per person. Creating multiple accounts to circumvent plan restrictions is not permitted.",
      "We reserve the right to suspend or terminate accounts that violate these terms.",
    ],
  },
  {
    title: "4. Free plan",
    content: `The free plan provides limited access to the service at no cost. We reserve the right to change the features available on the free plan at any time. Free plan access is subject to daily player limits that rotate automatically.`,
  },
  {
    title: "5. Pro plan and billing",
    content: null,
    list: [
      "The Pro plan is a paid subscription billed monthly or once per NBA season, as chosen at checkout.",
      "A 7-day free trial is available. No credit card is required to start the trial.",
      "After the trial period, you will be charged automatically unless you cancel before the trial ends.",
      "We will send a reminder email 3 days before your trial expires.",
      "All payments are processed securely by Stripe. We do not store your payment details.",
      "Prices are displayed in EUR and are inclusive of any applicable taxes.",
    ],
  },
  {
    title: "6. Cancellation",
    content: `You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of your current billing period. You will retain access to Pro features until that date. We do not offer refunds for partial billing periods.`,
  },
  {
    title: "7. Acceptable use",
    content: `You agree not to:`,
    list: [
      "Scrape, copy, or redistribute our data or platform without permission.",
      "Attempt to reverse engineer or access non-public parts of the service.",
      "Use the service for any unlawful purpose.",
      "Share your account credentials with others.",
      "Attempt to circumvent plan restrictions through technical means.",
    ],
  },
  {
    title: "8. Intellectual property",
    content: `All content, design, and code on HoopiQ is owned by us or our licensors. NBA statistics data is sourced from publicly available information. HoopiQ is not affiliated with or endorsed by the NBA or any NBA team.`,
  },
  {
    title: "9. Disclaimer",
    content: `The service is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or timeliness of any data. We are not responsible for any financial losses resulting from use of our platform. Sports betting involves risk — always gamble responsibly.`,
  },
  {
    title: "10. Limitation of liability",
    content: `To the maximum extent permitted by law, HoopiQ shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim.`,
  },
  {
    title: "11. Changes to these terms",
    content: `We may update these Terms of Service at any time. If we make material changes, we will notify you by email. Continued use of the service after changes constitutes acceptance of the updated terms.`,
  },
  {
    title: "12. Governing law",
    content: `These terms are governed by the laws of Portugal. Any disputes shall be subject to the exclusive jurisdiction of the courts of Portugal.`,
  },
  {
    title: "13. Contact",
    content: `For any questions about these terms, contact us at legal@hoopiq.com.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] font-sans flex flex-col">
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,42,62,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,42,62,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-[720px] mx-auto px-6 py-16 relative z-10 flex-1">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-400">
              Legal
            </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-[11px] font-mono text-slate-600 uppercase tracking-widest">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-5 rounded-sm bg-orange-500 flex-shrink-0" />
                <h2 className="text-[13px] font-bold text-white uppercase tracking-widest">
                  {section.title}
                </h2>
              </div>
              <div className="pl-4 border-l border-white/[0.04]">
                {section.content && (
                  <p className="text-[12px] font-mono text-slate-400 leading-relaxed mb-3">
                    {section.content}
                  </p>
                )}
                {section.list && (
                  <ul className="flex flex-col gap-2">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-orange-500/60 flex-shrink-0 mt-2" />
                        <p className="text-[12px] font-mono text-slate-400 leading-relaxed">
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
