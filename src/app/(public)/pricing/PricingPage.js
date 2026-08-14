// pricing-page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRICING_FAQS } from "@/lib/faqs";

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    className="flex-shrink-0 mt-0.5"
  >
    <circle cx="12" cy="12" r="10" fill="rgba(34,197,94,0.15)" />
    <path
      d="M8 12l3 3 5-5"
      stroke="#22c55e"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#f97316">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const REFERRAL_DISCOUNT = 0.2; // 20%

const BILLING_OPTIONS = [
  {
    id: "trial",
    label: "7-Day Trial",
    price: 0,
    period: "trial",
    badge: "Free",
    badgeColor: "green",
    description: "Then €3.99/mo · Card required",
    savings: "Full Pro access, cancel anytime",
  },
  {
    id: "monthly",
    label: "Monthly",
    price: 3.99,
    period: "mo",
    badge: null,
    description: "Billed monthly, cancel anytime",
  },
  {
    id: "season",
    label: "NBA Season",
    price: 29.99,
    period: "season",
    badge: "One-time",
    badgeColor: "green",
    description: "One payment · Access until June 30",
    savings: "No automatic renewal",
  },
];

const FREE_FEATURES = [
  "15 featured players, refreshed daily",
  "Complete history and advanced stats",
  "Home/away, H2H and playoff filters",
  "Injuries and team comparison",
];

const PRO_FEATURES = [
  "Every NBA player",
  "No daily player limit",
  "Complete history and advanced stats",
  "Home/away, H2H and playoff filters",
  "Injuries and team comparison",
  "Hit-rate tracking",
  "Early access to new features",
];

const TESTIMONIALS = [
  {
    name: "Marco S.",
    role: "Sports bettor · 2 years",
    text: "The hit rate tracking alone is worth it. I've tightened my picks significantly since using this.",
    avatar: "MS",
    rating: 5,
  },
  {
    name: "Diogo F.",
    role: "Fantasy basketball · 3 years",
    text: "Best NBA stats tool I've used. The injury reports and team comparison saved my fantasy season.",
    avatar: "DF",
    rating: 5,
  },
  {
    name: "André P.",
    role: "Casual fan turned bettor",
    text: "Started on Free, upgraded after one week. The historical data completely changes how you read matchups.",
    avatar: "AP",
    rating: 5,
  },
];

const TRUST_SIGNALS = [
  { label: "Active users", value: "2,400+" },
  { label: "Games tracked", value: "1,230+" },
  { label: "Player logs", value: "450K+" },
  { label: "Uptime", value: "99.9%" },
];

function formatRenewDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDaysUntil(date) {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Trial Banner ─────────────────────────────────────────────────────────────

function TrialBanner({ userPlan }) {
  const daysLeft = getDaysUntil(userPlan?.planRenewsAt);
  const totalTrialDays = 7;
  const daysUsed = Math.max(0, totalTrialDays - (daysLeft ?? 0));
  const progressPct = Math.min(
    100,
    Math.max(0, (daysUsed / totalTrialDays) * 100),
  );
  const isEndingSoon = daysLeft !== null && daysLeft <= 2;

  return (
    <div className="relative rounded-2xl border border-amber-500/30 overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.08)] mb-8">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-yellow-400 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400">
                Active trial
              </span>
            </div>
            <h2 className="text-lg font-black text-white">
              {userPlan?.name
                ? `${userPlan.name.split(" ")[0]}, you're in your trial period.`
                : "You're in your trial period."}
            </h2>
            <p className="text-slate-500 font-mono text-xs mt-0.5">
              Upgrade before it ends to keep your Pro access.
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${isEndingSoon ? "bg-red-500/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20"}`}
          >
            <span
              className={`text-[11px] font-mono font-bold uppercase tracking-wider ${isEndingSoon ? "text-red-400" : "text-amber-400"}`}
            >
              {daysLeft !== null ? `${daysLeft}d left` : "Trial"}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
              Trial progress
            </span>
            <span className="text-[9px] font-mono text-slate-600">
              Day {daysUsed} of {totalTrialDays}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isEndingSoon ? "bg-red-500" : "bg-amber-500"}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pro Banner ──────────────────────────────────────────────────────────────

function ProBanner({ userPlan, onManage }) {
  const renewDate = formatRenewDate(userPlan?.planRenewsAt);
  const daysLeft = getDaysUntil(userPlan?.planRenewsAt);
  const isSeasonPlan = userPlan?.planInterval === "season";

  function getPlanLabel(interval) {
    if (interval === "season") return "NBA Season";
    if (interval === "month") return "Monthly";
    return "";
  }

  return (
    <div className="relative rounded-2xl border border-green-500/30 overflow-hidden shadow-[0_0_60px_rgba(34,197,94,0.08)] mb-8">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-green-500 via-emerald-400 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none" />

      <div className="relative p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-green-400">
                {isSeasonPlan ? "Active season pass" : "Active subscription"}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">
              {userPlan?.name
                ? `Hey, ${userPlan.name.split(" ")[0]}.`
                : "Your Pro plan is active."}
            </h2>
            <p className="text-slate-500 font-mono text-sm mt-1">
              {userPlan?.email}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#22c55e">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-[11px] font-mono font-bold text-green-400 uppercase tracking-wider">
              Pro
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-white/6 bg-white/[0.02]">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">
              Plan
            </p>
            <p className="text-sm font-mono font-bold text-white">
              Pro — {getPlanLabel(userPlan.planInterval)}
            </p>
          </div>
          <div
            className={`p-4 rounded-xl border bg-white/[0.02] border-white/6`}
          >
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">
              {isSeasonPlan ? "Access until" : "Renews on"}
            </p>
            <p className={`text-sm font-mono font-bold text-white`}>
              {renewDate ?? "—"}
            </p>
          </div>
          <div
            className={`p-4 rounded-xl border bg-white/[0.02] border-white/6`}
          >
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">
              Days left
            </p>
            <p className={`text-sm font-mono font-bold text-white`}>
              {daysLeft !== null ? `${daysLeft} days` : "—"}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-3">
            Active features
          </p>
          <ul className="grid grid-cols-3 gap-x-6 gap-y-2">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <CheckIcon />
                <span className="text-[11px] font-mono text-slate-400 leading-snug">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {!isSeasonPlan && (
          <>
            <div className="flex items-center gap-3 pt-5 border-t border-white/[0.05]">
              <button
                onClick={onManage}
                className="px-6 py-2.5 rounded-xl text-[11px] font-mono font-bold uppercase tracking-widest border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all"
              >
                Manage subscription
              </button>
            </div>
            <p className="text-[9px] font-mono text-slate-700 mt-3">
              You can cancel, change plan or update your payment method at any time.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Discount Badge ───────────────────────────────────────────────────────────

function DiscountBadge({ code, discountPct }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        className="flex-shrink-0"
      >
        <circle cx="12" cy="12" r="10" fill="rgba(34,197,94,0.2)" />
        <path
          d="M8 12l3 3 5-5"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-mono font-bold text-green-400 uppercase tracking-wider">
          {code}
        </span>
        <span className="text-[10px] font-mono text-slate-500">·</span>
        <span className="text-[10px] font-mono font-bold text-green-400">
          -{discountPct}% applied
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PricingPage({ userPlan }) {
  const [selectedBilling, setSelectedBilling] = useState("season");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isPro = userPlan?.plan === "pro";
  const isTrial = userPlan?.plan === "trial";

  const visibleBillingOptions = BILLING_OPTIONS.filter(
    (b) => !(isTrial && b.id === "trial"),
  );

  const activePlan = BILLING_OPTIONS.find((b) => b.id === selectedBilling);

  const [referralCode, setReferralCode] = useState("");
  const [referralStatus, setReferralStatus] = useState(null);
  const [appliedCode, setAppliedCode] = useState(null); // tracks the validated code string

  const discountActive = referralStatus === "valid" && activePlan?.price > 0;
  const discountPct = Math.round(REFERRAL_DISCOUNT * 100);
  const discountedPrice = activePlan
    ? discountActive
      ? activePlan.price * (1 - REFERRAL_DISCOUNT)
      : activePlan.price
    : 0;

  // Discounted NBA season total for description
  const validateReferral = async () => {
    if (!referralCode) return;
    setReferralStatus("loading");

    const res = await fetch("/api/referral/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: referralCode }),
    });
    const data = await res.json();

    if (data.valid) {
      setReferralStatus("valid");
      setAppliedCode(referralCode.trim().toUpperCase());
    } else {
      setReferralStatus("invalid");
      setAppliedCode(null);
    }
  };

  const handleCheckout = async (billing) => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing, referralCode: appliedCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url;
      } else if (res.status === 401) {
        router.push("/login?callbackUrl=/pricing");
      } else {
        throw new Error(data.error || "Unable to start checkout");
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManage = () => {
    router.push("/settings");
  };

  const handleUpgrade = () => handleCheckout(selectedBilling);
  const handleRenew = () => handleCheckout("season");

  const ctaLabel = selectedBilling === "trial" ? "Start Free Trial" : "Get Pro";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] font-sans">
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,42,62,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,42,62,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-[900px] mx-auto px-6 py-16 relative z-10">
        {/* ── PRO STATE ──────────────────────────────────────────────────── */}
        {isPro ? (
          <>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-green-400">
                  Active Pro subscription
                </span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tight leading-none mb-4">
                You have the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                  full edge.
                </span>
              </h1>
              <p className="text-slate-500 font-mono text-sm max-w-md mx-auto leading-relaxed">
                All Pro features are active on your account.
              </p>
            </div>

            <ProBanner
              userPlan={userPlan}
              onManage={handleManage}
              onRenew={handleRenew}
              loading={loading}
            />
          </>
        ) : (
          <>
            {/* ── TRIAL / FREE STATE ─────────────────────────────────────── */}
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-400">
                  Season 2025–26
                </span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tight leading-none mb-4">
                {isTrial ? (
                  <>
                    Your trial is{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                      ending soon.
                    </span>
                  </>
                ) : (
                  <>
                    One plan.
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                      Full edge.
                    </span>
                  </>
                )}
              </h1>
              <p className="text-slate-500 font-mono text-sm max-w-md mx-auto leading-relaxed">
                {isTrial
                  ? "Choose a plan now to keep access to all Pro features."
                  : "No tiers, no confusing feature gates. Get everything and win more bets."}
              </p>
            </div>

            {isTrial && <TrialBanner userPlan={userPlan} />}

            {/* Main Card */}
            <div className="relative rounded-2xl border border-orange-500/30 overflow-hidden shadow-[0_0_80px_rgba(249,115,22,0.12)] mb-8">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#1e1506]/60 to-transparent pointer-events-none" />

              <div className="relative grid grid-cols-[1fr_340px]">
                {/* Left — features */}
                {/* Left — promo */}
                <div className="p-8 border-r border-white/6 flex flex-col justify-between">
                  <div>
                    <p className="font-mono font-black text-[11px] uppercase tracking-[0.2em] text-orange-400 mb-1">
                      Pro Plan
                    </p>
                    <p className="text-[13px] text-slate-500 font-mono mb-8">
                      Unlock what the Free plan does not include
                    </p>

                    {/* Benefit 1 */}
                    <div className="relative rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent p-6 mb-4 overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-orange-500/60 to-transparent" />
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              stroke="#f97316"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M3 9h18"
                              stroke="#f97316"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M8 2v4M16 2v4"
                              stroke="#f97316"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M7 14h4M7 17h6"
                              stroke="#f97316"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-black text-[15px] mb-1">
                            Every game, same complete analysis
                          </p>
                          <p className="text-slate-500 font-mono text-[11px] leading-relaxed">
                            Games and analysis tools are available on both plans.
                            Pro removes the daily player restriction.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Benefit 2 */}
                    <div className="relative rounded-2xl border border-amber-500/20 bg-gradient-to-br from-orange-500/10 to-transparent p-6 overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-orange-500/60 to-transparent" />
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="8"
                              r="4"
                              stroke="#f59e0b"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M4 20c0-4 3.58-7 8-7s8 3 8 7"
                              stroke="#f59e0b"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M17 11l1.5 1.5L21 10"
                              stroke="#f59e0b"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-black text-[15px] mb-1">
                            Every NBA player
                          </p>
                          <p className="text-slate-500 font-mono text-[11px] leading-relaxed">
                            The Free plan gives you access to only 15 players,
                            refreshed daily. Pro unlocks every roster with no
                            limits.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Free note */}
                  <div className="mt-8 pt-6 border-t border-white/[0.05]">
                    <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">
                      Everything else is available on the Free plan
                    </p>
                    <p className="text-[11px] font-mono text-slate-700 leading-relaxed">
                      Stats, history, injuries, comparisons, advanced filters,
                      and hit-rate tracking — included in both plans.
                    </p>
                  </div>
                </div>

                {/* Right — billing + CTA */}
                <div className="p-8 flex flex-col justify-between bg-[#0D1828]/60">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-3">
                      Choose billing
                    </p>
                    <div className="flex flex-col gap-2">
                      {visibleBillingOptions.map((option) => {
                        const optionDiscountActive =
                          referralStatus === "valid" && option.price > 0;
                        const optionDiscountedPrice = optionDiscountActive
                          ? option.price * (1 - REFERRAL_DISCOUNT)
                          : null;

                        return (
                          <button
                            key={option.id}
                            onClick={() => setSelectedBilling(option.id)}
                            className={`relative w-full p-3.5 rounded-xl border text-left transition-all duration-150 ${
                              selectedBilling === option.id
                                ? "border-orange-500/50 bg-orange-500/10"
                                : "border-white/6 bg-white/[0.02] hover:border-white/10"
                            }`}
                          >
                            {/* {option.badge && (
                              <span
                                className={`absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                                  option.badgeColor === "green"
                                    ? "bg-green-500/15 text-green-400"
                                    : "bg-orange-500/15 text-orange-400"
                                }`}
                              >
                                {option.badge}
                              </span>
                            )} */}
                            <div className="flex items-center gap-2.5 mb-1">
                              <div
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  selectedBilling === option.id
                                    ? "border-orange-500"
                                    : "border-slate-700"
                                }`}
                              >
                                {selectedBilling === option.id && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                )}
                              </div>
                              <span
                                className={`text-[12px] font-mono font-bold uppercase tracking-widest ${
                                  selectedBilling === option.id
                                    ? "text-white"
                                    : "text-slate-500"
                                }`}
                              >
                                {option.label}
                              </span>

                              {option.badge && (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                                    option.badgeColor === "green"
                                      ? "bg-green-500/15 text-green-400"
                                      : "bg-orange-500/15 text-orange-400"
                                  }`}
                                >
                                  {option.badge}
                                </span>
                              )}

                              {/* Inline discounted price pill on the option row */}
                              {optionDiscountActive && (
                                <span className="ml-auto mr-1 flex items-center gap-1">
                                  <span className="text-[9px] font-mono text-slate-600 line-through">
                                    €{option.price.toFixed(2)}
                                  </span>
                                  <span className="text-[9px] font-mono font-bold text-green-400">
                                    €{optionDiscountedPrice.toFixed(2)}
                                  </span>
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[10px] font-mono ml-6 ${
                                selectedBilling === option.id
                                  ? "text-slate-400"
                                  : "text-slate-700"
                              }`}
                            >
                              {/* Update NBA season description when discount is active */}
                              {optionDiscountActive && option.id === "season"
                                ? "One payment · Access until June 30"
                                : optionDiscountActive &&
                                    option.id === "monthly"
                                  ? "Billed monthly, cancel anytime"
                                  : option.description}
                            </p>
                            {option.savings &&
                              selectedBilling === option.id && (
                                <p className="text-[10px] font-mono ml-6 text-orange-400 mt-0.5">
                                  {option.savings}
                                </p>
                              )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div className="mt-6">
                    {/* Price display — with or without discount */}
                    {discountActive ? (
                      <div className="mb-1">
                        {/* Original price struck through */}
                        <div className="flex items-baseline gap-1 mb-0.5">
                          <span className="text-slate-600 font-mono text-sm line-through">
                            €{activePlan.price.toFixed(2)}
                          </span>
                          <span className="text-slate-600 font-mono text-xs line-through">
                            /{activePlan.period}
                          </span>
                        </div>
                        {/* Discounted price */}
                        <div className="flex items-baseline gap-1">
                          <span className="text-green-400 font-mono text-lg">
                            €
                          </span>
                          <span className="text-5xl font-black text-white">
                            {discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-slate-600 font-mono text-sm">
                            /{activePlan.period}
                          </span>
                          <span className="ml-1 px-1.5 py-0.5 rounded bg-green-500/15 border border-green-500/20 text-[9px] font-mono font-bold text-green-400 uppercase tracking-wider self-center">
                            -{discountPct}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-slate-500 font-mono text-lg">
                          €
                        </span>
                        <span className="text-5xl font-black text-white">
                          {activePlan.price.toFixed(2)}
                        </span>
                        <span className="text-slate-600 font-mono text-sm">
                          /{activePlan.period}
                        </span>
                      </div>
                    )}

                    <p className="text-[10px] font-mono text-slate-600 mb-5">
                      {discountActive && selectedBilling === "season"
                        ? "One payment · Access until June 30"
                        : activePlan.description}
                    </p>

                    <button
                      onClick={handleUpgrade}
                      disabled={loading}
                      className="block w-full py-3 rounded-xl text-center text-[12px] font-mono font-bold uppercase tracking-widest bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white shadow-[0_0_24px_rgba(249,115,22,0.35)] hover:shadow-[0_0_36px_rgba(249,115,22,0.5)] transition-all mb-3"
                    >
                      {loading ? "Redirecting..." : ctaLabel}
                    </button>
                    <Link
                      href="/"
                      className="block w-full py-2.5 rounded-xl text-center text-[11px] font-mono uppercase tracking-widest border border-white/6 hover:border-white/10 text-slate-600 hover:text-slate-400 transition-all"
                    >
                      Continue with Free
                    </Link>
                    <p className="text-center text-[9px] font-mono text-slate-700 mt-3">
                      Secure payment via Stripe · Cancel anytime
                    </p>
                  </div>

                  {/* Referral Code */}
                  <div className="mt-4">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-2">
                      Referral code
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => {
                          setReferralCode(e.target.value.toUpperCase());
                          setReferralStatus(null);
                          setAppliedCode(null);
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && validateReferral()
                        }
                        placeholder="Ex: JOAO20"
                        className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] font-mono text-white placeholder-slate-700 focus:outline-none focus:border-orange-500/40 transition-colors"
                      />
                      <button
                        onClick={validateReferral}
                        disabled={!referralCode || referralStatus === "loading"}
                        className="px-3 py-2 rounded-xl border border-white/10 hover:border-orange-500/30 text-[10px] font-mono text-slate-400 hover:text-orange-400 disabled:opacity-40 transition-all"
                      >
                        {referralStatus === "loading" ? "..." : "Apply"}
                      </button>
                    </div>

                    {referralStatus === "valid" && (
                      <div className="mt-2 space-y-1.5">
                        {activePlan?.price > 0 && (
                          <p className="text-[10px] font-mono text-slate-500 pl-1">
                            You save{" "}
                            <span className="text-green-400 font-bold">
                              €
                              {(activePlan.price * REFERRAL_DISCOUNT).toFixed(
                                2,
                              )}
                              /mo
                            </span>{" "}
                            with this code.
                          </p>
                        )}
                      </div>
                    )}
                    {referralStatus === "invalid" && (
                      <p className="text-[10px] font-mono text-red-400 mt-1.5 flex items-center gap-1">
                        <span>✕</span> Invalid code.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Trust Signals */}
        <div className="grid grid-cols-4 gap-4 mb-20">
          {TRUST_SIGNALS.map((signal) => (
            <div
              key={signal.label}
              className="text-center p-4 rounded-xl border border-white/6 bg-white/[0.02]"
            >
              <p className="text-2xl font-black text-white font-mono">
                {signal.value}
              </p>
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mt-1">
                {signal.label}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-600 mb-2">
              Social proof
            </p>
            <h2 className="text-2xl font-black text-white">
              Bettors who upgraded, won
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="relative rounded-xl border border-white/6 bg-gradient-to-b from-[#162035] to-[#0F1828] p-5 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-orange-500/30 to-transparent" />
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <p className="text-[13px] text-slate-300 leading-relaxed mb-4 font-mono">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                    <span className="text-[9px] font-mono font-bold text-orange-400">
                      {t.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-white">{t.name}</p>
                    <p className="text-[10px] font-mono text-slate-600">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-600 mb-2">
              FAQ
            </p>
            <h2 className="text-2xl font-black text-white">Common questions</h2>
          </div>
          <div className="flex flex-col gap-3 mb-5">
            {PRICING_FAQS.map((faq) => (
              <div
                key={faq.id}
                className="relative rounded-xl border border-white/6 bg-gradient-to-b from-[#162035] to-[#0F1828] p-5 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-orange-500/20 to-transparent" />
                <div className="flex items-start gap-4">
                  <div className="w-1 h-5 rounded-sm bg-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-bold text-white mb-1.5">
                      {faq.question}
                    </p>
                    <p className="text-[12px] font-mono text-slate-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/faqs"
              className="inline-flex items-center gap-2 text-[11px] font-mono text-slate-500 hover:text-orange-400 uppercase tracking-widest transition-colors"
            >
              View all questions
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Bottom CTA */}
        {!isPro && (
          <div className="relative rounded-2xl border border-orange-500/20 bg-gradient-to-r from-[#1a1200] via-[#1a0d00] to-[#0D1828] p-10 text-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-orange-400 mb-3">
              {isTrial ? "Your trial is active" : "No commitment"}
            </p>
            <h2 className="text-3xl font-black text-white mb-3">
              {isTrial ? "Don't lose your Pro access." : "Cancel anytime"}
            </h2>
            <p className="text-slate-500 font-mono text-sm mb-7">
              {isTrial
                ? "Choose a plan and keep all features without interruption."
                : "Full access from day one. Secure payment via Stripe."}
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-mono font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(249,115,22,0.35)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)]"
              >
                {loading
                  ? "Redirecting..."
                  : isTrial
                    ? "Activate Pro"
                    : ctaLabel}
              </button>
              <Link
                href="/"
                className="px-8 py-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-mono text-sm uppercase tracking-widest transition-all"
              >
                View Demo
              </Link>
            </div>
            {!isTrial && selectedBilling === "trial" && (
              <p className="text-center text-[9px] font-mono text-slate-600 mt-2 leading-relaxed">
                After 7 days, you&apos;ll be charged €3.99/mo automatically.{" "}
                <Link
                  href="/terms"
                  className="text-orange-500/60 hover:text-orange-400"
                >
                  Terms apply
                </Link>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
