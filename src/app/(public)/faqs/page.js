import Link from "next/link";
import { ALL_FAQS } from "@/lib/faqs";

export default function FaqsPage() {
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

      <div className="max-w-[680px] mx-auto px-6 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-400">
              Support
            </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-4">
            Frequently asked
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              questions
            </span>
          </h1>
          <p className="text-slate-500 font-mono text-sm max-w-sm mx-auto leading-relaxed">
            Everything you need to know about HoopiQ and the PRO plan.
          </p>
        </div>

        {/* FAQs */}
        <div className="flex flex-col gap-3 mb-14">
          {ALL_FAQS.map((faq) => (
            <div
              key={faq.id}
              className="relative rounded-xl border border-white/6 bg-gradient-to-b from-[#162035] to-[#0F1828] p-6 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-orange-500/20 to-transparent" />
              <div className="flex items-start gap-4">
                <div className="w-1 h-5 rounded-sm bg-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-white mb-2">
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

        {/* Bottom CTA */}
        <div className="relative rounded-2xl border border-orange-500/20 bg-gradient-to-r from-[#1a1200] via-[#1a0d00] to-[#0D1828] p-8 text-center overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-orange-400 mb-2">
            Still have questions?
          </p>
          <h2 className="text-xl font-black text-white mb-5">
            Ready to get the edge?
          </h2>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/pricing"
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-mono font-bold text-[11px] uppercase tracking-widest transition-all shadow-[0_0_24px_rgba(249,115,22,0.35)]"
            >
              Get Pro
            </Link>
            <Link
              href="/"
              className="px-6 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-mono text-[11px] uppercase tracking-widest transition-all"
            >
              Back to app
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
