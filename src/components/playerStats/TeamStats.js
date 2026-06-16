import Image from "next/image";
import { useState } from "react";

const getRankColor = (rank, side) => {
  if (!rank) return "text-slate-400";
  const lowerIsBetter = side === "defense";
  if (lowerIsBetter) {
    if (rank <= 10) return "text-emerald-400";
    if (rank <= 20) return "text-slate-400";
    return "text-red-400";
  }
  if (rank <= 10) return "text-emerald-400";
  if (rank <= 20) return "text-slate-400";
  return "text-red-400";
};

const formatValue = (value) => {
  if (value == null) return "—";
  if (typeof value === "number" && value < 1 && value > 0)
    return (value * 100).toFixed(1) + "%";
  if (typeof value === "number") return value.toFixed(1);
  return value;
};

const formatRank = (rank) => {
  if (!rank) return "—";
  const s = rank.toString();
  if (s.endsWith("1") && rank !== 11) return `${rank}st`;
  if (s.endsWith("2") && rank !== 12) return `${rank}nd`;
  if (s.endsWith("3") && rank !== 13) return `${rank}rd`;
  return `${rank}th`;
};

const OFFENSE_STATS = [
  { key: "Points", label: "Points" },
  { key: "Assists", label: "Assists" },
  { key: "Rebounds", label: "Rebounds" },
  { key: "FG%", label: "Field Goal %" },
  { key: "3P%", label: "3-Point %" },
  { key: "FT%", label: "Free Throw %" },
  { key: "Steals", label: "Steals" },
  { key: "Blocks", label: "Blocks" },
  { key: "Turnovers", label: "Turnovers" },
  { key: "OffReb", label: "Off. Rebounds" },
  { key: "DefReb", label: "Def. Rebounds" },
];

const DEFENSE_STATS = [
  { key: "OppPoints", label: "Points" },
  { key: "OppAssists", label: "Assists" },
  { key: "OppRebounds", label: "Rebounds" },
  { key: "OppFG%", label: "FG%" },
  { key: "OppFG3%", label: "3P%" },
  { key: "OppFT%", label: "FT%" },
  { key: "OppSteals", label: "Steals" },
  { key: "OppBlocks", label: "Blocks" },
  { key: "OppTurnovers", label: "Turnovers" },
  { key: "OppOffReb", label: "Off. Rebounds" },
  { key: "OppDefReb", label: "Def. Rebounds" },
];

const Chevron = ({ open }) => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    className={`flex-shrink-0 transition-transform text-slate-400 ${open ? "rotate-180" : ""}`}
  >
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SideToggle = ({ side, onChange, label }) => (
  <div className="relative">
    <select
      aria-label={label}
      value={side}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none min-w-0 w-full px-2 py-1.5 pr-5 rounded-lg border border-white/[0.06] bg-[#0D1828] items-center text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest focus:outline-none focus:border-orange-500/40 cursor-pointer"
    >
      <option value="offense">Offense</option>
      <option value="defense">Defense</option>
    </select>
    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
      <Chevron open={false} />
    </div>
  </div>
);

const TeamStatsPlaceholder = () => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between mb-2">
      <div className="h-6 w-20 rounded bg-white/10" />
      <div className="h-6 w-20 rounded bg-white/10" />
    </div>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between gap-2">
        <div className="h-3 w-12 rounded bg-white/10" />
        <div className="h-3 w-16 rounded bg-white/[0.06]" />
        <div className="h-3 w-12 rounded bg-white/10" />
      </div>
    ))}
  </div>
);

