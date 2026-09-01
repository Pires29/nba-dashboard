import { PRICING_PLANS } from "@/lib/pricingPlans";
import CheckoutButton from "./CheckoutButton";
import ReferralBox from "./ReferralBox";

function Check() {
  return <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10" fill="rgba(249,115,22,.15)" /><path d="m8 12 2.5 2.5L16 9" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function HomePricingSection() {
  return (
    <section id="pricing" className="relative mx-auto max-w-[1120px] scroll-mt-20 px-6 py-24">
      <div className="text-center"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">Simple pricing</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Start free. Unlock every player.</h2><p className="mx-auto mt-5 max-w-xl text-slate-400">Free gives you full analysis for 15 featured players each day. Pro removes the player limit.</p><p className="mt-4 inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">Every option includes the same complete Pro access</p></div>
        <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-3">
          {PRICING_PLANS.map((item) => {
            const featured = item.id === "season";
            return <article key={item.id} className={`relative flex min-h-[470px] flex-col rounded-2xl border p-7 transition sm:p-8 ${featured ? "border-orange-500/60 bg-gradient-to-b from-orange-500/[0.09] to-[#0b1421] shadow-[0_20px_60px_rgba(249,115,22,.12)]" : "border-white/[0.09] bg-[#0b1421]"}`}>
              {featured && <span className="absolute right-6 top-6 rounded-md bg-orange-500 px-2.5 py-1 font-mono text-[8px] font-black uppercase tracking-widest text-white">Best value</span>}
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-orange-400">{item.name}</p>
              <p className="mt-5 min-h-10 text-sm leading-5 text-slate-400">{item.description}</p>
              <div className="mt-7">
                <p className="hidden font-mono text-xs text-slate-400 line-through" data-referral-original-price={item.id}>€{item.price.toFixed(2)}</p>
                <div className="flex items-baseline gap-1"><span className="font-mono text-lg text-slate-400">€</span><span className="text-5xl font-black tracking-tight" data-plan-price={item.id}>{item.price.toFixed(2)}</span><span className="font-mono text-[10px] text-slate-400">/{item.suffix}</span></div>
                <p className="mt-2 min-h-8 font-mono text-[9px] leading-4 text-slate-400">{item.note}</p>
              </div>
              <p className="mt-7 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">Billing details</p>
              <ul className="mt-4 space-y-3 text-[13px] leading-5 text-slate-300">
                {item.details.map((detail) => <li key={detail} className="flex gap-2.5"><Check />{detail}</li>)}
              </ul>
              <div className="mt-auto pt-8">
                <CheckoutButton billing={item.id} featured={featured} />
              </div>
            </article>;
          })}
        </div>
        <ReferralBox />
        <p className="mt-4 text-center font-mono text-[9px] text-slate-400">Secure checkout via Stripe · Cancel anytime</p>
    </section>
  );
}
