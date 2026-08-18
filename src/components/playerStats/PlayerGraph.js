"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  buildFilteredPlayerGraphData,
  buildTeammateImpactData,
  PLAYER_GRAPH_STATS,
} from "@/lib/buildPlayerGraphData";

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
const MAX_TEAMMATES = 3;
const MINUTE_SLIDER_MAX = 48;

const PlayerGraph = ({
  playerStats,
  selectedStat,
  onStatChange,
  selectedNumber,
  onNumberChange,
  activeFilter,
  onFilterChange,
  gameInfo,
  opponentAbbr: currentOpponentAbbr,
  hasCurrentGames,
  hasPreviousGames,
  hasPlayoffGames: hasPlayoffGamesFlag,
  statGraphData,
  logsAvailable = true,
  teammateImpact = [],
  availabilityGames,
  selectedTeammates,
  selectedTeammateIds,
  onTeammateChange,
  onRemoveTeammate,
  onClearTeammates,
  teammateFilter,
  onTeammateFilterChange,
}) => {
  const [shouldRenderChart, setShouldRenderChart] = useState(false);
  const [rangeMinMinutes, setRangeMinMinutes] = useState(0);
  const [rangeMaxMinutes, setRangeMaxMinutes] = useState(MINUTE_SLIDER_MAX);
  const [advancedPanel, setAdvancedPanel] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [teammateModes, setTeammateModes] = useState({});
  const [teammateModalOpen, setTeammateModalOpen] = useState(false);

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

  const availabilityImpact = selectedTeammates.length
    ? buildTeammateImpactData({
      targetGames: availabilityGames?.current ?? [],
      targetPreviousGames: availabilityGames?.previous ?? [],
      targetPlayoffGames: availabilityGames?.playoffs ?? [],
      teammateGameIdGroups: selectedTeammates.map((entry) => entry.currentGameIds),
      teammatePreviousGameIdGroups: selectedTeammates.map((entry) => entry.previousGameIds),
      player: playerStats,
      opponentAbbr: currentOpponentAbbr ?? null,
    })
    : null;

  const minMinutes = rangeMinMinutes === 0 ? null : rangeMinMinutes;
  const maxMinutes = rangeMaxMinutes === MINUTE_SLIDER_MAX ? null : rangeMaxMinutes;
  const hasMinuteFilter = minMinutes != null || maxMinutes != null;
  const teammateRules = selectedTeammates
    .filter((entry) => teammateModes[String(entry.playerId)])
    .map((entry) => ({
      ...entry,
      mode: teammateModes[String(entry.playerId)],
    }));
  const minuteFilterLabel = !hasMinuteFilter
    ? "Any"
    : maxMinutes == null
      ? `${minMinutes}+`
      : minMinutes == null
        ? `Up to ${maxMinutes}`
        : `${minMinutes}–${maxMinutes}`;
  const teammateFilterLabel = !selectedTeammates.length
    ? "Any"
    : `${selectedTeammates.length} selected${teammateFilter === "WITH" ? " · together" : teammateFilter === "WITHOUT" ? " · without" : ""}`;
  const hasAdvancedFilters = teammateRules.length > 0 || hasMinuteFilter;
  const resetTeammateFilters = () => {
    onClearTeammates();
    setTeammateModes({});
  };
  const resetMinuteFilter = () => {
    setRangeMinMinutes(0);
    setRangeMaxMinutes(MINUTE_SLIDER_MAX);
  };
  const resetAdvancedFilters = () => {
    resetTeammateFilters();
    resetMinuteFilter();
    setAdvancedPanel(null);
  };
  const setTeammateRule = (entry, mode) => {
    const playerId = String(entry.playerId);
    const selectedMode = teammateModes[playerId];
    if (selectedMode === mode) {
      onRemoveTeammate(playerId);
      setTeammateModes((modes) => {
        const next = { ...modes };
        delete next[playerId];
        return next;
      });
      return;
    }
    if (!selectedTeammateIds.includes(playerId) && selectedTeammates.length >= MAX_TEAMMATES) return;
    if (!selectedTeammateIds.includes(playerId)) onTeammateChange(playerId);
    setTeammateModes((modes) => ({ ...modes, [playerId]: mode }));
  };
  const filteredGraphData = teammateRules.length || hasMinuteFilter
    ? buildFilteredPlayerGraphData({
        targetGames: availabilityGames?.current ?? [],
        targetPreviousGames: availabilityGames?.previous ?? [],
        targetPlayoffGames: availabilityGames?.playoffs ?? [],
        teammateGameIdGroups: teammateRules.map((entry) => entry.currentGameIds),
        teammatePreviousGameIdGroups: teammateRules.map((entry) => entry.previousGameIds),
        teammateModes: teammateRules.map((entry) => entry.mode),
        minMinutes,
        maxMinutes,
        betLineByStat: Object.fromEntries(
          Object.entries(statGraphData ?? {}).map(([stat, data]) => [stat, data.betLine]),
        ),
        player: playerStats,
        opponentAbbr: currentOpponentAbbr ?? null,
      })
    : null;

  const baseSelectedViewKey =
    activeFilter ?? (selectedNumber === "Full" ? "FULL" : `L${selectedNumber}`);
  const isTeammateView = Boolean(teammateFilter && availabilityImpact);
  const isFilteredView = Boolean(filteredGraphData);
  const selectedViewKey = baseSelectedViewKey;
  const activeStatGraphData = filteredGraphData?.statGraphData ?? statGraphData;
  const selectedStatGraphData =
    activeStatGraphData?.[selectedStat] ?? activeStatGraphData?.points ?? null;
  const baseStatGraphData = statGraphData?.[selectedStat] ?? statGraphData?.points ?? null;
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

  const periodOptions = selectedStatGraphData?.periodOptions ?? baseStatGraphData?.periodOptions ?? [];
  const contextOptions = selectedStatGraphData?.contextOptions ?? baseStatGraphData?.contextOptions ?? [];
  const allHitRates = [...periodOptions, ...contextOptions];
  const mobileViewOptions = [
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
    ];
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
  const shouldShowChart = isFilteredView
    ? chartPoints.length > 0
    : isPrev
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
    <div className="relative flex h-full w-full min-w-0 flex-col gap-5 p-4 sm:p-5">
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

      <div className="order-5 hidden flex-wrap items-stretch gap-2">
        <button
          type="button"
          onClick={() => setAdvancedPanel(advancedPanel === "TEAMMATES" ? null : "TEAMMATES")}
          className={`flex min-w-[150px] flex-col items-center rounded-lg border px-4 py-2.5 font-mono transition-colors ${advancedPanel === "TEAMMATES" || selectedTeammates.length ? "border-orange-400/35 bg-orange-500/[0.08]" : "border-white/[0.06] bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.04]"}`}
        >
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Teammates</span>
          <span className="mt-0.5 text-[11px] font-black text-slate-200">{teammateFilterLabel}</span>
        </button>
        <button
          type="button"
          onClick={() => setAdvancedPanel(advancedPanel === "MINUTES" ? null : "MINUTES")}
          className={`flex min-w-[150px] flex-col items-center rounded-lg border px-4 py-2.5 font-mono transition-colors ${advancedPanel === "MINUTES" || hasMinuteFilter ? "border-orange-400/35 bg-orange-500/[0.08]" : "border-white/[0.06] bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.04]"}`}
        >
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Minutes</span>
          <span className="mt-0.5 text-[11px] font-black text-slate-200">{minuteFilterLabel}</span>
        </button>
        {hasAdvancedFilters && (
          <button
            type="button"
            onClick={resetAdvancedFilters}
            className="rounded-md px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:bg-white/[0.04] hover:text-orange-200"
          >
            Reset filters
          </button>
        )}
      </div>

      {teammateImpact.length > 0 && advancedPanel === "TEAMMATES" && (
        <div className="order-6 rounded-lg border border-orange-400/20 bg-[#0D1828] p-3 shadow-xl">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-200">
                Teammates
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-400">Select up to three teammates, then choose whether they played together or were all out.</p>
            </div>
            {selectedTeammates.length > 0 && (
              <button
                type="button"
                onClick={resetTeammateFilters}
                className="self-start rounded-md border border-white/[0.08] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300 transition-colors hover:border-orange-400/30 hover:bg-orange-500/[0.06] hover:text-orange-200"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {selectedTeammates.map((entry) => (
              <span
                key={entry.playerId}
                className="inline-flex items-center gap-2 rounded-md border border-orange-400/25 bg-orange-500/10 px-2.5 py-2 font-mono text-[10px] font-bold text-orange-100"
              >
                {entry.playerName}
                <button
                  type="button"
                  onClick={() => onRemoveTeammate(String(entry.playerId))}
                  aria-label={`Remove ${entry.playerName}`}
                  className="-my-1 -mr-1 inline-flex h-6 w-6 items-center justify-center rounded text-sm leading-none text-orange-300/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedTeammates.length < MAX_TEAMMATES ? (
            <label className="min-w-0">
              <span className="sr-only">Add teammate</span>
              <select
                value=""
                onChange={(event) => {
                  onTeammateChange(event.target.value);
                  onTeammateFilterChange(null);
                }}
                className="h-9 w-[180px] max-w-full appearance-none rounded-md border border-white/[0.08] bg-[#0D1828] px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 outline-none transition-colors hover:border-white/15 focus:border-orange-400/40"
              >
                <option value="">+ Add teammate</option>
                {teammateImpact.map((entry) => (
                  <option
                    key={entry.playerId}
                    value={entry.playerId}
                    disabled={selectedTeammateIds.includes(String(entry.playerId))}
                  >
                    {entry.playerName}
                  </option>
                ))}
              </select>
            </label>
            ) : (
              <span className="px-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                3 teammate limit reached
              </span>
            )}
          </div>

          {selectedTeammates.length > 0 && availabilityImpact && (
            <div className="mt-2 grid grid-cols-3 gap-1 border-t border-white/[0.05] pt-2 sm:flex">
              {[
                { key: null, label: "Any games", games: null },
                { key: "WITH", label: "Played together", games: availabilityImpact.withGames },
                { key: "WITHOUT", label: "Without selected", games: availabilityImpact.withoutGames },
              ].map((option) => {
                const isActive = option.key === null
                  ? !teammateFilter
                  : teammateFilter === option.key;
                return (
                  <button
                    key={option.label}
                    onClick={() => onTeammateFilterChange(option.key)}
                    className={`rounded-md border px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive ? "border-orange-400/40 bg-orange-500/10 text-orange-200" : "border-transparent bg-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"}`}
                  >
                    {option.label}{option.games == null ? "" : ` · ${option.games}`}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {advancedPanel === "MINUTES" && (
      <div className="order-7 flex flex-col gap-4 rounded-lg border border-orange-400/20 bg-[#0D1828] p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-200">
            Minutes range
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
            Drag either point to choose which games appear in the graph.
          </p>
          </div>
          {hasMinuteFilter && (
            <button
              type="button"
              onClick={resetMinuteFilter}
              className="rounded-md px-2 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:bg-white/[0.04] hover:text-orange-200"
            >
              Reset
            </button>
          )}
        </div>

        <div className="mx-auto w-full max-w-xl px-2 pb-1">
          <div className="mb-3 flex items-center justify-between font-mono text-[11px] font-black text-slate-200">
            <span>{rangeMinMinutes} min</span>
            <span>{rangeMaxMinutes} min</span>
          </div>
          <div
            className="relative h-2 rounded-full bg-white/[0.08]"
            style={{
              background: `linear-gradient(to right, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.08) ${(rangeMinMinutes / MINUTE_SLIDER_MAX) * 100}%, #f97316 ${(rangeMinMinutes / MINUTE_SLIDER_MAX) * 100}%, #f97316 ${(rangeMaxMinutes / MINUTE_SLIDER_MAX) * 100}%, rgba(255,255,255,0.08) ${(rangeMaxMinutes / MINUTE_SLIDER_MAX) * 100}%, rgba(255,255,255,0.08) 100%)`,
            }}
          >
            <input
              type="range"
              min="0"
              max={MINUTE_SLIDER_MAX}
              value={rangeMinMinutes}
              onChange={(event) => setRangeMinMinutes(Math.min(Number(event.target.value), rangeMaxMinutes))}
              aria-label="Minimum minutes"
              className="pointer-events-none absolute -top-[5px] left-0 z-20 h-3 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-orange-300 [&::-moz-range-thumb]:bg-[#0D1828] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-300 [&::-webkit-slider-thumb]:bg-[#0D1828]"
            />
            <input
              type="range"
              min="0"
              max={MINUTE_SLIDER_MAX}
              value={rangeMaxMinutes}
              onChange={(event) => setRangeMaxMinutes(Math.max(Number(event.target.value), rangeMinMinutes))}
              aria-label="Maximum minutes"
              className="pointer-events-none absolute -top-[5px] left-0 z-10 h-3 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-orange-300 [&::-moz-range-thumb]:bg-[#0D1828] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-300 [&::-webkit-slider-thumb]:bg-[#0D1828]"
            />
          </div>
          <div className="mt-3 flex justify-between font-mono text-[8px] uppercase tracking-wider text-slate-500">
            <span>0</span>
            <span>12</span>
            <span>24</span>
            <span>36</span>
            <span>48</span>
          </div>
        </div>
      </div>
      )}

      {/* ── Line stats + Add prop ── */}
      <div className="order-2 flex items-stretch gap-2">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 sm:px-4">
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
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          className={`flex-shrink-0 rounded-xl border px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${filtersOpen || hasAdvancedFilters ? "border-orange-400/40 bg-orange-500/10 text-orange-200" : "border-white/[0.08] bg-white/[0.02] text-slate-300 hover:border-white/15"}`}
        >
          Filters{hasAdvancedFilters ? ` · ${Number(teammateRules.length > 0) + Number(hasMinuteFilter)}` : ""}
        </button>
      </div>

      {/* ── Chart ── */}
      <div className={`relative order-3 h-[300px] w-full min-w-0 flex-none overflow-hidden rounded-xl lg:h-[360px] ${filtersOpen ? "lg:pr-[330px]" : ""}`}>
        {isFilteredView && chartPoints.length > 0 && chartPoints.length < 5 && (
          <div className="absolute right-2 top-2 z-10 rounded-md border border-amber-400/20 bg-[#0D1828]/95 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-amber-300">
            Small sample · {chartPoints.length} games
          </div>
        )}
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
        {filtersOpen && (
          <aside className="absolute inset-0 z-30 flex flex-col overflow-y-auto border border-orange-400/20 bg-[#0D1828]/[0.98] p-4 shadow-2xl lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[320px]">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-white">Filters</p>
                <p className="mt-0.5 text-[10px] text-slate-400">Refine the games shown in the chart.</p>
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] text-lg text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                ×
              </button>
            </div>

            <section className="order-2 py-4">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300">Teammates</p>
                {teammateRules.length > 0 && (
                  <button type="button" onClick={resetTeammateFilters} className="font-mono text-[8px] font-bold uppercase text-slate-500 hover:text-orange-200">Reset</button>
                )}
              </div>
              {teammateRules.length ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {teammateRules.map((entry) => (
                    <div key={entry.playerId} className="relative min-w-0 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 text-center">
                      <span className={`absolute right-1.5 top-1.5 rounded px-1.5 py-0.5 font-mono text-[7px] font-black uppercase ${entry.mode === "WITH" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>{entry.mode === "WITH" ? "With" : "Out"}</span>
                      <p className="mt-4 truncate text-[10px] font-bold text-slate-100" title={entry.playerName}>{entry.playerName}</p>
                      <p className="mt-1 font-mono text-[9px] text-slate-400">{entry.avgMinutes ?? "—"} min · {entry.avgPoints ?? "—"} pts</p>
                      <button type="button" onClick={() => setTeammateRule(entry, entry.mode)} aria-label={`Remove ${entry.playerName}`} className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded text-sm text-slate-500 hover:bg-white/[0.06] hover:text-white">×</button>
                    </div>
                  ))}
                  {teammateRules.length < MAX_TEAMMATES && (
                    <button type="button" onClick={() => setTeammateModalOpen(true)} aria-label="Add teammate filter" className="flex min-h-[74px] items-center justify-center rounded-lg border border-dashed border-white/[0.1] font-mono text-lg text-slate-500 hover:border-orange-400/25 hover:text-orange-200">+</button>
                  )}
                </div>
              ) : (
                <button type="button" onClick={() => setTeammateModalOpen(true)} className="mt-3 w-full rounded-lg border border-dashed border-white/[0.1] px-3 py-4 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500 hover:border-orange-400/25 hover:text-orange-200">+ Select teammates</button>
              )}
              <p className="mt-2 font-mono text-[8px] text-slate-500">Up to 3 teammate rules.</p>
            </section>

            <section className="order-1 border-b border-white/[0.07] py-4">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300">Minutes range</p>
                {hasMinuteFilter && (
                  <button type="button" onClick={resetMinuteFilter} className="font-mono text-[8px] font-bold uppercase text-slate-500 hover:text-orange-200">Reset</button>
                )}
              </div>
              <div className="mt-4 flex justify-between font-mono text-[11px] font-black text-white">
                <span>{rangeMinMinutes} min</span><span>{rangeMaxMinutes} min</span>
              </div>
              <div className="mt-4 px-1">
                <div className="relative h-2 rounded-full" style={{ background: `linear-gradient(to right, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.08) ${(rangeMinMinutes / MINUTE_SLIDER_MAX) * 100}%, #f97316 ${(rangeMinMinutes / MINUTE_SLIDER_MAX) * 100}%, #f97316 ${(rangeMaxMinutes / MINUTE_SLIDER_MAX) * 100}%, rgba(255,255,255,0.08) ${(rangeMaxMinutes / MINUTE_SLIDER_MAX) * 100}%, rgba(255,255,255,0.08) 100%)` }}>
                  <input type="range" min="0" max={MINUTE_SLIDER_MAX} value={rangeMinMinutes} onChange={(event) => setRangeMinMinutes(Math.min(Number(event.target.value), rangeMaxMinutes))} aria-label="Minimum minutes" className="pointer-events-none absolute -top-[5px] left-0 z-20 h-3 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-orange-300 [&::-moz-range-thumb]:bg-[#0D1828] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-300 [&::-webkit-slider-thumb]:bg-[#0D1828]" />
                  <input type="range" min="0" max={MINUTE_SLIDER_MAX} value={rangeMaxMinutes} onChange={(event) => setRangeMaxMinutes(Math.max(Number(event.target.value), rangeMinMinutes))} aria-label="Maximum minutes" className="pointer-events-none absolute -top-[5px] left-0 z-10 h-3 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-orange-300 [&::-moz-range-thumb]:bg-[#0D1828] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-300 [&::-webkit-slider-thumb]:bg-[#0D1828]" />
                </div>
                <div className="mt-3 flex justify-between font-mono text-[8px] text-slate-500"><span>0</span><span>12</span><span>24</span><span>36</span><span>48</span></div>
              </div>
            </section>

            {hasAdvancedFilters && (
              <button type="button" onClick={resetAdvancedFilters} className="order-3 mt-1 w-full rounded-md border border-white/[0.08] px-3 py-2.5 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-300 hover:border-orange-400/25 hover:text-orange-200">Reset all filters</button>
            )}
          </aside>
        )}
      </div>

      {/* ── Hit Rate Cards — desktop only ── */}
      <div className="order-4 hidden min-w-0 lg:grid lg:grid-cols-5 lg:gap-2 xl:grid-cols-10">
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

      {teammateModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={() => setTeammateModalOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="teammate-modal-title" onMouseDown={(event) => event.stopPropagation()} className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-white/[0.12] bg-[#0A1422] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
              <div>
                <h2 id="teammate-modal-title" className="text-sm font-bold text-white">Filter by Teammate</h2>
                <p className="mt-0.5 text-[10px] text-slate-400">Choose up to three players to include or exclude.</p>
              </div>
              <button type="button" onClick={() => setTeammateModalOpen(false)} aria-label="Close teammate list" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.1] text-xl text-slate-400 hover:bg-white/[0.06] hover:text-white">×</button>
            </div>
            <div className="grid grid-cols-[40px_40px_minmax(0,1fr)_60px_70px_70px] items-center gap-2 border-b border-white/[0.08] bg-white/[0.025] px-4 py-2.5 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500">
              <span className="text-center">W</span><span className="text-center">W/O</span><span>Player</span><span className="text-center">Pos</span><span className="text-right">Min</span><span className="text-right">Pts</span>
            </div>
            <div className="overflow-y-auto">
              {teammateImpact.map((entry) => {
                const playerId = String(entry.playerId);
                const selectedMode = teammateModes[playerId];
                const atLimit = !selectedTeammateIds.includes(playerId) && selectedTeammates.length >= MAX_TEAMMATES;
                return (
                  <div key={entry.playerId} className={`grid grid-cols-[40px_40px_minmax(0,1fr)_60px_70px_70px] items-center gap-2 border-b border-white/[0.05] px-4 py-2.5 ${atLimit ? "opacity-40" : "hover:bg-white/[0.025]"}`}>
                    {[
                      { mode: "WITH", label: "+" },
                      { mode: "WITHOUT", label: "−" },
                    ].map((option) => (
                      <button key={option.mode} type="button" disabled={atLimit} onClick={() => setTeammateRule(entry, option.mode)} aria-label={`${option.mode === "WITH" ? "With" : "Without"} ${entry.playerName}`} className={`mx-auto flex h-8 w-8 items-center justify-center rounded-md border font-mono text-base disabled:cursor-not-allowed ${selectedMode === option.mode ? "border-orange-400/50 bg-orange-500/15 text-orange-200" : "border-white/[0.1] text-slate-500 hover:border-white/25 hover:text-white"}`}>{option.label}</button>
                    ))}
                    <span className="truncate text-[11px] font-semibold text-slate-100">{entry.playerName}</span>
                    <span className="text-center font-mono text-[10px] font-bold text-slate-400">{entry.position}</span>
                    <span className="text-right font-mono text-[10px] text-slate-300">{entry.avgMinutes ?? "—"}</span>
                    <span className="text-right font-mono text-[10px] text-slate-300">{entry.avgPoints ?? "—"}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-3">
              <span className="font-mono text-[9px] text-slate-500">{teammateRules.length}/{MAX_TEAMMATES} selected</span>
              <button type="button" onClick={() => setTeammateModalOpen(false)} className="rounded-lg border border-orange-400/35 bg-orange-500/10 px-5 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-orange-200 hover:bg-orange-500/15">Done</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default PlayerGraph;
