"use client";

import {
  useMemo,
  useState,
  useCallback,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import Image from "next/image";
import Link from "next/link";
import PropsFilterDropdown from "./PropsFilterDropdown";
import PropsResultsTable from "./PropsResultsTable";
import {
  INITIAL_VISIBLE_ROWS,
  INJURY_DOT,
  INJURY_STYLES,
  PERIOD_LABELS,
  PERIODS,
  STAT_LABELS,
  STATS,
  isHitRateFilterActive,
  serializeHitRates,
  serializeList,
} from "./propsConfig";

const clampHitRateInput = (value) => {
  if (value === "") return "";

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "";

  return String(Math.min(100, Math.max(0, numberValue)));
};

const normalizeHitRateFilter = (filter) => {
  if (!filter) return filter;

  const min = clampHitRateInput(filter.min);
  const max = clampHitRateInput(filter.max);

  if (min === "" || max === "") {
    return { ...filter, min, max };
  }

  const minValue = Number(min);
  const maxValue = Number(max);

  if (minValue <= maxValue) {
    return { ...filter, min, max };
  }

  return { ...filter, min: max, max: min };
};

const DEFAULT_FILTERS = {
  stat: "points",
  sort: "L5",
  dir: "desc",
};

const MANAGED_QUERY_KEYS = [
  "stat",
  "sort",
  "sortPeriod",
  "dir",
  "sortDirection",
  "games",
  "game",
  "matchup",
  "hr",
  "hitRates",
  "hide",
  "injury",
  "q",
  "search",
];

const MATCHUP_VALUE_TO_CODE = {
  favorable: "f",
  neutral: "n",
  unfavorable: "u",
};

const INJURY_VALUE_TO_CODE = {
  Out: "out",
  "Day-To-Day": "dtd",
  Doubtful: "doubtful",
  Questionable: "q",
};

const serializeWithMap = (items, map) =>
  serializeList(items.map((item) => map[item] ?? item));

export default function PropsTable({
  basePath = "/props",
  enrichedProps,
  standings,
  schedule,
  injuries,
  totalPropsCount,
  isFreePlan = false,
  dataStatus,
  initialFilters,
}) {
  const { hasLoaded: favoritesLoaded, isFavorite, toggleFavorite } = useFavorites();

  const [selectedStat, setSelectedStat] = useState(initialFilters.selectedStat);
  const [sortPeriod, setSortPeriod] = useState(initialFilters.sortPeriod);
  const [sortDirection, setSortDirection] = useState(
    initialFilters.sortDirection,
  );
  const [filterGame, setFilterGame] = useState(initialFilters.filterGame);
  const [draftFilterGame, setDraftFilterGame] = useState(
    initialFilters.filterGame,
  );
  const [filterMatchup, setFilterMatchup] = useState(
    initialFilters.filterMatchup,
  );
  const [draftFilterMatchup, setDraftFilterMatchup] = useState(
    initialFilters.filterMatchup,
  );
  const [filterHitRates, setFilterHitRates] = useState(
    initialFilters.filterHitRates,
  );
  const [draftFilterHitRates, setDraftFilterHitRates] = useState(
    initialFilters.filterHitRates,
  );
  const [filterInjury, setFilterInjury] = useState(initialFilters.filterInjury);
  const [draftFilterInjury, setDraftFilterInjury] = useState(
    initialFilters.filterInjury,
  );
  const [search, setSearch] = useState(initialFilters.search);
  const [visibleRows, setVisibleRows] = useState(INITIAL_VISIBLE_ROWS);
  const [isUpdating, startTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();

  const updateUrl = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      MANAGED_QUERY_KEYS.forEach((key) => params.delete(key));
      const nextState = {
        stat: selectedStat,
        sort: sortPeriod,
        dir: sortDirection,
        games: filterGame,
        matchup: filterMatchup,
        hr: serializeHitRates(filterHitRates),
        hide: filterInjury,
        q: search,
        ...updates,
      };

      Object.entries(nextState).forEach(([key, value]) => {
        if (
          (key === "stat" && value === DEFAULT_FILTERS.stat) ||
          (key === "sort" && value === DEFAULT_FILTERS.sort) ||
          (key === "dir" && value === DEFAULT_FILTERS.dir)
        ) {
          return;
        }

        if (
          value == null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          params.delete(key);
          return;
        }

        if (key === "matchup") {
          params.set(key, serializeWithMap(value, MATCHUP_VALUE_TO_CODE));
          return;
        }

        if (key === "hide") {
          params.set(key, serializeWithMap(value, INJURY_VALUE_TO_CODE));
          return;
        }

        params.set(key, Array.isArray(value) ? serializeList(value) : value);
      });

      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${basePath}?${query}` : basePath, {
          scroll: false,
        });
      });
    },
    [
      basePath,
      filterGame,
      filterHitRates,
      filterInjury,
      filterMatchup,
      router,
      search,
      searchParams,
      selectedStat,
      startTransition,
      sortDirection,
      sortPeriod,
    ],
  );

  const teamNameMap = useMemo(() => standings, [standings]);

  const injuryMap = useMemo(() => {
    const map = {};
    injuries.forEach(({ name, status }) => {
      if (name) map[name] = status;
    });
    return map;
  }, [injuries]);

  const activeHitRateFilters = useMemo(
    () => filterHitRates.filter(isHitRateFilterActive),
    [filterHitRates],
  );
  const hitRateActive = activeHitRateFilters.length > 0;
  const matchupActive = filterMatchup.length > 0;
  const gameActive = filterGame.length > 0;
  const injuryActive = filterInjury.length > 0;
  const getGameLabel = useCallback(
    (gameKey) => {
      const [homeId, awayId] = gameKey.split("-").map(Number);
      const home = teamNameMap[homeId]?.split(" ").pop() || "?";
      const away = teamNameMap[awayId]?.split(" ").pop() || "?";
      return `${home} vs ${away}`;
    },
    [teamNameMap],
  );
  const gameFilterLabel = useMemo(() => {
    if (filterGame.length === 0) return "Game";
    if (filterGame.length === 1) return getGameLabel(filterGame[0]);
    return `Games (${filterGame.length})`;
  }, [filterGame, getGameLabel]);
  const clearAllFilters = () => {
    setSelectedStat("points");
    setSortPeriod("L5");
    setSortDirection("desc");
    setFilterGame([]);
    setDraftFilterGame([]);
    setFilterMatchup([]);
    setDraftFilterMatchup([]);
    setFilterHitRates([]);
    setDraftFilterHitRates([]);
    setFilterInjury([]);
    setDraftFilterInjury([]);
    setSearch("");
    updateUrl({
      stat: "points",
      sort: "L5",
      dir: "desc",
      games: [],
      matchup: [],
      hr: "",
      hide: [],
      q: "",
    });
  };

  const addHitRateFilter = () => {
    const usedPeriods = draftFilterHitRates.map((f) => f.period);
    const available = PERIODS.find((p) => !usedPeriods.includes(p));
    if (!available) return;
    const next = [
      ...draftFilterHitRates,
      { period: available, min: "", max: "" },
    ];
    setDraftFilterHitRates(next);
  };

  const updateHitRateFilter = (index, field, value) => {
    const nextValue =
      field === "min" || field === "max"
        ? clampHitRateInput(value)
        : value;
    const next = draftFilterHitRates.map((f, i) =>
      i === index ? { ...f, [field]: nextValue } : f,
    );
    setDraftFilterHitRates(next);
  };

  const normalizeDraftHitRateFilter = (index) => {
    const next = draftFilterHitRates.map((filter, filterIndex) =>
      filterIndex === index ? normalizeHitRateFilter(filter) : filter,
    );
    setDraftFilterHitRates(next);
  };

  const removeHitRateFilter = (index) => {
    const next = draftFilterHitRates.filter((_, i) => i !== index);
    setDraftFilterHitRates(next);
  };

  const activeFilterChips = useMemo(() => {
    const parts = [];
    if (selectedStat !== "points") {
      parts.push({
        key: "stat",
        label: `Stat: ${selectedStat}`,
        onRemove: () => {
          setSelectedStat("points");
          updateUrl({ stat: "points" });
        },
      });
    }
    if (activeHitRateFilters.length > 0) {
      activeHitRateFilters.forEach((f, index) => {
        parts.push({
          key: `hit-rate-${f.period}-${index}`,
          label: `${PERIOD_LABELS[f.period]} HR: ${f.min || "0"}–${f.max || "100"}%`,
          onRemove: () => {
            const next = filterHitRates.filter((filter) => filter !== f);
            setFilterHitRates(next);
            setDraftFilterHitRates(next);
            updateUrl({ hr: serializeHitRates(next) });
          },
        });
      });
    }
    if (filterMatchup.length > 0)
      parts.push({
        key: "matchup",
        label: `Matchup: ${filterMatchup.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")}`,
        onRemove: () => {
          setFilterMatchup([]);
          setDraftFilterMatchup([]);
          updateUrl({ matchup: "" });
        },
      });
    if (filterGame.length > 0)
      parts.push({
        key: "game",
        label: `Game: ${filterGame.length === 1 ? getGameLabel(filterGame[0]) : `${filterGame.length} games`}`,
        onRemove: () => {
          setFilterGame([]);
          setDraftFilterGame([]);
          updateUrl({ games: [] });
        },
      });
    if (filterInjury.length > 0)
      parts.push({
        key: "injury",
        label: `Hiding: ${filterInjury.map((s) => (s === "Day-To-Day" ? "DTD" : s)).join(", ")}`,
        onRemove: () => {
          setFilterInjury([]);
          setDraftFilterInjury([]);
          updateUrl({ hide: [] });
        },
      });
    return parts;
  }, [
    selectedStat,
    activeHitRateFilters,
    filterHitRates,
    filterMatchup,
    filterGame,
    getGameLabel,
    filterInjury,
    updateUrl,
  ]);
  const hasActiveFilters =
    activeFilterChips.length > 0 || search !== "" || sortPeriod !== "L5";
  const isStale = dataStatus?.isStale ?? false;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] font-sans overflow-hidden min-h-0">
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,42,62,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,42,62,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col min-h-0 flex-1 max-w-[1400px] mx-auto w-full px-3 py-4 sm:px-6 sm:py-5 gap-4">
        {/* Header */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-1 h-5 rounded-sm bg-orange-500" />
          <h1 className="font-mono text-base font-black uppercase tracking-widest text-white">
            Props
          </h1>
          <span className="rounded border border-white/[0.06] px-2.5 py-1 text-[11px] font-mono text-slate-500">
            {enrichedProps.length} props
          </span>
          <span
            aria-live="polite"
            className={`text-[10px] font-mono text-orange-300 transition-opacity ${isUpdating ? "opacity-100" : "opacity-0"}`}
          >
            Updating…
          </span>
          {(isStale || dataStatus?.source === "local" || dataStatus?.source === "qa") && (
            <span className={`text-[10px] font-mono ${isStale || dataStatus?.source === "local" ? "text-amber-300" : "text-slate-400"}`}>
              {dataStatus?.source === "qa" ? "QA data" : dataStatus?.source === "local" ? "Local fallback" : "Stale data"}
            </span>
          )}
          {isFreePlan && (
            <Link
              href="/pricing"
              className="ml-auto hidden items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1.5 transition-all hover:border-orange-500/50 hover:bg-orange-500/20 sm:flex"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-[10px] font-mono text-slate-400">
                Free plan: 15 players/day
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400">
                Upgrade
              </span>
            </Link>
          )}
        </div>

        {isFreePlan && (
          <div
            className="flex items-center gap-2 rounded-lg border border-orange-500/25 bg-orange-500/10 px-3 py-2.5 sm:hidden"
          >
            <svg
              className="shrink-0"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f97316"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="min-w-0 text-[11px] font-mono font-medium text-slate-300">
              Upgrade to see every player
            </span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-4 flex-shrink-0">
          <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <label className="relative w-full lg:w-[320px]">
              <span className="sr-only">Search players</span>
              <input
                type="search"
                placeholder="Search player..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => {
                  if (search !== initialFilters.search) {
                    updateUrl({ q: search });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                className="search-with-custom-clear min-h-10 w-full rounded-lg border border-white/[0.08] bg-[#0D1828] px-4 py-2.5 pr-10 text-[13px] font-mono text-slate-200 shadow-inner shadow-black/10 placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear player search"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSearch("");
                    updateUrl({ q: "" });
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-base leading-none text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                >
                  ×
                </button>
              )}
            </label>

            <div className="compact-horizontal-scrollbar mobile-visible-horizontal-scrollbar flex w-full flex-nowrap items-center justify-start gap-2 overflow-x-auto px-1 pb-2 pt-1 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 sm:pt-0 lg:ml-auto lg:w-auto lg:justify-end">
            <PropsFilterDropdown
              accessibleLabel="Statistic"
              label={STAT_LABELS[selectedStat]}
              active={false}
            >
              <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-600">
                Select Stat
              </p>
              <div className="grid grid-cols-3 gap-1">
                {STATS.map((stat) => (
                  <button
                    type="button"
                    key={stat}
                    onClick={() => updateUrl({ stat })}
                    aria-pressed={selectedStat === stat}
                    className={`rounded-lg border px-3 py-2 text-left text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${selectedStat === stat ? "border-orange-500/30 bg-orange-500/10 text-orange-400" : "border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"}`}
                  >
                    {STAT_LABELS[stat]}
                  </button>
                ))}
              </div>
            </PropsFilterDropdown>

            <PropsFilterDropdown
              accessibleLabel="Game"
              panelClassName="w-[min(340px,calc(100vw-24px))]"
              label={gameFilterLabel}
              active={gameActive}
              onOpenChange={(open) => {
                if (open) setDraftFilterGame(filterGame);
              }}
            >
              {(closeDropdown) => (
                <>
                  <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2">
                    Select Games
                  </p>
                  <div className="max-h-72 overflow-y-auto pr-1">
                    <div className="flex flex-col gap-1">
                      {schedule.map((game) => {
                        const key = `${game.home_team_id}-${game.visitor_team_id}`;
                        const home =
                          teamNameMap[game.home_team_id]?.split(" ").pop() ||
                          game.home_team_id;
                        const away =
                          teamNameMap[game.visitor_team_id]?.split(" ").pop() ||
                          game.visitor_team_id;
                        const isActive = draftFilterGame.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              const next = isActive
                                ? draftFilterGame.filter((gameKey) => gameKey !== key)
                                : [...draftFilterGame, key];
                              setDraftFilterGame(next);
                            }}
                            aria-pressed={isActive}
                            className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-[11px] font-mono transition-all ${isActive ? "border-orange-500/30 bg-orange-500/10 text-orange-400" : "border-transparent text-slate-400 hover:bg-white/[0.04]"}`}
                          >
                            <span
                              aria-hidden="true"
                              className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${isActive ? "border-orange-400 bg-orange-500/20" : "border-white/10"}`}
                            >
                              {isActive && (
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M5 12l5 5L20 7"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </span>
                            <Image
                              src={`https://cdn.nba.com/logos/nba/${game.home_team_id}/global/L/logo.svg`}
                              alt=""
                              width={16}
                              height={16}
                              unoptimized
                              className="w-4 h-4 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.visibility = "hidden";
                              }}
                            />
                            <span className="font-bold">{home}</span>
                            <span className="text-slate-600 text-[9px]">vs</span>
                            <Image
                              src={`https://cdn.nba.com/logos/nba/${game.visitor_team_id}/global/L/logo.svg`}
                              alt=""
                              width={16}
                              height={16}
                              unoptimized
                              className="w-4 h-4 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.visibility = "hidden";
                              }}
                            />
                            <span className="font-bold">{away}</span>
                            <span className="ml-auto whitespace-nowrap text-[9px] text-slate-600">
                              {game.status}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterGame(draftFilterGame);
                      updateUrl({ games: draftFilterGame });
                      closeDropdown();
                    }}
                    className="mt-3 flex w-full items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-[10px] font-mono font-bold text-orange-400 transition-all hover:bg-orange-500/15"
                  >
                    Apply game filters
                  </button>
                </>
              )}
            </PropsFilterDropdown>

            <PropsFilterDropdown
              accessibleLabel="Hit rate"
              panelClassName="w-[min(360px,calc(100vw-24px))]"
              label={
                hitRateActive
                  ? `HR (${activeHitRateFilters.length} filter${activeHitRateFilters.length > 1 ? "s" : ""})`
                  : "Hit Rate"
              }
              active={hitRateActive}
              onOpenChange={(open) => {
                if (open) setDraftFilterHitRates(filterHitRates);
              }}
            >
              {(closeDropdown) => (
                <>
                  <p className="text-[10px] font-mono font-bold text-white mb-3">
                    Hit Rate Filters
                  </p>
                  {draftFilterHitRates.map((f, index) => (
                    <div
                      key={index}
                      className="mb-3 p-2 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-1">
                          {PERIODS.map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() =>
                                updateHitRateFilter(index, "period", p)
                              }
                              className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all ${f.period === p ? "bg-white/10 text-white" : "text-slate-600 hover:text-slate-400"}`}
                            >
                              {PERIOD_LABELS[p]}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeHitRateFilter(index)}
                          className="w-4 h-4 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-red-500/20 transition-colors"
                        >
                          <svg width="6" height="6" viewBox="0 0 10 10" fill="none">
                            <path
                              d="M2 2l6 6M8 2l-6 6"
                              stroke="#94a3b8"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative min-w-0 flex-1">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-600 pointer-events-none">
                            From
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            inputMode="numeric"
                            value={f.min}
                            onChange={(e) =>
                              updateHitRateFilter(index, "min", e.target.value)
                            }
                            onBlur={() => normalizeDraftHitRateFilter(index)}
                            className="w-full rounded border border-white/[0.06] bg-[#060E1A] py-1.5 pl-9 pr-2 text-right font-mono text-[11px] text-slate-300 [appearance:textfield] focus:border-orange-500/40 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </div>
                        <span className="text-slate-600 font-mono text-[10px]">
                          —
                        </span>
                        <div className="relative min-w-0 flex-1">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            inputMode="numeric"
                            value={f.max}
                            onChange={(e) =>
                              updateHitRateFilter(index, "max", e.target.value)
                            }
                            onBlur={() => normalizeDraftHitRateFilter(index)}
                            className="w-full rounded border border-white/[0.06] bg-[#060E1A] py-1.5 pl-2 pr-9 font-mono text-[11px] text-slate-300 [appearance:textfield] focus:border-orange-500/40 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-600 pointer-events-none">
                            To
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {draftFilterHitRates.length < PERIODS.length &&
                    draftFilterHitRates.every(isHitRateFilterActive) && (
                      <button
                        type="button"
                        onClick={addHitRateFilter}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-white/[0.1] text-[10px] font-mono text-slate-600 hover:text-slate-400 hover:border-white/20 transition-all"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 5v14M5 12h14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        Add period filter
                      </button>
                    )}
                  {draftFilterHitRates.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = draftFilterHitRates
                          .map(normalizeHitRateFilter)
                          .filter(isHitRateFilterActive);
                        setFilterHitRates(next);
                        setDraftFilterHitRates(next);
                        updateUrl({
                          hr: serializeHitRates(next),
                        });
                        closeDropdown();
                      }}
                      className="mt-2 w-full flex items-center justify-center px-3 py-2 rounded-lg border border-orange-500/30 bg-orange-500/10 text-[10px] font-mono font-bold text-orange-400 hover:bg-orange-500/15 transition-all"
                    >
                      Apply hit rate filters
                    </button>
                  )}
                </>
              )}
            </PropsFilterDropdown>

            <PropsFilterDropdown
              accessibleLabel="Matchup"
              label={
                matchupActive
                  ? `Matchup (${filterMatchup.length})`
                  : "Matchup"
              }
              active={matchupActive}
              onOpenChange={(open) => {
                if (open) setDraftFilterMatchup(filterMatchup);
              }}
            >
              {(closeDropdown) => (
                <>
                  <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2">
                    Matchup Quality
                  </p>
                  {["favorable", "neutral", "unfavorable"].map((m) => {
                    const isActive = draftFilterMatchup.includes(m);
                    return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      const next = isActive
                        ? draftFilterMatchup.filter((x) => x !== m)
                        : [...draftFilterMatchup, m];
                      setDraftFilterMatchup(next);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-mono font-bold transition-all mb-1 ${isActive ? (m === "favorable" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : m === "neutral" ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400" : "bg-red-500/10 border border-red-500/30 text-red-400") : "hover:bg-white/[0.04] text-slate-500 border border-transparent"}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${m === "favorable" ? "bg-emerald-400" : m === "neutral" ? "bg-yellow-400" : "bg-red-400"}`}
                    />
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                    {isActive && (
                      <svg
                        className="ml-auto"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M5 12l5 5L20 7"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMatchup(draftFilterMatchup);
                      updateUrl({ matchup: draftFilterMatchup });
                      closeDropdown();
                    }}
                    className="mt-3 flex w-full items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-[10px] font-mono font-bold text-orange-400 transition-all hover:bg-orange-500/15"
                  >
                    Apply matchup filters
                  </button>
                </>
              )}
            </PropsFilterDropdown>

            <PropsFilterDropdown
              accessibleLabel="Injury"
              label={
                injuryActive
                  ? `Injury (${filterInjury.length})`
                  : "Injury"
              }
              active={injuryActive}
              onOpenChange={(open) => {
                if (open) setDraftFilterInjury(filterInjury);
              }}
            >
              {(closeDropdown) => (
                <>
                  <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2">
                    Hide Players
                  </p>
                  {["Out", "Day-To-Day", "Doubtful", "Questionable"].map(
                    (status) => {
                      const isActive = draftFilterInjury.includes(status);
                      return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      const next = isActive
                        ? draftFilterInjury.filter((s) => s !== status)
                        : [...draftFilterInjury, status];
                      setDraftFilterInjury(next);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-mono font-bold transition-all mb-1 ${isActive ? `${INJURY_STYLES[status]} border` : "hover:bg-white/[0.04] text-slate-500 border border-transparent"}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${INJURY_DOT[status]}`}
                    />
                    Hide {status === "Day-To-Day" ? "DTD" : status}
                    {isActive && (
                      <svg
                        className="ml-auto"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M5 12l5 5L20 7"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                      );
                    },
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFilterInjury(draftFilterInjury);
                      updateUrl({ hide: draftFilterInjury });
                      closeDropdown();
                    }}
                    className="mt-3 flex w-full items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-[10px] font-mono font-bold text-orange-400 transition-all hover:bg-orange-500/15"
                  >
                    Apply injury filters
                  </button>
                </>
              )}
            </PropsFilterDropdown>
            </div>
          </div>

          {activeFilterChips.length > 0 && (
            <div className="flex w-full items-start gap-2.5 lg:flex-wrap lg:items-center">
              <div className="compact-horizontal-scrollbar mobile-visible-horizontal-scrollbar flex min-w-0 flex-1 flex-nowrap items-center gap-2.5 overflow-x-auto px-1 pb-2 pt-1 lg:w-auto lg:flex-none lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0 lg:pt-0">
                <span className="hidden shrink-0 text-[11px] font-mono uppercase tracking-widest text-slate-500 lg:inline">
                  Active:
                </span>
                {activeFilterChips.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={filter.onRemove}
                    className="group inline-flex min-h-8 shrink-0 items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.055] px-3 py-1.5 text-[11px] font-mono font-medium text-slate-300 shadow-sm shadow-black/10 transition-colors hover:border-orange-500/35 hover:bg-orange-500/10 hover:text-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                    aria-label={`Remove ${filter.label} filter`}
                  >
                    <span>{filter.label}</span>
                    <span
                      aria-hidden="true"
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-white/[0.06] text-[12px] leading-none text-slate-500 transition-colors group-hover:bg-orange-500/15 group-hover:text-orange-200"
                    >
                      ×
                    </span>
                  </button>
                ))}
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  aria-label="Clear all filters"
                  title="Clear all filters"
                  onClick={clearAllFilters}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-300 transition-colors hover:border-red-400/45 hover:bg-red-500/15 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                >
                  <svg
                    aria-hidden="true"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v5" />
                    <path d="M14 11v5" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        <PropsResultsTable
          enrichedProps={enrichedProps}
          favoritesLoaded={favoritesLoaded}
          injuryMap={injuryMap}
          isFavorite={isFavorite}
          isUpdating={isUpdating}
          onClearFilters={clearAllFilters}
          onLoadMore={setVisibleRows}
          onOpenPlayer={(player) => {
            const game = player.game;
            const team1Id = game ? game.home_team_id : player.team_id;
            const team2Id = game ? game.visitor_team_id : player.opponent_id;
            router.push(
              `/playersStats?team1Id=${team1Id}&team2Id=${team2Id}&playerId=${player.player_id}&stat=${selectedStat}`,
            );
          }}
          onSortPeriod={(period) => {
            const nextDirection =
              period === sortPeriod && sortDirection === "desc"
                ? "asc"
                : "desc";
            setSortPeriod(period);
            setSortDirection(nextDirection);
            updateUrl({
              sort: period,
              dir: nextDirection,
            });
          }}
          onToggleFavorite={toggleFavorite}
          selectedStat={selectedStat}
          sortPeriod={sortPeriod}
          sortDirection={sortDirection}
          totalPropsCount={totalPropsCount}
          visibleRows={visibleRows}
        />
      </div>
    </div>
  );
}
