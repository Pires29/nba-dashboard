"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center px-6">
        {/* 500 */}
        <p className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-white/[0.02] leading-none select-none mb-2">
          500
        </p>

        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v4M12 17h.01"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
          Algo correu mal
        </h1>
        <p className="text-slate-500 font-mono text-sm mb-8 max-w-xs mx-auto leading-relaxed">
          Ocorreu um erro inesperado. Tenta novamente ou volta ao início.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-[12px] font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-[12px] font-mono uppercase tracking-widest transition-all"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
