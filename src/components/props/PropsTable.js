"use client";

import {
  useMemo,
  useState,
  useEffect,
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
  STATS,
  serializeHitRates,
  serializeList,
} from "./propsConfig";

export default function PropsTable({
  basePath = "/props",
  enrichedProps,
  allTeams,
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
  const [filterTeam, setFilterTeam] = useState(initialFilters.filterTeam);
  const [filterGame, setFilterGame] = useState(initialFilters.filterGame);
  const [filterMatchup, setFilterMatchup] = useState(
    initialFilters.filterMatchup,
  );
  const [filterHitRates, setFilterHitRates] = useState(
    initialFilters.filterHitRates,
  );
  const [filterInjury, setFilterInjury] = useState(initialFilters.filterInjury);
  const [search, setSearch] = useState(initialFilters.search);
  const [visibleRows, setVisibleRows] = useState(INITIAL_VISIBLE_ROWS);
  const [isUpdating, startTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();

  const updateUrl = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextState = {
        stat: selectedStat,
        sortPeriod,
        team: filterTeam,
        game: filterGame,
        matchup: filterMatchup,
        hitRates: serializeHitRates(filterHitRates),
        injury: filterInjury,
        search,
        ...updates,
      };

      Object.entries(nextState).forEach(([key, value]) => {
        if (
          value == null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          params.delete(key);
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
      filterTeam,
      router,
      search,
      searchParams,
      selectedStat,
      startTransition,
      sortPeriod,
    ],
  );

  useEffect(() => {
    if (search === initialFilters.search) return;

    const timeoutId = setTimeout(() => {
      updateUrl({ search });
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [search, initialFilters.search, updateUrl]);

  const teamNameMap = useMemo(() => standings, [standings]);

  const injuryMap = useMemo(() => {
    const map = {};
    injuries.forEach(({ name, status }) => {
      if (name) map[name] = status;
    });
    return map;
  }, [injuries]);

  const hitRateActive = filterHitRates.length > 0;
  const matchupActive = filterMatchup.length > 0;
  const teamActive = filterTeam !== "";
  const gameActive = filterGame !== "";
  const injuryActive = filterInjury.length > 0;
  const clearAllFilters = () => {
    setSelectedStat("points");
    setSortPeriod("L5");
    setFilterTeam("");
    setFilterGame("");
    setFilterMatchup([]);
    setFilterHitRates([]);
    setFilterInjury([]);
    setSearch("");
    updateUrl({
      stat: "points",
      sortPeriod: "L5",
      team: "",
      game: "",
      matchup: [],
      hitRates: "",
      injury: [],
      search: "",
    });
  };

  const addHitRateFilter = () => {
    const usedPeriods = filterHitRates.map((f) => f.period);
    const available = PERIODS.find((p) => !usedPeriods.includes(p));
    if (!available) return;
    const next = [...filterHitRates, { period: available, min: "", max: "" }];
    setFilterHitRates(next);
  };

  const updateHitRateFilter = (index, field, value) => {
    const next = filterHitRates.map((f, i) =>
      i === index ? { ...f, [field]: value } : f,
    );
    setFilterHitRates(next);
  };

  const removeHitRateFilter = (index) => {
    const next = filterHitRates.filter((_, i) => i !== index);
    setFilterHitRates(next);
  };

  const activeFilterSummary = useMemo(() => {
    const parts = [];
    if (selectedStat !== "points") parts.push(`Stat: ${selectedStat}`);
    if (filterHitRates.length > 0) {
      filterHitRates.forEach((f) => {
        parts.push(
          `${PERIOD_LABELS[f.period]} HR: ${f.min || "0"}–${f.max || "100"}%`,
        );
      });
    }
    if (filterMatchup.length > 0)
      parts.push(
        `Matchup: ${filterMatchup.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")}`,
      );
    if (filterTeam) parts.push(`Team: ${filterTeam}`);
    if (filterGame) {
      const home =
        teamNameMap[Number(filterGame.split("-")[0])]?.split(" ").pop() || "?";
      const away =
        teamNameMap[Number(filterGame.split("-")[1])]?.split(" ").pop() || "?";
      parts.push(`Game: ${home} vs ${away}`);
    }
    if (filterInjury.length > 0)
      parts.push(
        `Hiding: ${filterInjury.map((s) => (s === "Day-To-Day" ? "DTD" : s)).join(", ")}`,
      );
    return parts;
  }, [
    selectedStat,
    filterHitRates,
    filterMatchup,
    filterTeam,
    filterGame,
    filterInjury,
    teamNameMap,
  ]);
  const hasActiveFilters =
    activeFilterSummary.length > 0 || search !== "" || sortPeriod !== "L5";
  const updatedAt = dataStatus?.updatedAt ? new Date(dataStatus.updatedAt) : null;
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
          <h1 className="font-mono font-black text-sm tracking-widest text-white uppercase">
            Props
          </h1>
          <span className="text-[10px] font-mono text-slate-600 border border-white/[0.06] rounded px-2 py-0.5">
            {enrichedProps.length} props
          </span>
          <span
            aria-live="polite"
            className={`text-[10px] font-mono text-orange-300 transition-opacity ${isUpdating ? "opacity-100" : "opacity-0"}`}
          >
            Updating…
          </span>
          <span className={`text-[9px] font-mono ${isStale || dataStatus?.source === "local" ? "text-amber-300" : "text-slate-400"}`}>
            {dataStatus?.source === "qa"
              ? "QA data"
              : updatedAt
                ? `${isStale ? "Stale · " : "Updated "}${updatedAt.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
                : dataStatus?.source === "local"
                  ? "Local fallback"
                  : "Latest available"}
          </span>
          {isFreePlan && (
            <Link
              href="/pricing"
              className="ml-1 flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1.5 transition-all hover:border-orange-500/50 hover:bg-orange-500/20"
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

        {/* Filters */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative w-full sm:w-auto">
              <span className="sr-only">Search players</span>
              <input
                type="search"
                placeholder="Search player..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-[#0D1828] px-3 py-2 pr-8 text-[11px] font-mono text-slate-200 placeholder-slate-500 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:w-[190px]"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear player search"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                >
                  ×
                </button>
              )}
            </label>

            <div aria-label="Statistic" className="flex max-w-full overflow-x-auto rounded-lg border border-white/[0.06] bg-[#0D1828]">
              {STATS.map((stat) => (
                <button
                  type="button"
                  key={stat}
                  onClick={() => {
                    updateUrl({ stat });
                  }}
                  aria-pressed={selectedStat === stat}
                  className={`px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${selectedStat === stat ? "bg-orange-500 text-white" : "text-slate-600 hover:text-slate-300"}`}
                >
                  {stat}
                </button>
              ))}
            </div>

            <PropsFilterDropdown
              accessibleLabel="Game"
              label={
                gameActive
                  ? `${teamNameMap[Number(filterGame.split("-")[0])]?.split(" ").pop() || "?"} vs ${teamNameMap[Number(filterGame.split("-")[1])]?.split(" ").pop() || "?"}`
                  : "Game"
              }
              active={gameActive}
              onClear={() => {
                setFilterGame("");
                updateUrl({ game: "" });
              }}
            >
              <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2">
                Select Game
              </p>
              <div className="flex flex-col gap-1">
                {schedule.map((game) => {
                  const key = `${game.home_team_id}-${game.visitor_team_id}`;
                  const home =
                    teamNameMap[game.home_team_id]?.split(" ").pop() ||
                    game.home_team_id;
                  const away =
                    teamNameMap[game.visitor_team_id]?.split(" ").pop() ||
                    game.visitor_team_id;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        const next = filterGame === key ? "" : key;
                        setFilterGame(next);
                        updateUrl({ game: next });
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-mono transition-all text-left ${filterGame === key ? "bg-orange-500/10 border border-orange-500/30 text-orange-400" : "hover:bg-white/[0.04] text-slate-400 border border-transparent"}`}
                    >
                      <Image
                        src={`https://cdn.nba.com/logos/nba/${game.home_team_id}/global/L/logo.svg`}
                        alt=""
                        width={16}
                        height={16}
                        unoptimized
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
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
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <span className="font-bold">{away}</span>
                      <span className="ml-auto text-[9px] text-slate-600">
                        {game.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </PropsFilterDropdown>

            <PropsFilterDropdown
              accessibleLabel="Team"
              label={teamActive ? filterTeam : "Team"}
              active={teamActive}
              onClear={() => {
                setFilterTeam("");
                updateUrl({ team: "" });
              }}
            >
              <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2">
                Select Team
              </p>
              <div className="flex flex-wrap gap-1 max-w-[240px]">
                {allTeams.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      const next = filterTeam === t ? "" : t;
                      setFilterTeam(next);
                      updateUrl({ team: next });
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${filterTeam === t ? "bg-orange-500/20 border border-orange-500/40 text-orange-400" : "border border-white/[0.06] text-slate-600 hover:text-slate-300"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </PropsFilterDropdown>

            <PropsFilterDropdown
              accessibleLabel="Hit rate"
              label={
                hitRateActive
                  ? `HR (${filterHitRates.length} filter${filterHitRates.length > 1 ? "s" : ""})`
                  : "Hit Rate"
              }
              active={hitRateActive}
              onClear={() => {
                setFilterHitRates([]);
                updateUrl({ hitRates: "" });
              }}
            >
              <p className="text-[10px] font-mono font-bold text-white mb-3">
                Hit Rate Filters
              </p>
              {filterHitRates.map((f, index) => (
                <div
                  key={index}
                  className="mb-3 p-2 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1">
                      {PERIODS.map((p) => (
                        <button
                          key={p}
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
                    <div className="flex-1 relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-600 pointer-events-none">
                        From
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={f.min}
                        onChange={(e) =>
                          updateHitRateFilter(index, "min", e.target.value)
                        }
                        className="w-full pl-9 pr-2 py-1.5 rounded border border-white/[0.06] bg-[#060E1A] text-[11px] font-mono text-slate-300 focus:outline-none focus:border-orange-500/40 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <span className="text-slate-600 font-mono text-[10px]">
                      —
                    </span>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={f.max}
                        onChange={(e) =>
                          updateHitRateFilter(index, "max", e.target.value)
                        }
                        className="w-full pl-2 pr-9 py-1.5 rounded border border-white/[0.06] bg-[#060E1A] text-[11px] font-mono text-slate-300 focus:outline-none focus:border-orange-500/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-600 pointer-events-none">
                        To
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {filterHitRates.length < PERIODS.length && (
                <button
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
              {filterHitRates.length > 0 && (
                <button
                  onClick={() =>
                    updateUrl({ hitRates: serializeHitRates(filterHitRates) })
                  }
                  className="mt-2 w-full flex items-center justify-center px-3 py-2 rounded-lg border border-orange-500/30 bg-orange-500/10 text-[10px] font-mono font-bold text-orange-400 hover:bg-orange-500/15 transition-all"
                >
                  Apply hit rate filters
                </button>
              )}
            </PropsFilterDropdown>

            <PropsFilterDropdown
              accessibleLabel="Matchup"
              label={
                matchupActive
                  ? filterMatchup
                      .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
                      .join(", ")
                  : "Matchup"
              }
              active={matchupActive}
              onClear={() => {
                setFilterMatchup([]);
                updateUrl({ matchup: "" });
              }}
            >
              <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2">
                Matchup Quality
              </p>
              {["favorable", "neutral", "unfavorable"].map((m) => {
                const isActive = filterMatchup.includes(m);
                return (
                  <button
                    key={m}
                    onClick={() => {
                      const next = isActive
                        ? filterMatchup.filter((x) => x !== m)
                        : [...filterMatchup, m];
                      setFilterMatchup(next);
                      updateUrl({ matchup: next });
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
            </PropsFilterDropdown>

            <PropsFilterDropdown
              accessibleLabel="Injury"
              label={
                injuryActive
                  ? `Hiding ${filterInjury.map((s) => (s === "Day-To-Day" ? "DTD" : s)).join(", ")}`
                  : "Injury"
              }
              active={injuryActive}
              onClear={() => {
                setFilterInjury([]);
                updateUrl({ injury: "" });
              }}
            >
              <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2">
                Hide Players
              </p>
              {["Out", "Day-To-Day", "Doubtful", "Questionable"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => {
                      const next = filterInjury.includes(status)
                        ? filterInjury.filter((s) => s !== status)
                        : [...filterInjury, status];
                      setFilterInjury(next);
                      updateUrl({ injury: next });
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-mono font-bold transition-all mb-1 ${filterInjury.includes(status) ? `${INJURY_STYLES[status]} border` : "hover:bg-white/[0.04] text-slate-500 border border-transparent"}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${INJURY_DOT[status]}`}
                    />
                    Hide {status === "Day-To-Day" ? "DTD" : status}
                    {filterInjury.includes(status) && (
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
                ),
              )}
            </PropsFilterDropdown>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 transition-colors hover:border-orange-500/30 hover:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              >
                Clear all
              </button>
            )}
          </div>

          {activeFilterSummary.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                Active:
              </span>
              {activeFilterSummary.map((f, i) => (
                <span
                  key={i}
                  className="text-[9px] font-mono text-slate-500 bg-white/[0.03] border border-white/[0.06] rounded px-2 py-0.5"
                >
                  {f}
                </span>
              ))}
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
          onSortPeriod={(period) => updateUrl({ sortPeriod: period })}
          onToggleFavorite={toggleFavorite}
          selectedStat={selectedStat}
          sortPeriod={sortPeriod}
          totalPropsCount={totalPropsCount}
          visibleRows={visibleRows}
        />
      </div>
    </div>
  );
}
