"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";

// ✅ ÚNICO import de recharts — só no ficheiro filho
const PlayerContextGraphChart = dynamic(
  () => import("./PlayerContextGraphChart"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[160px] animate-pulse bg-white/[0.02] rounded-xl" />
    ),
  },
);

const STAT_OPTIONS = [
  { key: "fg_pct", label: "FG%", isPercent: true },
  { key: "fg3_pct", label: "3P%", isPercent: true },
  { key: "ft_pct", label: "FT%", isPercent: true },
  { key: "minutes", label: "MIN", isPercent: false },
  { key: "fouls", label: "PF", isPercent: false },
];

const formatValue = (value, isPercent) => {
  if (value == null) return "—";
  if (isPercent) return (value * 100).toFixed(1) + "%";
  return typeof value === "number" ? value.toFixed(0) : value;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

const PlayerContextGraph = ({ player, playerStats }) => {
  const [selectedStat, setSelectedStat] = useState("fg_pct");

  const teamAbbr = playerStats?.playerTeam;
  const hasData = player && player.games?.length > 0;
  const statMeta = STAT_OPTIONS.find((s) => s.key === selectedStat);

  const data = useMemo(() => {
    if (!hasData) return [];
    return player.games.map((game) => {
      const matchup = game.MATCHUP || "";
      const parts = matchup.includes(" @ ")
        ? matchup.split(" @ ")
        : matchup.split(" vs. ");
      const opponent =
        parts[0].trim() === teamAbbr ? parts[1]?.trim() : parts[0]?.trim();
      return {
        date: game.GAME_DATE,
        label: `${opponent || ""}\n${formatDate(game.GAME_DATE)}`,
        opponent,
        minutes: game.MIN,
        fg_pct: game.FG_PCT ?? null,
        fg3_pct: game.FG3_PCT ?? null,
        ft_pct: game.FT_PCT ?? null,
        fouls: game.PF ?? null,
      };
    });
  }, [player, teamAbbr, hasData]);

  const dataFiltered = data.slice(0, 10);

  const avg = useMemo(() => {
    const valid = dataFiltered.filter((d) => d[selectedStat] != null);
    if (!valid.length) return null;
    return valid.reduce((sum, d) => sum + d[selectedStat], 0) / valid.length;
  }, [dataFiltered, selectedStat]);

  const yTicks = useMemo(() => {
    if (!dataFiltered.length) return [];
    const values = dataFiltered.map((d) => d[selectedStat] ?? 0);
    const max = Math.max(...values);
    if (statMeta?.isPercent) return [0, 0.25, 0.5, 0.75, 1.0];
    const step = max <= 10 ? 2 : max <= 30 ? 5 : 10;
    const topTick = (Math.ceil(max / step) + 1) * step;
    const ticks = [];
    for (let i = 0; i <= topTick; i += step) ticks.push(i);
    return ticks;
  }, [dataFiltered, selectedStat, statMeta]);

  if (!hasData) return null;

  return (
    <div className="flex flex-col p-4 gap-4 border-t border-white/[0.05]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-sm bg-slate-600" />
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            Context
          </span>
        </div>

        <div className="lg:hidden relative flex items-center">
          <select
            value={selectedStat}
            onChange={(e) => setSelectedStat(e.target.value)}
            className="text-[10px] font-mono font-bold uppercase bg-transparent border border-white/[0.06] text-white rounded px-2 py-1 pr-6 outline-none appearance-none cursor-pointer"
          >
            {STAT_OPTIONS.map(({ key, label }) => (
              <option key={key} value={key} className="bg-[#0D1828]">
                {label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-2 pointer-events-none"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#475569"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        <div className="hidden lg:flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          {STAT_OPTIONS.map(({ key, label }) => {
            const isActive = selectedStat === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedStat(key)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-150
                  ${isActive ? "bg-slate-600/60 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-black text-xl text-white font-mono">
          {avg != null ? formatValue(avg, statMeta?.isPercent) : "—"}
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest">
          avg L10
        </span>
      </div>

      <div className="w-full h-[160px]">
        <PlayerContextGraphChart
          dataFiltered={dataFiltered}
          selectedStat={selectedStat}
          statMeta={statMeta}
          yTicks={yTicks}
        />
      </div>
    </div>
  );
};

export default PlayerContextGraph;
