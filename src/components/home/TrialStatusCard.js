"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function TrialStatusCard({ planRenewsAt }) {
  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    if (!planRenewsAt) return;

    const updateClock = () => setCurrentTime(Date.now());
    updateClock();
    const interval = window.setInterval(updateClock, 60_000);
    return () => window.clearInterval(interval);
  }, [planRenewsAt]);

  const trialEndsAt = planRenewsAt
    ? new Date(planRenewsAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;
  const trialRemainingMs = planRenewsAt && currentTime != null
    ? Math.max(0, new Date(planRenewsAt).getTime() - currentTime)
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

  return (
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
  );
}
