import { useState } from "react";
import Image from "next/image";
import UpgradeOverlay from "@/components/UpgradeOverlay";

const getRankColor = (rank) => {
  if (!rank) return "text-slate-500";
  if (rank <= 5) return "text-emerald-400";
  if (rank <= 15) return "text-slate-300";
  return "text-red-400";
};

const StatsBlock = ({ stats }) => {
  if (!stats) return null;
  return (
    <div className="flex flex-col gap-0.5">
      {Object.entries(stats).map(([key, stat]) => (
        <div
          key={key}
          className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0"
        >
          <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">
            {stat.label || key}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-slate-200 font-mono">
              {typeof stat.value === "number" && stat.value < 1
                ? (stat.value * 100).toFixed(1) + "%"
                : stat.value}
            </span>
            <span
              className={`text-[10px] font-mono font-bold min-w-[28px] text-right ${getRankColor(stat.rank)}`}
            >
              #{stat.rank}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const SideToggle = ({ side, onChange }) => (
  <div className="flex rounded-md overflow-hidden border border-white/[0.06] bg-[#0D1828] mb-3">
    {["offense", "defense"].map((s) => (
      <button
        key={s}
        onClick={() => onChange(s)}
        className={`
          flex-1 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all
          ${side === s ? "bg-white/[0.08] text-slate-200" : "text-slate-600 hover:text-slate-400"}
        `}
      >
        {s}
      </button>
    ))}
  </div>
);

const TeamStatsColumn = ({ teamStats, side, onSideChange }) => {
  if (!teamStats) return null;
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <Image
          src={`https://cdn.nba.com/logos/nba/${teamStats.teamID}/global/L/logo.svg`}
          width={28}
          height={28}
          alt={teamStats.teamName}
          className="opacity-90"
        />
        <span className="text-[11px] font-bold text-slate-300 tracking-tight truncate">
          {teamStats.teamName}
        </span>
      </div>
      <SideToggle side={side} onChange={onSideChange} />
      <StatsBlock stats={teamStats[side]} />
    </div>
  );
};

// Placeholder visual para o blur — imita a estrutura real
const TeamStatsPlaceholder = () => (
  <div className="flex gap-4">
    {[0, 1].map((i) => (
      <div key={i} className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-white/10" />
          <div className="h-3 w-20 rounded bg-white/10" />
        </div>
        <div className="flex gap-1 mb-3">
          <div className="h-6 w-14 rounded bg-white/10" />
          <div className="h-6 w-14 rounded bg-white/10" />
        </div>
        {Array.from({ length: 5 }).map((_, j) => (
          <div key={j} className="flex justify-between mb-2">
            <div className="h-2.5 w-12 rounded bg-white/10" />
            <div className="h-2.5 w-8 rounded bg-white/10" />
          </div>
        ))}
      </div>
    ))}
  </div>
);

const TeamStats = ({ homeTeamStats, awayTeamStats, plan }) => {
  const [team1Side, setTeam1Side] = useState("offense");
  const [team2Side, setTeam2Side] = useState("offense");

  // Free plan — bloqueia completamente
  if (plan !== "pro") {
    return (
      <div className="relative">
        {/* Placeholder desfocado */}
        <div className="blur-sm pointer-events-none select-none opacity-60">
          <TeamStatsPlaceholder />
        </div>

        {/* Overlay centrado */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative rounded-xl border border-orange-500/30 bg-[#0D1828]/90 backdrop-blur-sm p-5 text-center shadow-[0_0_40px_rgba(249,115,22,0.15)] w-[220px]">
            <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-2.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400 mb-1">
              Pro Plan
            </p>
            <p className="text-[11px] font-mono text-slate-400 mb-3 leading-snug">
              Estatísticas de equipa disponíveis no Pro
            </p>
            <a
              href="/pricing"
              className="block w-full py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-[10px] font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_16px_rgba(249,115,22,0.3)]"
            >
              Upgrade →
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!homeTeamStats?.offense || !awayTeamStats?.offense) {
    return (
      <p className="text-slate-600 text-xs text-center py-4">
        Loading team stats…
      </p>
    );
  }

  return (
    <div className="flex gap-4">
      <TeamStatsColumn
        teamStats={homeTeamStats}
        side={team1Side}
        onSideChange={setTeam1Side}
      />
      <div className="w-px bg-white/[0.05] self-stretch" />
      <TeamStatsColumn
        teamStats={awayTeamStats}
        side={team2Side}
        onSideChange={setTeam2Side}
      />
    </div>
  );
};

export default TeamStats;
