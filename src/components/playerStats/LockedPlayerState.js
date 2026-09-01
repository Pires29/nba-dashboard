import Link from "next/link";
import PricingLink from "@/components/PricingLink";

const LockedPlayerState = ({ playerName, embedded = false }) => (
  <main className={embedded ? "flex min-h-[520px] items-center justify-center" : "flex min-h-full items-center justify-center bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] px-5 py-16"}>
    <section className={`w-full rounded-2xl border border-orange-500/20 bg-[#0D1828] p-8 text-center shadow-2xl ${embedded ? "h-full" : "max-w-xl"}`}>
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">
        Player not included today
      </p>
      <h1 className="text-2xl font-black text-white">
        {playerName ? `${playerName} is locked on Free` : "No unlocked player in this game"}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
        Free includes the complete analysis for 15 players refreshed every day.
        Upgrade to Pro to open every NBA player without daily limits.
      </p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/props" className="rounded-lg border border-white/10 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/5">
          View today&apos;s 15 players
        </Link>
        <PricingLink className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-400">
          Unlock all players
        </PricingLink>
      </div>
    </section>
  </main>
);

export default LockedPlayerState;
