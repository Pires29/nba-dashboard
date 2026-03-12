import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] font-sans flex items-center justify-center">
      {/* Grid texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,42,62,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,42,62,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center px-6">
        {/* 404 */}
        <p className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-white/[0.02] leading-none select-none mb-2">
          404
        </p>

        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="1.5" />
            <path
              d="M12 8v4M12 16h.01"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
          Página não encontrada
        </h1>
        <p className="text-slate-500 font-mono text-sm mb-8 max-w-xs mx-auto leading-relaxed">
          A página que procuras não existe ou foi movida.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-[12px] font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
