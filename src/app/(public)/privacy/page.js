import Footer from "@/components/Footer";

const LAST_UPDATED = "August 2026";

const sections = [
  {
    title: "1. Who we are",
    content: `HoopiQ ("we", "us", "our") is a sports analytics platform that provides NBA player statistics and betting insights. This Privacy Policy explains how we collect, use, and protect your personal data in accordance with the General Data Protection Regulation (GDPR).`,
  },
  {
    title: "2. Data we collect",
    content: null,
    list: [
      "**Email address** — collected when you register or sign in with Google. Used to identify your account and send service-related communications.",
      "**Password** — if you register with email/password, your password is stored securely in hashed form. We never store or have access to your plain-text password.",
      "**Google account data** — if you sign in with Google, we receive your name and email address from Google. We do not receive or store your Google password.",
      "**Subscription and billing data** — your payment is processed by Stripe. We do not store your credit card details. We only receive a subscription status (free or pro) and billing period from Stripe.",
      "**Plan and usage data** — we store which plan you are subscribed to in order to control access to features.",
    ],
  },
  {
    title: "3. How we use your data",
    content: null,
    list: [
      "To create and manage your account",
      "To authenticate your identity when you log in",
      "To process payments and manage your subscription via Stripe",
      "To provide access to features based on your plan",
    ],
  },
  {
    title: "4. Third-party services",
    content: `We use the following third-party services that may process your personal data:`,
    list: [
      "**Stripe** — payment processing. Stripe is PCI-DSS Level 1 certified. Your payment data is handled exclusively by Stripe. See Stripe's Privacy Policy at stripe.com/privacy.",
      "**Google OAuth** — optional sign-in via Google. If you use this method, Google's Privacy Policy applies to data shared with Google. See policies.google.com/privacy.",
      "**NextAuth.js** — authentication library used to manage sessions securely.",
    ],
  },
  {
    title: "5. Data storage and security",
    content: `Your data is stored securely in our database. Passwords are hashed and never stored in plain text. All data is transmitted over HTTPS. We do not sell or share your personal data with third parties beyond the services listed above.`,
  },
  {
    title: "6. Your rights under GDPR",
    content: `As a user in the European Union, you have the following rights:`,
    list: [
      "**Right to access** — you can request a copy of the data we hold about you.",
      "**Right to erasure** — you can request deletion of your account and all associated data at any time.",
      "**Right to rectification** — you can request correction of inaccurate data.",
      "**Right to portability** — you can request your data in a portable format.",
      "**Right to object** — you can object to how we process your data.",
    ],
    footer:
      "To exercise any of these rights, contact us at privacy@hoopiq.com. We will respond within 30 days.",
  },
  {
    title: "7. Data retention",
    content: `We retain your data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where we are required to retain it for legal or financial compliance purposes (e.g. Stripe billing records).`,
  },
  {
    title: "8. Cookies",
    content: `We use a session cookie to keep you logged in. This cookie is strictly necessary for the service to function and does not track you across other websites. We do not use advertising or analytics cookies.`,
  },
  {
    title: "9. Changes to this policy",
    content: `We may update this Privacy Policy from time to time. If we make significant changes, we will notify you by email. Continued use of the service after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "10. Contact",
    content: `For any privacy-related questions or requests, contact us at privacy@hoopiq.com.`,
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
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
                  <ul className="flex flex-col gap-2 mb-3">
                    {section.list.map((item, i) => {
                      const parts = item.split("**");
                      return (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-orange-500/60 flex-shrink-0 mt-2" />
                          <p className="text-[12px] font-mono text-slate-400 leading-relaxed">
                            {parts.map((part, j) =>
                              j % 2 === 1 ? (
                                <span
                                  key={j}
                                  className="text-slate-200 font-bold"
                                >
                                  {part}
                                </span>
                              ) : (
                                part
                              ),
                            )}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {section.footer && (
                  <p className="text-[12px] font-mono text-slate-500 leading-relaxed mt-2">
                    {section.footer}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
