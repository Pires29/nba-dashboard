"use client";

import Link from "next/link";

export default function PlayerStatsError({ reset }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <section className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-[#0D1828] p-7 text-center">
        <h1 className="text-xl font-black text-white">Player stats could not be loaded</h1>
        <p className="mt-2 text-sm text-slate-300">The player data is temporarily unavailable. Try again or return to Props.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={reset} className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white">Try again</button>
          <Link href="/props" className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-200">Back to Props</Link>
        </div>
      </section>
    </div>
  );
}
