"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useEffect } from "react";
import { PLAYER_GRAPH_STATS } from "@/lib/buildPlayerGraphData";

const PlayerGraphChart = dynamic(() => import("./PlayerGraphChart"), {
  ssr: false,
});

const FavoritePropButton = dynamic(() => import("./FavoritePropButton"), {
  ssr: false,
  loading: () => (
    <div className="h-[34px] w-[98px] rounded-lg border border-white/[0.08] bg-white/[0.03]" />
  ),
});

const statOptions = PLAYER_GRAPH_STATS;

const PlayerGraph = ({
  playerStats,
  selectedStat,
  onStatChange,
  selectedNumber,
  onNumberChange,
  activeFilter,
  onFilterChange,
  gameInfo,
  hasCurrentGames,
  hasPreviousGames,
  hasPlayoffGames: hasPlayoffGamesFlag,
  statGraphData,
  logsAvailable = true,
}) => {
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
    () => selectedStatGraphData?.periodOptions ?? [],
    [selectedStatGraphData],
  );
  const contextOptions = useMemo(
    () => selectedStatGraphData?.contextOptions ?? [],
    [selectedStatGraphData],
  );
  const allHitRates = useMemo(
    () => [...periodOptions, ...contextOptions],
    [periodOptions, contextOptions],
  );
  const mobileViewOptions = useMemo(
    () => [
      ...periodOptions.map((opt) => ({
        value: opt.label === "Full" ? "period:Full" : `period:${opt.number}`,
        label:
          opt.rate != null
            ? `${opt.label} · ${opt.rate}% · ${opt.hits}/${opt.hits + opt.misses}`
            : `${opt.label} · N/A`,
      })),
      ...contextOptions.map((opt) => ({
        value: `filter:${opt.filter}`,
        label:
          opt.rate != null
            ? `${opt.label} · ${opt.rate}% · ${opt.hits}/${opt.hits + opt.misses}`
            : `${opt.label} · N/A`,
      })),
    ],
    [periodOptions, contextOptions],
  );
  const mobileViewValue =
    activeFilter != null
      ? `filter:${activeFilter}`
      : selectedNumber === "Full"
        ? "period:Full"
        : `period:${selectedNumber}`;

  const isPrev = activeFilter === "PREV";
  const isPlayoffs = activeFilter === "PLAYOFFS";
  const hasGames = Boolean(hasCurrentGames);
  const hasPrevGames = Boolean(hasPreviousGames);
  const hasPlayoffGames = Boolean(hasPlayoffGamesFlag);
  const prevDataReceived = hasPreviousGames !== undefined;
  const playoffsDataReceived = hasPlayoffGamesFlag !== undefined;
  const hasValidArray = logsAvailable && (isPrev
    ? prevDataReceived
    : isPlayoffs
      ? playoffsDataReceived
      : hasCurrentGames !== undefined);
  const shouldShowChart = isPrev
    ? hasPrevGames
    : isPlayoffs
      ? hasPlayoffGames
      : hasGames;

  const chartContent = !shouldRenderChart ? (
    <div className="h-full w-full rounded-xl border border-white/[0.06] bg-white/[0.02] animate-pulse" />
  ) : (
    <PlayerGraphChart
      points={chartPoints}
      selectedStat={selectedStat}
      betLine={chartData?.betLine ?? betLine}
      yTicks={chartData?.yTicks ?? []}
    />
  );

  return (
    <div className="flex h-full w-full min-w-0 flex-col gap-5 p-4 sm:p-5">
      {/* ── Stat selector — desktop only ── */}
      <div className="hidden lg:grid grid-cols-6 gap-2 xl:grid-cols-11">
        {statOptions.map((option) => (
          <button
            key={option}
            onClick={() => onStatChange(option)}
            className={`min-w-0 rounded-lg border px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-150 font-mono
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
        <label className="flex-1 min-w-0">
          <span className="sr-only">Select period</span>
          <select
            value={mobileViewValue}
            onChange={(event) => {
              const value = event.target.value;

              if (value.startsWith("filter:")) {
                onFilterChange(value.slice("filter:".length));
                return;
              }

              const nextNumber = value.slice("period:".length);
              onFilterChange(null);
              onNumberChange(nextNumber === "Full" ? "Full" : Number(nextNumber));
            }}
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-widest text-slate-300"
          >
            {mobileViewOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 min-w-0">
          <span className="sr-only">Select stat</span>
          <select
            value={selectedStat}
            onChange={(event) => onStatChange(event.target.value)}
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-widest text-slate-300"
          >
            {statOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* ── Line stats + Add prop ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 sm:px-4">
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

        <div className="w-full sm:ml-auto sm:w-auto">
          <FavoritePropButton
            playerStats={playerStats}
            selectedStat={selectedStat}
            betLine={betLine}
            gameInfo={gameInfo}
          />
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="relative h-[300px] w-full min-w-0 flex-none lg:h-auto lg:min-h-[300px] lg:flex-1">
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
                  : `This player has no games in ${isPrev ? "the 2024-25 season" : isPlayoffs ? "the current playoffs" : "the current season"}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Hit Rate Cards — desktop only ── */}
      <div className="hidden min-w-0 lg:grid lg:grid-cols-5 lg:gap-2 xl:grid-cols-10">
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
              className={`flex min-w-0 flex-col items-center gap-0.5 rounded-lg border px-1 py-2 transition-all duration-150
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
