"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useRef, useEffect } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import {
  getActiveHitRateOption,
  PLAYER_GRAPH_STATS,
} from "@/lib/buildPlayerGraphData";

const PlayerGraphChart = dynamic(() => import("./PlayerGraphChart"), {
  ssr: false,
});

const statOptions = PLAYER_GRAPH_STATS;

const rateColor = (rate) =>
  rate == null
    ? "text-slate-400"
    : rate >= 50
      ? "text-emerald-400"
      : "text-red-400";

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

// ── PERIOD DROPDOWN ──
const PeriodDropdown = ({
  activeOption,
  periodOptions,
  contextOptions,
  selectedNumber,
  activeFilter,
  onNumberChange,
  onFilterChange,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = ({ filter, number }) => {
    if (filter) onFilterChange(activeFilter === filter ? null : filter);
    else {
      onFilterChange(null);
      onNumberChange(number);
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.10] transition-all"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 truncate">
            {activeOption?.label}
          </span>
          {activeOption?.rate != null && (
            <>
              <div className="w-px h-3 bg-white/10 flex-shrink-0" />
              <span
                className={`text-[11px] font-black font-mono flex-shrink-0 ${rateColor(activeOption.rate)}`}
              >
                {activeOption.rate}%
              </span>
            </>
          )}
        </div>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-white/[0.08] bg-[#0D1828] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.04]">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Period
            </span>
          </div>
          {periodOptions.map((opt) => {
            const isActive =
              activeFilter === null &&
              (opt.label === "Full"
                ? selectedNumber === "Full"
                : selectedNumber === opt.number);
            return (
              <button
                key={opt.label}
                onClick={() => handleSelect(opt)}
                className={`w-full flex items-center justify-between px-3 py-2.5 border-b border-white/[0.03] transition-colors
                  ${isActive ? "bg-orange-500/10" : "hover:bg-white/[0.03]"}`}
              >
                <span
                  className={`text-[12px] font-mono font-bold uppercase ${isActive ? "text-orange-400" : "text-slate-300"}`}
                >
                  {opt.label}
                </span>
                <div className="flex items-center gap-2">
                  {opt.rate != null ? (
                    <>
                      <span
                        className={`text-[12px] font-black font-mono ${rateColor(opt.rate)}`}
                      >
                        {opt.rate}%
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {opt.hits}/{opt.hits + opt.misses}
                      </span>
                    </>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400">
                      N/A
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          <div className="px-3 py-1.5 bg-white/[0.02] border-t border-white/[0.06] border-b border-b-white/[0.04]">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Context
            </span>
          </div>
          {contextOptions.map((opt) => {
            const isActive = activeFilter === opt.filter;
            return (
              <button
                key={opt.label}
                onClick={() => handleSelect(opt)}
                className={`w-full flex items-center justify-between px-3 py-2.5 border-b border-white/[0.03] last:border-0 transition-colors
                  ${isActive ? "bg-orange-500/10" : "hover:bg-white/[0.03]"}`}
              >
                <span
                  className={`text-[12px] font-mono font-bold uppercase ${isActive ? "text-orange-400" : "text-slate-300"}`}
                >
                  {opt.label}
                </span>
                <div className="flex items-center gap-2">
                  {opt.rate != null ? (
                    <>
                      <span
                        className={`text-[12px] font-black font-mono ${rateColor(opt.rate)}`}
                      >
                        {opt.rate}%
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {opt.hits}/{opt.hits + opt.misses}
                      </span>
                    </>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400">
                      N/A
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── STAT DROPDOWN ──
const StatDropdown = ({ selectedStat, onStatChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.10] transition-all"
      >
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 truncate">
          {selectedStat}
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-white/[0.08] bg-[#0D1828] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.04]">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Stat
            </span>
          </div>
          {statOptions.map((option) => {
            const isActive = selectedStat === option;
            return (
              <button
                key={option}
                onClick={() => {
                  onStatChange(option);
                  setOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2.5 border-b border-white/[0.03] last:border-0 transition-colors
                  ${isActive ? "bg-orange-500/10" : "hover:bg-white/[0.03]"}`}
              >
                <span
                  className={`text-[12px] font-mono font-bold uppercase ${isActive ? "text-orange-400" : "text-slate-300"}`}
                >
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PlayerGraph = ({
  player,
  playerPrev,
  playerStats,
  opponentAbbr,
  selectedStat,
  onStatChange,
  selectedNumber,
  onNumberChange,
  activeFilter,
  onFilterChange,
  gameInfo,
  onOpenSheet,
  playerLogs,
  statGraphData,
  periodOptions: initialPeriodOptions = [],
  contextOptions: initialContextOptions = [],
}) => {
  const { hasLoaded, isFavorite, toggleFavorite, fetchFavorites } =
    useFavorites({ enabled: false });
  const [shouldRenderChart, setShouldRenderChart] = useState(false);

  useEffect(() => {
    const scheduleChartRender = () => setShouldRenderChart(true);

    if (typeof window === "undefined") return undefined;

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(scheduleChartRender, {
        timeout: 250,
      });

      return () => window.cancelIdleCallback(id);
    }

    const timeoutId = window.setTimeout(scheduleChartRender, 1);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const loadFavorites = () => fetchFavorites();

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(loadFavorites, {
        timeout: 2000,
      });

      return () => window.cancelIdleCallback(id);
    }

    const timeoutId = window.setTimeout(loadFavorites, 1200);
    return () => window.clearTimeout(timeoutId);
  }, [fetchFavorites]);

  const selectedViewKey =
    activeFilter ?? (selectedNumber === "Full" ? "FULL" : `L${selectedNumber}`);

  const selectedStatGraphData =
    statGraphData?.[selectedStat] ?? statGraphData?.points ?? null;
  const chartData =
    selectedStatGraphData?.chartByViewKey?.[selectedViewKey] ?? null;
  const chartPoints = chartData?.points ?? [];
  const betLine = selectedStatGraphData?.betLine ?? null;
  const hitRate =
    selectedStatGraphData?.rateByViewKey?.[selectedViewKey]?.rate ?? null;

  const hitRateColorClass =
    hitRate == null || !chartPoints.length
      ? "text-white"
      : hitRate >= 50
        ? "text-emerald-400"
        : "text-red-400";

  const periodOptions = useMemo(
    () => selectedStatGraphData?.periodOptions ?? initialPeriodOptions,
    [selectedStatGraphData, initialPeriodOptions],
  );
  const contextOptions = useMemo(
    () => selectedStatGraphData?.contextOptions ?? initialContextOptions,
    [selectedStatGraphData, initialContextOptions],
  );
  const allHitRates = useMemo(
    () => [...periodOptions, ...contextOptions],
    [periodOptions, contextOptions],
  );
  const activeHitRateOption = useMemo(
    () =>
      getActiveHitRateOption({
        periodOptions,
        contextOptions,
        selectedNumber,
        activeFilter,
      }),
    [periodOptions, contextOptions, selectedNumber, activeFilter],
  );

  const playerObj = playerStats
    ? {
        player_id: playerStats.playerId,
        player_name: playerStats.playerName,
        team: playerStats.playerTeam,
      }
    : null;

  const isFav =
    hasLoaded && playerObj
      ? isFavorite(playerObj.player_id, selectedStat)
      : false;

  const isPrev = activeFilter === "PREV";
  const hasGamesArray = Array.isArray(playerLogs);
  const hasGames = hasGamesArray && playerLogs.length > 0;
  const hasPrevGames =
    Array.isArray(playerPrev?.games) && playerPrev.games.length > 0;
  const prevDataReceived = playerPrev !== undefined;
  const hasValidArray = isPrev ? prevDataReceived : hasGamesArray;
  const shouldShowChart = isPrev ? hasPrevGames : hasGames;

  const chartContent = !shouldRenderChart ? (
    <div className="w-full h-[300px] rounded-xl border border-white/[0.06] bg-white/[0.02] animate-pulse" />
  ) : (
    <PlayerGraphChart
      points={chartPoints}
      selectedStat={selectedStat}
      betLine={chartData?.betLine ?? betLine}
      yTicks={chartData?.yTicks ?? []}
    />
  );

  return (
    <div className="flex flex-col p-4 gap-4 h-full">
      {/* ── Stat selector — desktop only ── */}
      <div className="hidden lg:flex gap-1.5 overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
        {statOptions.map((option) => (
          <button
            key={option}
            onClick={() => onStatChange(option)}
            className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border transition-all duration-150 font-mono
              ${
                selectedStat === option
                  ? "bg-slate-700 border-slate-500 text-white"
                  : "bg-transparent border-white/6 text-slate-400 hover:text-slate-300 hover:border-white/10"
              }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* ── Mobile dropdowns — hidden on desktop ── */}
      <div className="lg:hidden flex gap-2">
        <PeriodDropdown
          activeOption={activeHitRateOption}
          periodOptions={periodOptions}
          contextOptions={contextOptions}
          selectedNumber={selectedNumber}
          activeFilter={activeFilter}
          onNumberChange={onNumberChange}
          onFilterChange={onFilterChange}
        />
        <StatDropdown selectedStat={selectedStat} onStatChange={onStatChange} />
      </div>

      {/* ── Line stats + Add prop ── */}
      <div className="flex justify-center md:justify-between items-center gap-4 flex-wrap">
        <div className="flex items-baseline gap-1.5">
          <span className="font-black text-2xl text-white font-mono">
            {betLine?.toFixed(1) ?? "—"}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">
            over
          </span>
        </div>
        <div className="h-6 w-px bg-white/6" />
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-black text-2xl font-mono ${hitRateColorClass}`}
          >
            {chartPoints.length && betLine != null ? `${hitRate}%` : "—%"}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">
            hit rate
          </span>
        </div>
        <div className="h-6 w-px bg-white/6" />
        <div className="flex items-baseline gap-1.5">
          <span className="font-black text-2xl text-white font-mono">
            {chartPoints.length}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">
            games
          </span>
        </div>

        {/* Add prop button */}
        {playerObj && (
          <button
            onClick={() =>
              toggleFavorite(playerObj, selectedStat, betLine, gameInfo)
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all
              ${
                isFav
                  ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                  : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:border-white/[0.14]"
              }`}
          >
            {isFav ? (
              <>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polyline
                    points="20 6 9 17 4 12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
                Saved
              </>
            ) : (
              <>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add prop
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Chart ── */}
      <div className="w-full flex-1 min-h-[220px] relative">
        {shouldShowChart ? (
          chartContent
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center justify-center p-6 gap-3 text-center border border-white/[0.06] bg-white/[0.02] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <p className="text-[12px] font-semibold text-slate-400">
                {!hasValidArray
                  ? "Player logs unavailable"
                  : "No stats available"}
              </p>
              <p className="text-[10px] font-mono text-slate-400 max-w-[200px]">
                {!hasValidArray
                  ? "We couldn't load this player's game logs right now"
                  : `This player has no games in ${isPrev ? "the 2024-25 season" : "the current season"}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Hit Rate Cards — desktop only ── */}
      <div className="hidden lg:grid grid-cols-9 gap-1.5">
        {allHitRates.map(({ label, filter, number, rate, hits, misses }) => {
          const isActive = filter
            ? activeFilter === filter
            : activeFilter === null &&
              (label === "Full"
                ? selectedNumber === "Full"
                : selectedNumber === number);
          const rc =
            rate == null
              ? "text-slate-400"
              : rate >= 50
                ? "text-emerald-400"
                : "text-red-400";
          return (
            <button
              key={label}
              onClick={() => {
                if (filter)
                  onFilterChange(activeFilter === filter ? null : filter);
                else {
                  onFilterChange(null);
                  onNumberChange(number);
                }
              }}
              className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border transition-all duration-150
                ${isActive ? "border-orange-500/40 bg-orange-500/10" : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"}`}
            >
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                {label}
              </span>
              <span className={`text-[15px] font-black font-mono ${rc}`}>
                {rate != null ? `${rate}%` : "N/A"}
              </span>
              {rate != null && (
                <span className="text-[8px] font-mono text-slate-400">
                  {hits}/{hits + misses}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerGraph;
