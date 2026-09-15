import Link from "next/link";
import { launchConfig } from "@/config/launch";
import { ALL_FAQS } from "@/lib/faqs";
import PricingLink from "@/components/PricingLink";
import HomePricingSection from "./HomePricingSection";
import DeferredProductShowcase from "./DeferredProductShowcase";
import LandingBelowFold from "./LandingBelowFold";
import PublicAccessButton from "./PublicAccessButton";

const BENEFITS = [
  { number: "01", title: "See the trend, not just the average", text: "Compare L5, L10, L20, season, and head-to-head hit rates without jumping between tabs." },
  { number: "02", title: "Put every line in context", text: "Understand opponent strength, home and away splits, injuries, and recent form before you decide." },
  { number: "03", title: "Research the whole slate faster", text: "Filter by game, team, market, matchup, injury status, and hit rate from one focused workspace." },
];

function PrimaryCta({ className }) {
  if (launchConfig.access.showBetaAccess) {
    return (
      <PublicAccessButton
        className={className}
        requiresBetaCode={launchConfig.access.requiresBetaCode}
      >
        {launchConfig.cta.primary}
      </PublicAccessButton>
    );
  }

  return (
    <PricingLink className={className}>
      {launchConfig.cta.primary}
    </PricingLink>
  );
}

