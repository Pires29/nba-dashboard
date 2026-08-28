"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ALL_FAQS } from "@/lib/faqs";
import PlayerHeadshotImage from "@/components/PlayerHeadshotImage";

const DISCOUNT = 0.2;
const PLANS = [
  {
    id: "trial",
    name: "7-Day Trial",
    price: 0,
    suffix: "today",
    note: "Card required",
    description: "Explore the complete product before committing.",
    details: ["Nothing charged today", "7 days of full Pro access", "Then €7.99 per month", "Cancel before the trial ends"],
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 7.99,
    suffix: "month",
    note: "Automatic monthly renewal",
    description: "Maximum flexibility with no long-term commitment.",
    details: ["Pay one month at a time", "Cancel whenever you want", "No long-term commitment", "Pro access while subscribed"],
  },
  {
    id: "season",
    name: "NBA Season",
    price: 39.99,
    suffix: "season",
    note: "Access until June 30",
    description: "One payment covers the rest of the NBA season.",
    details: ["Single payment of €39.99", "No automatic renewal", "Access until June 30", "Best value for the full season"],
  },
];
const PREVIEW_ROWS = [
  { playerId: 1628973, player: "J. Brunson", team: "NYK", opponent: "BOS", position: "PG", line: "28.5", l5: "80%", l10: "70%", l20: "65%", full: "62%", h2h: "75%", matchup: "Favorable", rank: 8 },
  { playerId: 1628983, player: "S. Gilgeous-Alexander", team: "OKC", opponent: "DAL", position: "SG", line: "31.5", l5: "60%", l10: "80%", l20: "75%", full: "71%", h2h: "67%", matchup: "Neutral", rank: 15 },
  { playerId: 203999, player: "N. Jokic", team: "DEN", opponent: "MIN", position: "C", line: "25.5", l5: "80%", l10: "70%", l20: "70%", full: "68%", h2h: "60%", matchup: "Favorable", rank: 10 },
  { playerId: 1630162, player: "A. Edwards", team: "MIN", opponent: "DEN", position: "SG", line: "26.5", l5: "60%", l10: "60%", l20: "55%", full: "59%", h2h: "50%", matchup: "Tough", rank: 4 },
];
const BENEFITS = [
  { number: "01", title: "See the trend, not just the average", text: "Compare L5, L10, L20, season, and head-to-head hit rates without jumping between tabs." },
  { number: "02", title: "Put every line in context", text: "Understand opponent strength, home and away splits, injuries, and recent form before you decide." },
  { number: "03", title: "Research the whole slate faster", text: "Filter by game, team, market, matchup, injury status, and hit rate from one focused workspace." },
];

