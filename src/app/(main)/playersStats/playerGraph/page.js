"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
  Cell,
} from "recharts";
import UpgradeOverlay from "@/components/UpgradeOverlay";

const statOptions = [
  "points",
  "assists",
  "rebounds",
  "blocks",
  "turnovers",
  "steals",
  "threePointsMade",
  "pra",
  "pa",
  "pr",
  "ra",
];

const numberOfGamesOptions = [5, 10, 20, 30, "Full"];

const CustomTooltip = ({ active, payload, selectedStat }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0D1828] border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono text-slate-300 shadow-xl">
      <p className="text-slate-500 mb-1">{payload[0]?.payload?.date}</p>
      <p className="text-white font-bold">
        {selectedStat}:{" "}
        <span className="text-orange-400">{payload[0]?.value}</span>
      </p>
    </div>
  );
};

const PlayerGraph = ({ player, playerStats, plan }) => {
  const [selectedStat, setSelectedStat] = useState("points");
  const [selectedNumber, setSelectedNumber] = useState(5);

  const maxGames = plan === "pro" ? Infinity : 5;
  const isLimited = plan !== "pro";

  if (!playerStats || !player) return null;

  const data = useMemo(
    () =>
      player.games.map((game) => {
        const points = game.PTS;
        const assists = game.AST;
        const rebounds = game.REB;
        return {
          date: game.GAME_DATE,
          points,
          assists,
          rebounds,
          blocks: game.BLK,
          turnovers: game.TOV,
          steals: game.STL,
          threePointsMade: game.FG3M,
          pra: points + rebounds + assists,
          pa: points + assists,
          pr: points + rebounds,
          ra: rebounds + assists,
        };
      }),
    [player],
  );

  const dataFiltered = useMemo(() => {
    const base = isLimited ? data.slice(0, 5) : data;
    if (selectedNumber === "Full") return base;
    return base.slice(0, selectedNumber);
  }, [data, selectedNumber, isLimited]);

  const stat = playerStats.stats[selectedStat];
  const hitRate = dataFiltered.length
    ? Math.round(
        (dataFiltered.filter((d) => d[selectedStat] >= stat).length /
          dataFiltered.length) *
          100,
      )
    : 0;

  return (
    <div className="flex flex-col p-4 gap-4">
      {/* Stat selector */}
      <div className="flex flex-wrap gap-1.5">
        {statOptions.map((option) => (
          <button
            key={option}
            onClick={() => setSelectedStat(option)}
            className={`
              px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest
              border transition-all duration-150 font-mono
              ${
                selectedStat === option
                  ? "bg-slate-700 border-slate-500 text-white"
                  : "bg-transparent border-white/[0.06] text-slate-600 hover:text-slate-400 hover:border-white/10"
              }
            `}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Line stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-baseline gap-1.5">
          <span className="font-black text-2xl text-white font-mono">
            {stat?.toFixed(1)}
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">
            avg {selectedStat}
          </span>
        </div>
        <div className="h-6 w-px bg-white/[0.06]" />
        <div className="flex items-baseline gap-1.5">
          <span className="font-black text-2xl text-emerald-400 font-mono">
            {hitRate}%
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">
            hit rate
          </span>
        </div>
        <div className="h-6 w-px bg-white/[0.06]" />
        <div className="flex items-baseline gap-1.5">
          <span className="font-black text-2xl text-white font-mono">
            {dataFiltered.length}
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">
            games
          </span>
        </div>
      </div>

      {/* Chart — desfocado para free só quando tenta ver mais de 5 jogos */}
      <div className="w-full">
        {isLimited && selectedNumber !== 5 ? (
          <UpgradeOverlay message="Histórico completo disponível no Pro">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={dataFiltered}
                margin={{ top: 10, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="rgba(255,255,255,0.04)"
                  strokeDasharray="0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 9,
                    fill: "#475569",
                    fontFamily: "monospace",
                  }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v?.slice(5)}
                />
                <YAxis
                  tick={{
                    fontSize: 9,
                    fill: "#475569",
                    fontFamily: "monospace",
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <Bar
                  dataKey={selectedStat}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={32}
                >
                  {dataFiltered.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry[selectedStat] >= stat ? "#22c55e" : "#ef4444"}
                      fillOpacity={entry[selectedStat] >= stat ? 0.85 : 0.6}
                    />
                  ))}
                  <LabelList
                    dataKey={selectedStat}
                    position="top"
                    style={{
                      fontSize: 9,
                      fill: "#94a3b8",
                      fontFamily: "monospace",
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </UpgradeOverlay>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={dataFiltered}
              margin={{ top: 10, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.04)"
                strokeDasharray="0"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "#475569", fontFamily: "monospace" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v?.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#475569", fontFamily: "monospace" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomTooltip selectedStat={selectedStat} />}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <ReferenceLine
                y={stat ?? 0}
                stroke="rgba(148,163,184,0.4)"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <Bar dataKey={selectedStat} radius={[3, 3, 0, 0]} maxBarSize={32}>
                {dataFiltered.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry[selectedStat] >= stat ? "#22c55e" : "#ef4444"}
                    fillOpacity={entry[selectedStat] >= stat ? 0.85 : 0.6}
                  />
                ))}
                <LabelList
                  dataKey={selectedStat}
                  position="top"
                  style={{
                    fontSize: 9,
                    fill: "#94a3b8",
                    fontFamily: "monospace",
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Games filter — sempre funcional, mesmo no free */}
      <div className="flex items-center gap-1.5 justify-end">
        <span className="text-[9px] text-slate-600 uppercase tracking-widest mr-1">
          Last
        </span>
        {numberOfGamesOptions.map((option) => (
          <button
            key={option}
            onClick={() => setSelectedNumber(option)}
            className={`
              px-2.5 py-1 rounded text-[10px] font-bold font-mono
              border transition-all duration-150
              ${
                selectedNumber === option
                  ? "bg-slate-700 border-slate-500 text-white"
                  : "bg-transparent border-white/[0.06] text-slate-600 hover:text-slate-400"
              }
            `}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlayerGraph;
