"use client";

import getGamesSchedule from "@/lib/getGamesSchedule";
import getStandings from "@/lib/getStandings";
import Link from "next/link";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

// ── Placeholder data ──────────────────────────────────────────
const PLACEHOLDER_METRICS = [
  {
    label: "PPG",
    data: [
      { name: "BOS", v: 122 },
      { name: "OKC", v: 119 },
      { name: "MIL", v: 117 },
      { name: "PHX", v: 115 },
      { name: "LAL", v: 114 },
      { name: "GSW", v: 112 },
      { name: "MEM", v: 111 },
      { name: "DEN", v: 110 },
    ],
  },
  {
    label: "APG",
    data: [
      { name: "GSW", v: 31 },
      { name: "BOS", v: 29 },
      { name: "MIL", v: 28 },
      { name: "PHX", v: 27 },
      { name: "OKC", v: 26 },
      { name: "DEN", v: 25 },
      { name: "LAL", v: 24 },
      { name: "MEM", v: 23 },
    ],
  },
  {
    label: "RPG",
    data: [
      { name: "MEM", v: 48 },
      { name: "DEN", v: 46 },
      { name: "LAL", v: 45 },
      { name: "MIL", v: 44 },
      { name: "BOS", v: 43 },
      { name: "OKC", v: 42 },
      { name: "GSW", v: 41 },
      { name: "PHX", v: 40 },
    ],
  },
];

const TOP_SCORERS = [
  { name: "Shai Gilgeous-Alexander", team: "OKC", avg: 32.4, img: null },
  { name: "Giannis Antetokounmpo", team: "MIL", avg: 30.1, img: null },
  { name: "Luka Dončić", team: "LAL", avg: 28.9, img: null },
  { name: "Jayson Tatum", team: "BOS", avg: 27.6, img: null },
  { name: "Anthony Edwards", team: "MIN", avg: 26.8, img: null },
];

const TOP_ASSISTS = [
  { name: "Tyrese Haliburton", team: "IND", avg: 11.2, img: null },
  { name: "LeBron James", team: "LAL", avg: 9.8, img: null },
  { name: "Trae Young", team: "ATL", avg: 9.4, img: null },
  { name: "James Harden", team: "LAC", avg: 8.9, img: null },
  { name: "Nikola Jokić", team: "DEN", avg: 8.7, img: null },
];

const NEWS = [
  {
    title: "Thunder continue dominant run with 12th straight win",
    tag: "GAME RECAP",
    time: "2h ago",
    color: "#f97316",
  },
  {
    title: "Celtics' Tatum posts 40-point triple-double in overtime thriller",
    tag: "PERFORMANCE",
    time: "4h ago",
    color: "#22c55e",
  },
  {
    title: "NBA Trade Deadline: Key moves shaping playoff races",
    tag: "TRADES",
    time: "6h ago",
    color: "#3b82f6",
  },
  {
    title: "Injury report: Key players questionable for weekend slate",
    tag: "INJURIES",
    time: "8h ago",
    color: "#ef4444",
  },
];

// ── Sub-components ─────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-1 h-5 rounded-sm bg-orange-500" />
    <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">
      {children}
    </span>
    <div className="flex-1 h-px bg-white/[0.06]" />
  </div>
);