const TeamStats = ({ homeTeamStats, awayTeamStats }) => {
  const [homeSide, setHomeSide] = useState("offense");
  const [awaySide, setAwaySide] = useState("offense");

  const handleSwap = () => {
    setHomeSide((prev) => (prev === "offense" ? "defense" : "offense"));
    setAwaySide((prev) => (prev === "offense" ? "defense" : "offense"));
  };

  if (!homeTeamStats?.offense || !awayTeamStats?.offense) {
    return (
      <p className="text-slate-400 text-xs text-center py-4">
        Loading team stats…
      </p>
    );
  }

  const homeStats = homeSide === "offense" ? OFFENSE_STATS : DEFENSE_STATS;
  const awayStats = awaySide === "offense" ? OFFENSE_STATS : DEFENSE_STATS;
  const homeData = homeTeamStats[homeSide];
  const awayData = awayTeamStats[awaySide];

  // Usa as stats da home como rows base — se os dois lados forem diferentes mostra as stats do home
  const rows = homeStats;

  return (
    <div className="flex flex-col gap-3">
      {/* Toggles + swap */}
      <div className="flex items-center justify-between gap-2">
        {/* Home logo + toggle */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Image
            src={`https://cdn.nba.com/logos/nba/${homeTeamStats.teamID}/global/L/logo.svg`}
            width={20}
            height={20}
            loading="lazy"
            alt={homeTeamStats.teamName}
            unoptimized
            className="w-5 h-5 min-w-[20px] min-h-[20px] object-contain flex-shrink-0"
          />
          <div className="min-w-0 shrink">
            <SideToggle
              side={homeSide}
              onChange={setHomeSide}
              label={`${homeTeamStats.teamName} stats side`}
            />
          </div>
        </div>

        {/* Swap icon */}
        <button
          aria-label="Swap offense and defense views"
          onClick={handleSwap}
          className="w-7 h-7 rounded-lg border border-white/[0.06] bg-[#0D1828] flex items-center justify-center hover:border-orange-500/30 hover:text-orange-400 text-slate-400 transition-all flex-shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Away toggle + logo */}
        <div className="flex justify-end items-center gap-2 min-w-0 flex-1">
          <div className="min-w-0 shrink">
            <SideToggle
              side={awaySide}
              onChange={setAwaySide}
              label={`${awayTeamStats.teamName} stats side`}
            />
          </div>
          <Image
            src={`https://cdn.nba.com/logos/nba/${awayTeamStats.teamID}/global/L/logo.svg`}
            width={20}
            height={20}
            loading="lazy"
            alt={awayTeamStats.teamName}
            unoptimized
            className="w-5 h-5 min-w-[20px] min-h-[20px] object-contain flex-shrink-0"
          />
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center text-[9px] font-mono text-slate-400 uppercase tracking-widest">
        <div className="flex-1 flex items-center gap-3">
          <span className="w-10">Avg</span>
          <span>Rank</span>
        </div>
        <span className="flex-1 text-center">Stat</span>
        <div className="flex-1 flex items-center gap-3 justify-end">
          <span>Rank</span>
          <span className="w-10 text-right">Avg</span>
        </div>
      </div>

      {/* Stat rows */}
      <div className="flex flex-col">
        {rows.map(({ key, label }, i) => {
          // Away usa as suas próprias stats — se os lados forem diferentes usa o índice para mapear
          const awayKey = awayStats[i]?.key ?? key;
          const awayLabel = awayStats[i]?.label ?? label;

          const homeStat = homeData?.[key];
          const awayStat = awayData?.[awayKey];

          // Label do centro — se os dois lados forem iguais usa o label normal, se forem diferentes mostra os dois
          const centerLabel =
            homeSide === awaySide ? label : `${label} / ${awayLabel}`;

          return (
            <div
              key={key}
              className="flex items-center py-1.5 border-b border-white/[0.04] last:border-0"
            >
              {/* Home */}
              <div className="flex-1 flex items-center gap-3">
                <span className="text-[12px] font-black font-mono text-slate-200 w-10">
                  {formatValue(homeStat?.value)}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold ${getRankColor(homeStat?.rank, homeSide)}`}
                >
                  {formatRank(homeStat?.rank)}
                </span>
              </div>

              {/* Stat label */}
              <span className="flex-1 text-[8px] font-mono text-slate-400 uppercase tracking-wider text-center px-1">
                {label}
              </span>

              {/* Away */}
              <div className="flex-1 flex items-center gap-3 justify-end">
                <span
                  className={`text-[9px] font-mono font-bold ${getRankColor(awayStat?.rank, awaySide)}`}
                >
                  {formatRank(awayStat?.rank)}
                </span>
                <span className="text-[12px] font-black font-mono text-slate-200 w-10 text-right">
                  {formatValue(awayStat?.value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamStats;