function Check() {
  return <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10" fill="rgba(249,115,22,.15)" /><path d="m8 12 2.5 2.5L16 9" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function HomeLanding({ user }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signedOutToastShown = useRef(false);
  const isPro = user?.plan === "pro";
  const isTrial = user?.plan === "trial";
  const [currentTime, setCurrentTime] = useState(null);
  useEffect(() => {
    const updateClock = () => setCurrentTime(Date.now());
    const initialUpdate = window.setTimeout(updateClock, 0);
    const interval = window.setInterval(updateClock, 60_000);
    return () => {
      window.clearTimeout(initialUpdate);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      window.requestAnimationFrame(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  useEffect(() => {
    if (searchParams.get("signedOut") !== "1") return;
    if (signedOutToastShown.current) return;
    signedOutToastShown.current = true;
    toast("Signed out", {
      id: "signed-out",
      description: "You have been logged out successfully.",
    });
    router.replace("/", { scroll: false });
  }, [router, searchParams]);
  const trialEndsAt = user?.planRenewsAt
    ? new Date(user.planRenewsAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;
  const trialRemainingMs = user?.planRenewsAt && currentTime != null
    ? Math.max(0, new Date(user.planRenewsAt).getTime() - currentTime)
    : null;
  const trialDaysLeft = trialRemainingMs == null
    ? null
    : Math.ceil(trialRemainingMs / (24 * 60 * 60 * 1000));
  const trialProgress = trialRemainingMs == null
    ? 0
    : Math.min(100, Math.max(0, 100 - (trialRemainingMs / (7 * 24 * 60 * 60 * 1000)) * 100));
  const trialDay = trialDaysLeft == null
    ? null
    : Math.min(7, Math.max(1, 8 - trialDaysLeft));
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralStatus, setReferralStatus] = useState(null);
  const [appliedCode, setAppliedCode] = useState(null);

  async function validateReferral() {
    if (!referralCode.trim()) return;
    setReferralStatus("loading");
    try {
      const response = await fetch("/api/referral/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: referralCode }) });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.valid) {
        setReferralStatus("valid");
        setAppliedCode(referralCode.trim().toUpperCase());
      } else {
        setReferralStatus("invalid");
        setAppliedCode(null);
      }
    } catch {
      setReferralStatus("error");
      setAppliedCode(null);
    }
  }

  async function startCheckout(billing) {
    setLoadingPlan(billing);
    setCheckoutError("");
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ billing, referralCode: appliedCode }) });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        router.push("/login?callbackUrl=%2F%23pricing");
        return;
      }
      if (!response.ok || !data.url) throw new Error(data.error || "Unable to start checkout");
      window.location.href = data.url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Unable to start checkout");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="overflow-hidden scroll-smooth bg-[#060b13] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:48px_48px]" />
      <section className="relative mx-auto max-w-[1240px] px-6 pb-20 pt-20 sm:pt-28 lg:pb-28">
        <div className="absolute left-1/2 top-20 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-orange-500/[0.08] blur-[140px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/[0.08] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />Built for the NBA slate</div>
          <h1 className="text-5xl font-black leading-[1.12] tracking-normal sm:text-7xl sm:leading-[1.08] lg:text-[84px]">Research every prop.<span className="block pb-3 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">See the full picture.</span></h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">Player trends, matchup context, injuries, and hit rates — organised in one fast NBA research dashboard.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"><Link href="/props" className="w-full rounded-xl bg-orange-500 px-7 py-3.5 text-center font-mono text-xs font-black uppercase tracking-widest shadow-[0_0_35px_rgba(249,115,22,.28)] transition hover:bg-orange-400 sm:w-auto">Open Props Table</Link>{!isPro && <a href="#pricing" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3.5 text-center font-mono text-xs font-bold uppercase tracking-widest text-slate-300 transition hover:border-white/20 hover:text-white sm:w-auto">{isTrial ? "Keep Pro Access" : "Start 7-Day Trial"}</a>}</div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-slate-600">No spreadsheets. No tab overload. Just the context that matters.</p>
        </div>
        <ProductPreview />
      </section>

      <section id="features" className="relative scroll-mt-20 border-y border-white/[0.06] bg-[#09111d]/80 py-24">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="max-w-2xl"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">One research workflow</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Everything behind the line.</h2><p className="mt-5 text-slate-400">Move from a crowded slate to a focused player view in seconds.</p></div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] md:grid-cols-3">{BENEFITS.map((benefit) => <article key={benefit.number} className="bg-[#0b1421] p-8 lg:p-10"><p className="font-mono text-[10px] font-black text-orange-400">{benefit.number}</p><h3 className="mt-7 text-xl font-black leading-tight">{benefit.title}</h3><p className="mt-4 text-sm leading-6 text-slate-500">{benefit.text}</p></article>)}</div>
          <div className="mt-16 grid items-center gap-10 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent p-7 md:grid-cols-[.8fr_1.2fr] lg:p-12"><div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-orange-400">Three moves. Full context.</p><h3 className="mt-4 text-3xl font-black">From slate to decision without losing the thread.</h3></div><div className="grid gap-3 sm:grid-cols-3">{["Choose a game", "Find a player", "Analyse the prop"].map((step, index) => <div key={step} className="rounded-xl border border-white/[0.07] bg-black/10 p-5"><span className="font-mono text-[9px] text-slate-600">0{index + 1}</span><p className="mt-6 text-sm font-bold">{step}</p></div>)}</div></div>
        </div>
      </section>

      <section id="pricing" className="relative mx-auto max-w-[1120px] scroll-mt-20 px-6 py-24">
        <div className="text-center"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">Simple pricing</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Start free. Unlock every player.</h2><p className="mx-auto mt-5 max-w-xl text-slate-400">Free gives you full analysis for 15 featured players each day. Pro removes the player limit.</p>{!isPro && !isTrial && <p className="mt-4 inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">Every option includes the same complete Pro access</p>}</div>
        {isTrial && (
          <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/[0.12] via-orange-500/[0.08] to-[#0b1421] shadow-[0_18px_55px_rgba(249,115,22,.12)]">
            <div className="h-1 bg-white/[0.06]"><div className="h-full bg-gradient-to-r from-amber-300 to-orange-500 transition-[width]" style={{ width: `${trialProgress}%` }} /></div>
            <div className="grid gap-6 p-6 sm:p-7 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">Trial active</span>
                  {trialDay && <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-200">Day {trialDay} of 7</span>}
                </div>
                <div className="mt-4 flex items-end gap-3">
                  <span className="text-4xl font-black text-white">{trialDaysLeft ?? "—"}</span>
                  <span className="pb-1 text-sm font-bold text-slate-300">{trialDaysLeft === 1 ? "day left" : "days left"}</span>
                </div>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Your trial includes full Pro access. It will renew automatically at <strong className="text-white">€7.99/month</strong>{trialEndsAt ? <> on <strong className="text-white">{trialEndsAt}</strong></> : null} unless you cancel before then.</p>
              </div>
              <Link href="/settings" className="rounded-xl border border-amber-300/25 bg-amber-300/10 px-5 py-3 text-center font-mono text-[10px] font-black uppercase tracking-widest text-amber-200 transition hover:border-amber-300/45 hover:bg-amber-300/15">Manage or cancel trial</Link>
            </div>
          </div>
        )}
        {isPro ? <ProPlan /> : <>
          <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-3">
            {PLANS.map((item) => {
              const trialUnavailable = isTrial && item.id === "trial";
              const monthlyAlreadyScheduled = isTrial && item.id === "monthly";
              const discounted = referralStatus === "valid" && item.price > 0;
              const price = discounted ? item.price * (1 - DISCOUNT) : item.price;
              const featured = item.id === "season";
              return <article key={item.id} className={`relative flex min-h-[470px] flex-col rounded-2xl border p-7 transition sm:p-8 ${featured ? "border-orange-500/60 bg-gradient-to-b from-orange-500/[0.09] to-[#0b1421] shadow-[0_20px_60px_rgba(249,115,22,.12)]" : "border-white/[0.09] bg-[#0b1421]"}`}>
                {featured && <span className="absolute right-6 top-6 rounded-md bg-orange-500 px-2.5 py-1 font-mono text-[8px] font-black uppercase tracking-widest text-white">Best value</span>}
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-orange-400">{item.name}</p>
                <p className="mt-5 min-h-10 text-sm leading-5 text-slate-400">{monthlyAlreadyScheduled ? "Your active trial already converts to this monthly plan automatically." : item.description}</p>
                <div className="mt-7">
                  {discounted && <p className="font-mono text-xs text-slate-600 line-through">€{item.price.toFixed(2)}</p>}
                  <div className="flex items-baseline gap-1"><span className="font-mono text-lg text-slate-500">€</span><span className="text-5xl font-black tracking-tight">{price.toFixed(2)}</span><span className="font-mono text-[10px] text-slate-600">/{item.suffix}</span></div>
                  <p className="mt-2 min-h-8 font-mono text-[9px] leading-4 text-slate-600">{item.note}</p>
                </div>
                <p className="mt-7 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Billing details</p>
                <ul className="mt-4 space-y-3 text-[13px] leading-5 text-slate-300">
                  {item.details.map((detail) => <li key={detail} className="flex gap-2.5"><Check />{detail}</li>)}
                </ul>
                <div className="mt-auto pt-8">
                  <button onClick={() => startCheckout(item.id)} disabled={Boolean(loadingPlan) || trialUnavailable || monthlyAlreadyScheduled} className={`w-full rounded-xl py-3.5 font-mono text-[10px] font-black uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-45 ${featured ? "bg-orange-500 text-white shadow-[0_0_25px_rgba(249,115,22,.25)] hover:bg-orange-400" : "border border-white/15 bg-white/[0.03] text-slate-200 hover:border-orange-500/40 hover:text-orange-300"}`}>{loadingPlan === item.id ? "Redirecting…" : trialUnavailable ? "Trial active" : monthlyAlreadyScheduled ? "Renews automatically" : item.id === "trial" ? "Start Free Trial" : item.id === "monthly" ? "Choose Monthly" : "Get Season Pass"}</button>
                </div>
              </article>;
            })}
          </div>
          {checkoutError && <p role="alert" className="mx-auto mt-4 max-w-xl rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center font-mono text-[10px] text-red-300">{checkoutError}</p>}
          <div className="mx-auto mt-7 max-w-md rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"><label htmlFor="home-referral" className="font-mono text-[9px] uppercase tracking-widest text-slate-600">Have a referral code?</label><div className="mt-2 flex gap-2"><input id="home-referral" value={referralCode} onChange={(event) => { setReferralCode(event.target.value.toUpperCase()); setReferralStatus(null); setAppliedCode(null); }} onKeyDown={(event) => event.key === "Enter" && validateReferral()} placeholder="EX: JOAO20" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/10 px-3 py-2 font-mono text-[10px] text-white placeholder:text-slate-700" /><button onClick={validateReferral} disabled={!referralCode || referralStatus === "loading"} className="rounded-lg border border-white/10 px-4 font-mono text-[9px] uppercase text-slate-400 disabled:opacity-40">{referralStatus === "loading" ? "…" : "Apply"}</button></div>{referralStatus === "valid" && <p className="mt-2 font-mono text-[9px] text-emerald-400">Code applied · 20% off paid plans</p>}{referralStatus === "invalid" && <p role="alert" className="mt-2 font-mono text-[9px] text-red-400">Invalid or unavailable code.</p>}{referralStatus === "error" && <p role="alert" className="mt-2 font-mono text-[9px] text-red-400">Could not validate the code. Try again.</p>}</div>
          <p className="mt-4 text-center font-mono text-[9px] text-slate-700">Secure checkout via Stripe · Cancel anytime</p>
        </>}
      </section>

      <FaqSection />
      <section className="relative px-6 py-24 text-center"><div className="absolute left-1/2 top-1/2 h-52 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[100px]" /><div className="relative"><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-orange-400">Your next slate starts here</p><h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Stop guessing. Start researching.</h2><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/props" className="rounded-xl bg-orange-500 px-7 py-3.5 font-mono text-xs font-black uppercase tracking-widest hover:bg-orange-400">Explore NBA Props</Link>{!isPro && <a href="#pricing" className="rounded-xl border border-white/10 px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-slate-300 hover:border-white/20">Start Free Trial</a>}</div></div></section>
      <footer className="border-t border-white/[0.06]"><div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-5 px-6 py-7"><p className="font-mono text-[10px] text-slate-700">© {new Date().getFullYear()} PropInsight. Research responsibly.</p><div className="flex gap-5 font-mono text-[9px] uppercase tracking-widest text-slate-600"><a href="#features" className="hover:text-slate-300">Features</a><a href="#pricing" className="hover:text-slate-300">Pricing</a><a href="#faq" className="hover:text-slate-300">FAQ</a><Link href="/privacy" className="hover:text-slate-300">Privacy</Link><Link href="/terms" className="hover:text-slate-300">Terms</Link></div></div></footer>
    </div>
  );
}

function ProductPreview() {
  const mobileRows = PREVIEW_ROWS.slice(0, 2);

  return (
    <div className="relative mx-auto mt-16 max-w-5xl rounded-2xl border border-white/10 bg-[#0c1421]/95 p-2 shadow-[0_35px_100px_rgba(0,0,0,.45)] sm:p-4">
      <div className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-r from-orange-500/30 via-transparent to-amber-500/20 blur-sm" />
      <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0a111d]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 sm:px-6">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">Tonight&apos;s board</p>
            <p className="mt-1 text-sm font-black">Player Props <span className="ml-2 text-orange-400">Points</span></p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <span className="rounded-md border border-white/[0.07] px-3 py-1.5 font-mono text-[9px] text-slate-500">All games</span>
            <span className="rounded-md bg-orange-500/10 px-3 py-1.5 font-mono text-[9px] text-orange-400">L10 hit rate ↓</span>
          </div>
        </div>

        <div className="sm:hidden">
          {mobileRows.map((row, index) => (
            <MobilePreviewCard key={row.player} index={index} row={row} />
          ))}
        </div>

        <div className="hidden sm:block">
          <table className="w-full text-left">
            <thead className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
              <tr className="border-b border-white/[0.05]">
                <th className="px-6 py-3">Player</th>
                <th>Line</th>
                <th>L5</th>
                <th>L10</th>
                <th className="pr-6">Matchup</th>
              </tr>
            </thead>
            <tbody>
              {PREVIEW_ROWS.map((row) => (
                <tr key={row.player} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-200">{row.player}</p>
                    <p className="mt-0.5 font-mono text-[9px] text-slate-600">{row.team} · POINTS</p>
                  </td>
                  <td className="font-mono text-xs text-white">{row.line}</td>
                  <td className="font-mono text-xs font-bold text-emerald-400">{row.l5}</td>
                  <td className="font-mono text-xs font-bold text-emerald-400">{row.l10}</td>
                  <td className="pr-6"><PreviewMatchup matchup={row.matchup} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MobilePreviewCard({ index, row }) {
  return (
    <article className="border-b border-white/[0.07] px-3 py-3 last:border-b-0">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0D1828]">
          <PlayerHeadshotImage
            playerId={row.playerId}
            width={40}
            height={30}
            alt=""
            priority={index === 0}
            className="h-full w-full object-cover"
          />
        </span>
        <div className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold leading-tight text-slate-100">{row.player}</span>
            <span className="shrink-0 rounded border border-white/[0.08] px-1 text-[8px] font-mono text-slate-400">{row.position}</span>
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] font-mono">
            <span className="font-bold text-orange-400">{row.team}</span>
            <span className="text-slate-500">vs</span>
            <span className="text-slate-400">{row.opponent}</span>
            <span className="text-slate-600">·</span>
            <span className="font-bold text-slate-200">Points</span>
          </span>
        </div>
        <div className="flex shrink-0 items-start gap-1.5">
          <div className="text-right">
            <span className="block text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">Line</span>
            <span className="block text-[14px] font-mono font-black leading-tight text-white">{row.line}</span>
          </div>
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-slate-500">
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <span>
          <PreviewMatchup matchup={row.matchup} />
          <span className="mt-0.5 block text-[9px] font-mono text-slate-500">#{row.rank} allowed</span>
        </span>
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] text-slate-400"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {[
          ["L5", row.l5, "5g"],
          ["L10", row.l10, "10g"],
          ["L20", row.l20, "20g"],
          ["Full", row.full, "30g"],
          ["H2H", row.h2h, index === 0 ? "4g" : "3g"],
        ].map(([label, value, games]) => (
          <div key={label} className="min-w-0 rounded-md border border-white/[0.07] bg-white/[0.035] px-2 py-1.5 text-center">
            <span className="block text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">{label}</span>
            <span className="mt-0.5 block text-[12px] font-mono font-black leading-tight text-emerald-400">{value}</span>
            <span className="block min-h-3 text-[8px] font-mono leading-tight text-slate-500">{games}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function PreviewMatchup({ matchup }) {
  const color = matchup === "Tough" ? "text-red-400" : matchup === "Neutral" ? "text-amber-300" : "text-emerald-400";

  return <span className={`block text-[11px] font-mono font-bold ${color}`}>{matchup}</span>;
}

function ProPlan() {
  return <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.05] p-8 text-center"><p className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">Your Pro plan is active</p><h3 className="mt-3 text-2xl font-black">You already have the full edge.</h3><p className="mt-3 text-sm text-slate-400">Every NBA player and every PropInsight research feature is available to you.</p><div className="mt-7 flex justify-center gap-3"><Link href="/props" className="rounded-xl bg-orange-500 px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-widest">Open Props</Link><Link href="/settings" className="rounded-xl border border-white/10 px-6 py-3 font-mono text-[11px] uppercase tracking-widest text-slate-300">Manage Plan</Link></div></div>;
}

function FaqSection() {
  return <section id="faq" className="scroll-mt-20 border-t border-white/[0.06] bg-[#09111d]/75 py-24"><div className="mx-auto max-w-3xl px-6"><div className="text-center"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">FAQ</p><h2 className="mt-4 text-4xl font-black">Good questions. Clear answers.</h2></div><div className="mt-12 space-y-3">{ALL_FAQS.map((faq, index) => <details key={faq.id} className="group rounded-xl border border-white/[0.07] bg-[#0b1421] p-5 open:border-orange-500/20"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-sm font-bold"><span><span className="mr-4 font-mono text-[9px] text-orange-400">0{index + 1}</span>{faq.question}</span><span className="font-mono text-lg font-light text-slate-500 transition group-open:rotate-45">+</span></summary><p className="ml-9 mt-4 max-w-2xl text-sm leading-6 text-slate-400">{faq.answer}</p></details>)}</div></div></section>;
}
