"use client";

import { useState } from "react";
import Link from "next/link";

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

const BILLING_OPTIONS = [
  {
    id: "monthly",
    label: "Monthly",
    price: 9.99,
    period: "mo",
    badge: null,
    description: "Billed monthly, cancel anytime",
  },
  {
    id: "yearly",
    label: "Yearly",
    price: 7.99,
    period: "mo",
    badge: "Save 20%",
    badgeColor: "green",
    description: "€95.88 billed once a year",
    savings: "Save €24 vs monthly",
  },
  {
    id: "season",
    label: "Season",
    price: 6.99,
    period: "mo",
    badge: "Save 30%",
    badgeColor: "orange",
    description: "Oct → Jun · 9 months · €62.91 total",
    savings: "Best value for bettors",
  },
];

const FREE_FEATURES = [
  "Today's games only",
  "5 players per team",
  "Last 5 games history",
  "Basic player stats",
];

const PRO_FEATURES = [
  "All scheduled games",
  "Full team rosters",
  "Full game history (season)",
  "Advanced player stats",
  "Injury reports & status",
  "Team comparison",
  "Advanced filters (home/away, win/loss)",
  "Hit rate tracking",
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

export default function PricingPage() {
  const [selectedBilling, setSelectedBilling] = useState("yearly");
  const activePlan = BILLING_OPTIONS.find((b) => b.id === selectedBilling);

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
        {/* ── HEADER ── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-400">
              Season 2025–26
            </span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight leading-none mb-4">
            One plan.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              Full edge.
            </span>
          </h1>
          <p className="text-slate-500 font-mono text-sm max-w-md mx-auto leading-relaxed">
            No tiers, no confusing feature gates. Get everything and win more
            bets.
          </p>
        </div>

        {/* ── MAIN CARD ── */}
        <div className="relative rounded-2xl border border-orange-500/30 overflow-hidden shadow-[0_0_80px_rgba(249,115,22,0.12)] mb-8">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1e1506]/60 to-transparent pointer-events-none" />

          <div className="relative grid grid-cols-[1fr_340px]">
            {/* Left — features */}
            <div className="p-8 border-r border-white/[0.06]">
              <div className="mb-6">
                <p className="font-mono font-black text-[11px] uppercase tracking-[0.2em] text-orange-400 mb-1">
                  Pro Plan
                </p>
                <p className="text-[13px] text-slate-500 font-mono">
                  Everything you need to bet smarter
                </p>
              </div>

              <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckIcon />
                    <span className="text-[12px] font-mono text-slate-300 leading-snug">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Free plan note */}
              <div className="mt-8 pt-6 border-t border-white/[0.05]">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-3">
                  Free plan includes
                </p>
                <div className="flex flex-wrap gap-2">
                  {FREE_FEATURES.map((f) => (
                    <span
                      key={f}
                      className="px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-slate-600"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — billing + CTA */}
            <div className="p-8 flex flex-col justify-between bg-[#0D1828]/60">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-3">
                  Choose billing
                </p>
                <div className="flex flex-col gap-2">
                  {BILLING_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedBilling(option.id)}
                      className={`relative w-full p-3.5 rounded-xl border text-left transition-all duration-150 ${selectedBilling === option.id ? "border-orange-500/50 bg-orange-500/10" : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"}`}
                    >
                      {option.badge && (
                        <span
                          className={`absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${option.badgeColor === "green" ? "bg-green-500/15 text-green-400" : "bg-orange-500/15 text-orange-400"}`}
                        >
                          {option.badge}
                        </span>
                      )}
                      <div className="flex items-center gap-2.5 mb-1">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedBilling === option.id ? "border-orange-500" : "border-slate-700"}`}
                        >
                          {selectedBilling === option.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          )}
                        </div>
                        <span
                          className={`text-[12px] font-mono font-bold uppercase tracking-widest ${selectedBilling === option.id ? "text-white" : "text-slate-500"}`}
                        >
                          {option.label}
                        </span>
                      </div>
                      <p
                        className={`text-[10px] font-mono ml-6 ${selectedBilling === option.id ? "text-slate-400" : "text-slate-700"}`}
                      >
                        {option.description}
                      </p>
                      {option.savings && selectedBilling === option.id && (
                        <p className="text-[10px] font-mono ml-6 text-orange-400 mt-0.5">
                          {option.savings}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price + CTA */}
              <div className="mt-6">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-slate-500 font-mono text-lg">€</span>
                  <span className="text-5xl font-black text-white">
                    {activePlan.price.toFixed(2)}
                  </span>
                  <span className="text-slate-600 font-mono text-sm">
                    /{activePlan.period}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-600 mb-5">
                  {activePlan.description}
                </p>

                <Link
                  href="/signup"
                  className="block w-full py-3 rounded-xl text-center text-[12px] font-mono font-bold uppercase tracking-widest bg-orange-500 hover:bg-orange-400 text-white shadow-[0_0_24px_rgba(249,115,22,0.35)] hover:shadow-[0_0_36px_rgba(249,115,22,0.5)] transition-all mb-3"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/"
                  className="block w-full py-2.5 rounded-xl text-center text-[11px] font-mono uppercase tracking-widest border border-white/[0.06] hover:border-white/10 text-slate-600 hover:text-slate-400 transition-all"
                >
                  Continue with Free
                </Link>
                <p className="text-center text-[9px] font-mono text-slate-700 mt-3">
                  7-day free trial · No credit card required
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── TRUST SIGNALS ── */}
        <div className="grid grid-cols-4 gap-4 mb-20">
          {TRUST_SIGNALS.map((signal) => (
            <div
              key={signal.label}
              className="text-center p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"
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

        {/* ── TESTIMONIALS ── */}
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
                className="relative rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#162035] to-[#0F1828] p-5 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-orange-500/30 to-transparent" />
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <p className="text-[13px] text-slate-300 leading-relaxed mb-4 font-mono">
                  "{t.text}"
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

        {/* ── BOTTOM CTA ── */}
        <div className="relative rounded-2xl border border-orange-500/20 bg-gradient-to-r from-[#1a1200] via-[#1a0d00] to-[#0D1828] p-10 text-center overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-orange-400 mb-3">
            No commitment
          </p>
          <h2 className="text-3xl font-black text-white mb-3">
            7-day free trial · Cancel anytime
          </h2>
          <p className="text-slate-500 font-mono text-sm mb-7">
            No credit card required. Full access from day one.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-mono font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(249,115,22,0.35)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)]"
            >
              Start Free Trial
            </Link>
            <Link
              href="/"
              className="px-8 py-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-mono text-sm uppercase tracking-widest transition-all"
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
