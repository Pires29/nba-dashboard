"use client";

import Link from "next/link";

export default function UpgradeOverlay({
  children,
  message = "Disponível no plano Pro",
}) {
  return (
    <div className="relative w-full h-full">
      {/* Conteúdo desfocado */}
      <div className="w-full h-full blur-sm pointer-events-none select-none opacity-60">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative rounded-xl border border-orange-500/30 bg-[#0D1828]/90 backdrop-blur-sm p-6 text-center shadow-[0_0_40px_rgba(249,115,22,0.15)] max-w-[240px] w-full">
          {/* Lock icon */}
          <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                stroke="#f97316"
                strokeWidth="2"
              />
              <path
                d="M7 11V7a5 5 0 0110 0v4"
                stroke="#f97316"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-orange-400 mb-1">
            Pro Plan
          </p>
          <p className="text-[12px] font-mono text-slate-400 mb-4 leading-snug">
            {message}
          </p>

          <Link
            href="/pricing"
            className="block w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-[11px] font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_16px_rgba(249,115,22,0.3)] hover:shadow-[0_0_24px_rgba(249,115,22,0.5)]"
          >
            Upgrade →
          </Link>
        </div>
      </div>
    </div>
  );
}