const Card = ({ children, className = "", accent = "orange" }) => {
  const accentMap = {
    orange: "from-orange-500",
    blue: "from-blue-500",
    emerald: "from-emerald-500",
  };
  return (
    <div
      className={`relative rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#162035] to-[#0F1828] shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-hidden ${className}`}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accentMap[accent]} to-transparent`}
      />
      {children}
    </div>
  );
};

const MetricTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A2235] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[10px] text-slate-500 font-mono mb-1">{label}</p>
      <p className="text-[14px] font-bold text-white font-mono">
        {payload[0].value}
      </p>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────
const HomeDashboard = () => {
  const games = getGamesSchedule();
  const teams = getStandings();

  const teamMap = teams.reduce((acc, t) => {
    acc[t.TeamID] = t.TeamName;
    return acc;
  }, {});

  const displayGames = games.slice(0, 8);

  return (
    <div className="relative">
      {/* Grid texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,42,62,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,42,62,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 py-6 relative z-10 flex flex-col gap-8">
        {/* ── HERO STRIP ── */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-r from-[#122040] via-[#0D1828] to-[#060E1A] p-6">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] text-orange-400 tracking-[0.25em] uppercase mb-1">
                2024–25 Season
              </p>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">
                NBA Dashboard
              </h1>
              <p className="text-slate-500 text-sm mt-1 font-mono">
                Live stats · Game logs · Player props
              </p>
            </div>
            <div className="flex gap-3">
              {["W", "E"].map((conf) => (
                <div
                  key={conf}
                  className="px-4 py-2 rounded-lg bg-[#0D1828] border border-white/[0.06] text-center"
                >
                  <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                    {conf === "W" ? "West" : "East"}
                  </p>
                  <p className="text-lg font-black text-white font-mono mt-0.5">
                    —
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── GAMES ── */}
        <div>
          <SectionLabel>Upcoming Games</SectionLabel>
          <div className="grid grid-cols-4 gap-3">
            {displayGames.map((game, i) => {
              const home = teamMap[game.home_team_id] || "TBD";
              const away = teamMap[game.visitor_team_id] || "TBD";
              return (
                <Link
                  key={i}
                  href={`/playersStats?team1=${home}&team2=${away}`}
                >
                  <Card className="p-4 hover:border-orange-500/30 transition-all duration-200 group cursor-pointer">
                    <p className="font-mono text-[9px] text-slate-600 uppercase tracking-widest mb-3">
                      {game.date}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      {/* Home */}
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <img
                          src={`https://cdn.nba.com/logos/nba/${game.home_team_id}/global/L/logo.svg`}
                          alt={home}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <p className="text-[10px] font-bold text-slate-300 text-center leading-tight">
                          {home.split(" ").pop()}
                        </p>
                      </div>

                      {/* VS */}
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-mono font-black text-[#1E3A5A] tracking-widest">
                          VS
                        </span>
                        <span className="text-[9px] font-mono text-orange-500/70 mt-0.5">
                          8:00 PM
                        </span>
                      </div>

                      {/* Away */}
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <img
                          src={`https://cdn.nba.com/logos/nba/${game.visitor_team_id}/global/L/logo.svg`}
                          alt={away}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <p className="text-[10px] font-bold text-slate-300 text-center leading-tight">
                          {away.split(" ").pop()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 h-px bg-white/[0.04]" />
                    <p className="text-[9px] font-mono text-slate-700 mt-2 text-center group-hover:text-orange-500/50 transition-colors">
                      View matchup →
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── METRICS + RANKINGS ── */}
        <div className="grid grid-cols-[1fr_300px] gap-5">
          {/* Metrics charts */}
          <div className="flex flex-col gap-5">
            <SectionLabel>Team Metrics</SectionLabel>
            <div className="grid grid-cols-3 gap-4">
              {PLACEHOLDER_METRICS.map((metric) => (
                <Card key={metric.label} className="p-4">
                  <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-3">
                    {metric.label} — Top Teams
                  </p>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart
                      data={metric.data}
                      margin={{ top: 4, right: 0, left: -28, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 8,
                          fill: "#475569",
                          fontFamily: "monospace",
                        }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{
                          fontSize: 8,
                          fill: "#475569",
                          fontFamily: "monospace",
                        }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        content={<MetricTooltip />}
                        cursor={{ fill: "rgba(255,255,255,0.02)" }}
                      />
                      <Bar dataKey="v" radius={[3, 3, 0, 0]} maxBarSize={24}>
                        {metric.data.map((_, idx) => (
                          <Cell
                            key={idx}
                            fill="#22c55e"
                            fillOpacity={0.7 - idx * 0.05}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              ))}
            </div>

            {/* News */}
            <SectionLabel>Latest News</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              {NEWS.map((item, i) => (
                <Card
                  key={i}
                  className="p-4 hover:border-white/10 transition-all cursor-pointer group"
                >
                  {/* Placeholder image area */}
                  <div className="w-full h-24 rounded-lg mb-3 bg-[#0D1828] border border-white/[0.04] flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-sm bg-white/10" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider"
                      style={{
                        background: item.color + "22",
                        color: item.color,
                      }}
                    >
                      {item.tag}
                    </span>
                    <span className="text-[9px] font-mono text-slate-700">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[12px] font-semibold text-slate-300 leading-snug group-hover:text-white transition-colors">
                    {item.title}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Rankings sidebar */}
          <div className="flex flex-col gap-5">
            <SectionLabel>Top Scorers</SectionLabel>
            <Card className="p-4">
              <div className="flex flex-col gap-0">
                {TOP_SCORERS.map((p, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 py-2.5 ${i < TOP_SCORERS.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                  >
                    <span className="font-mono text-[10px] text-slate-700 w-4 text-right">
                      {i + 1}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-[#0D1828] border border-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[8px] font-mono text-slate-600">
                        {p.team}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-slate-300 truncate">
                        {p.name}
                      </p>
                      <p className="text-[9px] font-mono text-slate-600">
                        {p.team}
                      </p>
                    </div>
                    <span className="font-mono text-[13px] font-black text-white">
                      {p.avg}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <SectionLabel>Top Assists</SectionLabel>
            <Card accent="blue" className="p-4">
              <div className="flex flex-col gap-0">
                {TOP_ASSISTS.map((p, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 py-2.5 ${i < TOP_ASSISTS.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                  >
                    <span className="font-mono text-[10px] text-slate-700 w-4 text-right">
                      {i + 1}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-[#0D1828] border border-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[8px] font-mono text-slate-600">
                        {p.team}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-slate-300 truncate">
                        {p.name}
                      </p>
                      <p className="text-[9px] font-mono text-slate-600">
                        {p.team}
                      </p>
                    </div>
                    <span className="font-mono text-[13px] font-black text-white">
                      {p.avg}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