export default function HomeLanding() {
  return (
    <div className="overflow-hidden scroll-smooth bg-[#060b13] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:48px_48px]" />
      <section className="relative mx-auto max-w-[1320px] px-6 pb-20 pt-20 sm:pt-28 lg:pb-28">
        <div className="absolute left-1/2 top-20 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-orange-500/[0.08] blur-[140px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/[0.08] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />Built for the NBA slate</div>
          <h1 className="text-5xl font-black leading-[1.12] tracking-normal sm:text-7xl sm:leading-[1.08] lg:text-[84px]">NBA player props research.<span className="block pb-3 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">See the full picture.</span></h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">Research NBA player props with hit rates, player trends, matchup stats, injuries, and slate filters in one fast dashboard.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"><PrimaryCta className="w-full rounded-xl bg-orange-500 px-7 py-3.5 text-center font-mono text-xs font-black uppercase tracking-widest text-white shadow-[0_0_35px_rgba(249,115,22,.28)] transition hover:bg-orange-400 sm:w-auto" /><PricingLink className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3.5 text-center font-mono text-xs font-bold uppercase tracking-widest text-slate-300 transition hover:border-white/20 hover:text-white sm:w-auto">{launchConfig.cta.secondary}</PricingLink></div>
          {launchConfig.access.showBetaAccess ? <div className="mx-auto mt-6 max-w-xl rounded-xl border border-orange-500/50 bg-orange-500/[0.12] px-5 py-4 text-center"><p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">{launchConfig.betaApplication.title}</p><p className="mt-2 text-sm leading-6 text-slate-300">{launchConfig.betaApplication.description} {launchConfig.betaApplication.perkText}</p></div> : null}
          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-slate-400">No spreadsheets. No tab overload. Just the context that matters.</p>
        </div>
      </section>

      <LandingBelowFold fallback={<LandingBelowFoldSkeleton />}>
      <DeferredProductShowcase />

      <section id="features" className="relative scroll-mt-20 border-y border-white/[0.06] bg-[#09111d]/80 py-24">
        <div className="mx-auto max-w-[1320px] px-6">
          <div className="max-w-2xl"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">One research workflow</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Everything behind the prop line.</h2><p className="mt-5 text-slate-400">Move from a crowded NBA slate to a focused player props view in seconds.</p></div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] md:grid-cols-3">{BENEFITS.map((benefit) => <article key={benefit.number} className="bg-[#0b1421] p-8 lg:p-10"><p className="font-mono text-[10px] font-black text-orange-400">{benefit.number}</p><h3 className="mt-7 text-xl font-black leading-tight">{benefit.title}</h3><p className="mt-4 text-sm leading-6 text-slate-400">{benefit.text}</p></article>)}</div>
          <div className="mt-16 grid items-center gap-10 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent p-7 md:grid-cols-[.8fr_1.2fr] lg:p-12"><div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-orange-400">Three moves. Full context.</p><h3 className="mt-4 text-3xl font-black">From slate to decision without losing the thread.</h3></div><div className="grid gap-3 sm:grid-cols-3">{["Choose a game", "Find a player", "Analyse the prop"].map((step, index) => <div key={step} className="rounded-xl border border-white/[0.07] bg-black/10 p-5"><span className="font-mono text-[9px] text-slate-400">0{index + 1}</span><p className="mt-6 text-sm font-bold">{step}</p></div>)}</div></div>
        </div>
      </section>

      <HomePricingSection />

      <FaqSection />
      <section className="relative px-6 py-24 text-center"><div className="absolute left-1/2 top-1/2 h-52 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[100px]" /><div className="relative"><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-orange-400">Your next slate starts here</p><h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Stop guessing. Start researching.</h2><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><PrimaryCta className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-7 py-3.5 font-mono text-xs font-black uppercase leading-none tracking-widest hover:bg-orange-400" /><PricingLink className="inline-flex items-center justify-center rounded-xl border border-white/10 px-7 py-3.5 font-mono text-xs font-bold uppercase leading-none tracking-widest text-slate-300 hover:border-white/20">{launchConfig.cta.secondary}</PricingLink></div></div></section>
      <footer className="border-t border-white/[0.06]"><div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-5 px-6 py-7"><p className="font-mono text-[10px] text-slate-400">© {new Date().getFullYear()} PropInsight. Research responsibly.</p><div className="flex gap-5 font-mono text-[9px] uppercase tracking-widest text-slate-400"><a href="#features" className="hover:text-slate-300">Features</a><PricingLink className="hover:text-slate-300">Pricing</PricingLink><a href="#faq" className="hover:text-slate-300">FAQ</a><Link href="/privacy" className="hover:text-slate-300">Privacy</Link><Link href="/terms" className="hover:text-slate-300">Terms</Link></div></div></footer>
      </LandingBelowFold>
    </div>
  );
}

function FaqSection() {
  return <section id="faq" className="scroll-mt-20 border-t border-white/[0.06] bg-[#09111d]/75 py-24"><div className="mx-auto max-w-3xl px-6"><div className="text-center"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">FAQ</p><h2 className="mt-4 text-4xl font-black">Good questions. Clear answers.</h2></div><div className="mt-12 space-y-3">{ALL_FAQS.map((faq, index) => <details key={faq.id} className="group rounded-xl border border-white/[0.07] bg-[#0b1421] p-5 open:border-orange-500/20"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-sm font-bold"><span><span className="mr-4 font-mono text-[9px] text-orange-400">0{index + 1}</span>{faq.question}</span><span className="font-mono text-lg font-light text-slate-500 transition group-open:rotate-45">+</span></summary><p className="ml-9 mt-4 max-w-2xl text-sm leading-6 text-slate-400">{faq.answer}</p></details>)}</div></div></section>;
}

function LandingBelowFoldSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading page content" className="bg-[#07101b]">
      <section className="border-t border-white/[0.06] px-6 py-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="h-3 w-32 animate-pulse rounded bg-orange-500/20" />
          <div className="mt-5 h-11 max-w-xl animate-pulse rounded bg-white/[0.09]" />
          <div className="mt-4 h-5 max-w-2xl animate-pulse rounded bg-white/[0.05]" />
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <div className="h-[420px] animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.03]" />
            <div className="h-[420px] animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.03]" />
          </div>
        </div>
      </section>
      <section className="border-y border-white/[0.06] bg-[#09111d]/80 px-6 py-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="h-3 w-36 animate-pulse rounded bg-orange-500/20" />
          <div className="mt-5 h-11 max-w-xl animate-pulse rounded bg-white/[0.09]" />
          <div className="mt-12 grid gap-3 md:grid-cols-3">
            {[0, 1, 2].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.03]" />)}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1320px] px-6 py-20">
        <div className="mx-auto h-10 w-72 animate-pulse rounded bg-white/[0.09]" />
        <div className="mx-auto mt-5 h-5 max-w-xl animate-pulse rounded bg-white/[0.05]" />
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-[470px] animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.03]" />)}
        </div>
      </section>
    </div>
  );
}
