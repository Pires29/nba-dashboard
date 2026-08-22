"use client";

import Link from "next/link";
import PlayerHeadshotImage from "@/components/PlayerHeadshotImage";
import { useState } from "react";
import FavoritePropButton from "./FavoritePropButton";

const INJURY_STYLES = {
  Out: "bg-red-500/15 text-red-400 border-red-500/30",
  "Day-To-Day": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Doubtful: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Questionable: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Probable: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const STAT_LABELS = {
  points: "points",
  assists: "assists",
  rebounds: "rebounds",
  blocks: "blocks",
  turnovers: "turnovers",
  steals: "steals",
  fg3m: "3PM",
  pra: "PRA",
  pa: "PA",
  pr: "PR",
  ra: "RA",
};

const PlayerHeadshot = ({ player }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/[0.06] bg-[#0D1828] md:h-[80px] md:w-[80px] md:rounded-xl">
      <div
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${loaded && !failed ? "opacity-0" : "opacity-100"}`}
      >
        <svg
          viewBox="0 0 80 80"
          fill="none"
          className="h-full w-full text-slate-500"
        >
          <circle cx="40" cy="31" r="16" fill="currentColor" opacity="0.5" />
          <path
            d="M14 80c1-18 10.5-30 26-30s25 12 26 30H14Z"
            fill="currentColor"
            opacity="0.5"
          />
        </svg>
      </div>

      {!failed && (
        <PlayerHeadshotImage
          playerId={player.PLAYER_ID}
          width={80}
          height={80}
          alt={player.PLAYER}
          fetchPriority="high"
          priority
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`relative z-10 h-full w-full object-cover transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
};

const PlayerInfo = ({
  playerData,
  playerStats,
  injuryStatus,
  selectedStat,
  lineSummary,
  gameInfo,
}) => {
  const injuryStyle = injuryStatus
    ? INJURY_STYLES[injuryStatus] || INJURY_STYLES["Out"]
    : null;

  if (!playerData) return <PlayerInfoEmpty />;

  const position = playerData.POSITION || "—";
  const teamAbbr = playerData.TEAM_ABBREVIATION || "—";
  const statLabel = STAT_LABELS[selectedStat] || selectedStat || "stat";
  const summaryItems = [
    { key: statLabel, value: lineSummary?.betLine ?? "—" },
    {
      key: "hit rate",
      value: lineSummary?.hitRate ?? "—%",
      className: lineSummary?.hitRateClassName,
    },
    { key: "games", value: lineSummary?.games ?? 0 },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 p-3 md:gap-x-5 md:gap-y-2 md:p-4">
      <Link
        href="/props"
        aria-label="Back to props"
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition-colors hover:border-orange-500/35 hover:bg-orange-500/10 hover:text-orange-200 md:h-9 md:w-9"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 md:h-4 md:w-4">
          <path
            d="M15 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      {/* Headshot */}
      <div className="relative flex-shrink-0">
        <PlayerHeadshot key={playerData.PLAYER_ID} player={playerData} />
      </div>

      {/* Player identity */}
      <div className="contents">
        <div className="flex flex-wrap items-start justify-between gap-2 md:gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="truncate text-base font-black leading-tight tracking-tight text-white md:text-2xl">
                {playerData.PLAYER}
              </h2>
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400 md:text-[11px]">
                {position} | {teamAbbr}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {injuryStyle && (
                <span
                  className={`px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-widest ${injuryStyle}`}
                >
                  {injuryStatus === "Day-To-Day" ? "DTD" : injuryStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="order-last flex min-w-0 basis-full flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2.5 md:gap-x-4 md:gap-y-3 md:rounded-xl md:px-4 md:py-3">
          {summaryItems.map(({ key, value, className }, index) => (
            <div key={key} className="contents">
              {index > 0 && <div className="h-5 w-px bg-white/6 md:h-6" />}
              <div className="flex items-baseline gap-1 md:gap-1.5">
                <span className={`font-mono text-base font-black md:text-2xl ${className || "text-white"}`}>
                  {value}
                </span>
                <span className="text-[8px] uppercase tracking-widest text-slate-400 md:text-[10px]">
                  {key}
                </span>
              </div>
            </div>
          ))}

          <div className="ml-auto w-auto [&_button]:px-[9px] [&_button]:py-2 [&_button]:text-[9px] md:[&_button]:px-[11px] md:[&_button]:text-[10px]">
            <FavoritePropButton
              playerStats={playerStats}
              selectedStat={selectedStat}
              betLine={lineSummary?.rawBetLine}
              gameInfo={gameInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerInfoSkeleton = () => {
  return (
    <div className="flex animate-pulse items-center gap-5 p-4">
      <div className="h-9 w-9 rounded-lg border border-white/6 bg-white/[0.04]" />
      <div className="h-[80px] w-[80px] rounded-xl border border-white/6 bg-white/[0.04]" />
      <div className="min-w-0 flex-1">
        <div className="mb-3 h-6 w-56 rounded bg-white/[0.06]" />
        <div className="rounded-xl border border-white/6 bg-white/[0.03] px-3 py-3">
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-baseline gap-2">
                <div className="h-6 w-12 rounded bg-white/[0.06]" />
                <div className="h-2 w-12 rounded bg-white/[0.05]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerInfoEmpty = () => {
  return (
    <div className="flex items-center gap-5 p-4">
      <div className="w-[80px] h-[80px] rounded-xl bg-white/[0.03] border border-white/6 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-semibold text-slate-400">
            No player info available
          </p>
          <p className="text-[10px] font-mono text-slate-400 max-w-[220px]">
            We couldn&apos;t retrieve player details at this time
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 rounded-xl border border-white/6 bg-white/[0.03] px-3 py-3 opacity-40">
          {["Over", "Hit Rate", "Games"].map((label) => (
            <div
              key={label}
              className="flex items-baseline gap-1.5"
            >
              <span className="font-mono text-2xl font-black text-slate-400">
                —
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
