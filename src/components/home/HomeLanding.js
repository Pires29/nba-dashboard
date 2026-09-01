import Link from "next/link";
import Image from "next/image";
import { ALL_FAQS } from "@/lib/faqs";
import HomePricingSection from "./HomePricingSection";

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

export default function HomeLanding() {
  return (
    <div className="overflow-hidden scroll-smooth bg-[#060b13] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:48px_48px]" />
      <section className="relative mx-auto max-w-[1240px] px-6 pb-20 pt-20 sm:pt-28 lg:pb-28">
        <div className="absolute left-1/2 top-20 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-orange-500/[0.08] blur-[140px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/[0.08] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />Built for the NBA slate</div>
          <h1 className="text-5xl font-black leading-[1.12] tracking-normal sm:text-7xl sm:leading-[1.08] lg:text-[84px]">Research every prop.<span className="block pb-3 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">See the full picture.</span></h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">Player trends, matchup context, injuries, and hit rates — organised in one fast NBA research dashboard.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"><Link href="/props" className="w-full rounded-xl bg-orange-500 px-7 py-3.5 text-center font-mono text-xs font-black uppercase tracking-widest text-white shadow-[0_0_35px_rgba(249,115,22,.28)] transition hover:bg-orange-400 sm:w-auto">Open Props Table</Link><a href="#pricing" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3.5 text-center font-mono text-xs font-bold uppercase tracking-widest text-slate-300 transition hover:border-white/20 hover:text-white sm:w-auto">Start 7-Day Trial</a></div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-slate-400">No spreadsheets. No tab overload. Just the context that matters.</p>
        </div>
        <ProductPreview />
      </section>

      <section id="features" className="relative scroll-mt-20 border-y border-white/[0.06] bg-[#09111d]/80 py-24">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="max-w-2xl"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">One research workflow</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Everything behind the line.</h2><p className="mt-5 text-slate-400">Move from a crowded slate to a focused player view in seconds.</p></div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] md:grid-cols-3">{BENEFITS.map((benefit) => <article key={benefit.number} className="bg-[#0b1421] p-8 lg:p-10"><p className="font-mono text-[10px] font-black text-orange-400">{benefit.number}</p><h3 className="mt-7 text-xl font-black leading-tight">{benefit.title}</h3><p className="mt-4 text-sm leading-6 text-slate-400">{benefit.text}</p></article>)}</div>
          <div className="mt-16 grid items-center gap-10 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent p-7 md:grid-cols-[.8fr_1.2fr] lg:p-12"><div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-orange-400">Three moves. Full context.</p><h3 className="mt-4 text-3xl font-black">From slate to decision without losing the thread.</h3></div><div className="grid gap-3 sm:grid-cols-3">{["Choose a game", "Find a player", "Analyse the prop"].map((step, index) => <div key={step} className="rounded-xl border border-white/[0.07] bg-black/10 p-5"><span className="font-mono text-[9px] text-slate-400">0{index + 1}</span><p className="mt-6 text-sm font-bold">{step}</p></div>)}</div></div>
        </div>
      </section>

      <HomePricingSection />

      <FaqSection />
      <section className="relative px-6 py-24 text-center"><div className="absolute left-1/2 top-1/2 h-52 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[100px]" /><div className="relative"><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-orange-400">Your next slate starts here</p><h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Stop guessing. Start researching.</h2><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/props" className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-7 py-3.5 font-mono text-xs font-black uppercase leading-none tracking-widest hover:bg-orange-400">Explore NBA Props</Link><a href="#pricing" className="inline-flex items-center justify-center rounded-xl border border-white/10 px-7 py-3.5 font-mono text-xs font-bold uppercase leading-none tracking-widest text-slate-300 hover:border-white/20">Start Free Trial</a></div></div></section>
      <footer className="border-t border-white/[0.06]"><div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-5 px-6 py-7"><p className="font-mono text-[10px] text-slate-400">© {new Date().getFullYear()} PropInsight. Research responsibly.</p><div className="flex gap-5 font-mono text-[9px] uppercase tracking-widest text-slate-400"><a href="#features" className="hover:text-slate-300">Features</a><a href="#pricing" className="hover:text-slate-300">Pricing</a><a href="#faq" className="hover:text-slate-300">FAQ</a><Link href="/privacy" className="hover:text-slate-300">Privacy</Link><Link href="/terms" className="hover:text-slate-300">Terms</Link></div></div></footer>
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
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">Tonight&apos;s board</p>
            <p className="mt-1 text-sm font-black">Player Props <span className="ml-2 text-orange-400">Points</span></p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <span className="rounded-md border border-white/[0.07] px-3 py-1.5 font-mono text-[9px] text-slate-400">All games</span>
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
            <thead className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
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
                    <p className="mt-0.5 font-mono text-[9px] text-slate-400">{row.team} · POINTS</p>
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
          <Image
            src={`https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${row.playerId}.png`}
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
            <span className="text-slate-400">vs</span>
            <span className="text-slate-400">{row.opponent}</span>
            <span className="text-slate-400">·</span>
            <span className="font-bold text-slate-200">Points</span>
          </span>
        </div>
        <div className="flex shrink-0 items-start gap-1.5">
          <div className="text-right">
            <span className="block text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400">Line</span>
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
          <span className="mt-0.5 block text-[9px] font-mono text-slate-400">#{row.rank} allowed</span>
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
            <span className="block text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400">{label}</span>
            <span className="mt-0.5 block text-[12px] font-mono font-black leading-tight text-emerald-400">{value}</span>
            <span className="block min-h-3 text-[8px] font-mono leading-tight text-slate-400">{games}</span>
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

function FaqSection() {
  return <section id="faq" className="scroll-mt-20 border-t border-white/[0.06] bg-[#09111d]/75 py-24"><div className="mx-auto max-w-3xl px-6"><div className="text-center"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">FAQ</p><h2 className="mt-4 text-4xl font-black">Good questions. Clear answers.</h2></div><div className="mt-12 space-y-3">{ALL_FAQS.map((faq, index) => <details key={faq.id} className="group rounded-xl border border-white/[0.07] bg-[#0b1421] p-5 open:border-orange-500/20"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-sm font-bold"><span><span className="mr-4 font-mono text-[9px] text-orange-400">0{index + 1}</span>{faq.question}</span><span className="font-mono text-lg font-light text-slate-500 transition group-open:rotate-45">+</span></summary><p className="ml-9 mt-4 max-w-2xl text-sm leading-6 text-slate-400">{faq.answer}</p></details>)}</div></div></section>;
}
