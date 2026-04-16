"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import Image from "next/image";

const STATS = [
  "points",
  "assists",
  "rebounds",
  "blocks",
  "steals",
  "turnovers",
  "fg3m",
  "pra",
  "pa",
  "pr",
  "ra",
];
const PERIODS = ["L5", "L10", "L20", "full", "h2h"];
const PERIOD_LABELS = {
  L5: "L5",
  L10: "L10",
  L20: "L20",
  full: "Full",
  h2h: "H2H",
};

const INJURY_STYLES = {
  Out: "bg-red-500/15 text-red-400 border-red-500/30",
  "Day-To-Day": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Doubtful: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Questionable: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

const INJURY_DOT = {
  Out: "bg-red-400",
  "Day-To-Day": "bg-yellow-400",
  Doubtful: "bg-orange-400",
  Questionable: "bg-yellow-400",
};

const HIT_RATE_COLOR = (rate) => {
  if (rate == null) return "text-slate-600";
  if (rate >= 70) return "text-emerald-400";
  if (rate >= 50) return "text-yellow-400";
  return "text-red-400";
};

const StarButton = ({ isFav, onClick }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`w-6 h-6 flex items-center justify-center rounded transition-all flex-shrink-0
      ${isFav ? "text-orange-400" : "text-slate-700 hover:text-slate-400"}`}
  >
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill={isFav ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  </button>
);

const FilterDropdown = ({ label, active, onClear, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] font-mono font-bold transition-all
          ${active ? "border-orange-500/40 bg-orange-500/10 text-orange-400" : "border-white/[0.06] bg-[#0D1828] text-slate-400 hover:border-white/10 hover:text-slate-300"}`}
      >
        {active && onClear && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="w-3.5 h-3.5 rounded-full bg-orange-500/30 flex items-center justify-center hover:bg-orange-500/50 transition-colors"
          >
            <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
              <path
                d="M2 2l6 6M8 2l-6 6"
                stroke="#f97316"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        )}
        <span>{label}</span>
        <svg
          width="8"
          height="8"
          viewBox="0 0 24 24"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 rounded-xl border border-white/[0.06] bg-[#0D1828] shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-3 min-w-[240px]">
          {children}
        </div>
      )}
    </div>
  );
};

const roundToBettingLine = (val) => {
  const floored = Math.floor(val * 2) / 2;
  return floored % 1 === 0 ? floored + 0.5 : floored;
};

const serializeList = (items) => items.join(",");

const serializeHitRates = (filters) =>
  filters
    .map((filter) => `${filter.period}:${filter.min}:${filter.max}`)
    .join(",");

export default function PropsTable({
  basePath = "/props",
  enrichedProps,
  allTeams,
  standings,
  schedule,
  injuries,
  totalPropsCount,
  initialFilters,
}) {
  const { isFavorite, toggleFavorite } = useFavorites();

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

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setSelectedStat(initialFilters.selectedStat);
    setSortPeriod(initialFilters.sortPeriod);
    setFilterTeam(initialFilters.filterTeam);
    setFilterGame(initialFilters.filterGame);
    setFilterMatchup(initialFilters.filterMatchup);
    setFilterHitRates(initialFilters.filterHitRates);
    setFilterInjury(initialFilters.filterInjury);
    setSearch(initialFilters.search);
  }, [initialFilters]);

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
      router.replace(query ? `${basePath}?${query}` : basePath, {
        scroll: false,
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

      <div className="relative z-10 flex flex-col min-h-0 flex-1 max-w-[1400px] mx-auto w-full px-6 py-5 gap-4">
        {/* Header */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-1 h-5 rounded-sm bg-orange-500" />
          <h1 className="font-mono font-black text-sm tracking-widest text-white uppercase">
            Props
          </h1>
          <span className="text-[10px] font-mono text-slate-600 border border-white/[0.06] rounded px-2 py-0.5">
            {enrichedProps.length} props
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search player..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 rounded-lg border border-white/[0.06] bg-[#0D1828] text-[11px] font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-orange-500/40 w-[160px]"
            />

            <div className="flex rounded-lg overflow-hidden border border-white/[0.06] bg-[#0D1828]">
              {STATS.map((stat) => (
                <button
                  key={stat}
                  onClick={() => {
                    setSelectedStat(stat);
                    updateUrl({ stat });
                  }}
                  className={`px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${selectedStat === stat ? "bg-orange-500 text-white" : "text-slate-600 hover:text-slate-300"}`}
                >
                  {stat}
                </button>
              ))}
            </div>

            <FilterDropdown
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
                      <img
                        src={`https://cdn.nba.com/logos/nba/${game.home_team_id}/global/L/logo.svg`}
                        alt=""
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <span className="font-bold">{home}</span>
                      <span className="text-slate-600 text-[9px]">vs</span>
                      <img
                        src={`https://cdn.nba.com/logos/nba/${game.visitor_team_id}/global/L/logo.svg`}
                        alt=""
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
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
            </FilterDropdown>

            <FilterDropdown
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
            </FilterDropdown>

            <FilterDropdown
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
            </FilterDropdown>

            <FilterDropdown
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
            </FilterDropdown>

            <FilterDropdown
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
            </FilterDropdown>
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

        {/* Table */}
        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#0D1828]">
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-[10px] font-mono text-slate-600 uppercase tracking-widest font-bold w-[280px]">
                  Player
                </th>
                <th className="px-4 py-3 text-[10px] font-mono text-slate-600 uppercase tracking-widest font-bold text-right">
                  Line
                </th>
                <th className="px-4 py-3 text-[10px] font-mono text-slate-600 uppercase tracking-widest font-bold text-right">
                  Matchup
                </th>
                {PERIODS.map((p) => (
                  <th
                    key={p}
                    onClick={() => {
                      setSortPeriod(p);
                      updateUrl({ sortPeriod: p });
                    }}
                    className={`px-4 py-3 text-[10px] font-mono uppercase tracking-widest font-bold text-right cursor-pointer transition-colors ${sortPeriod === p ? "text-orange-400" : "text-slate-600 hover:text-slate-400"}`}
                  >
                    {PERIOD_LABELS[p]}
                    {sortPeriod === p && <span className="ml-1">↓</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrichedProps.map((player, i) => {
                const prop = player.props?.[selectedStat];
                const matchupLabel = player.matchupLabel;
                const rank = player.matchupRank;
                const injuryStatus = injuryMap[player.player_name];
                const fav = isFavorite(player.player_id, selectedStat);

                const playerGame = player.game;

                return (
                  <tr
                    key={`${player.player_id}-${i}`}
                    onClick={() => {
                      const game = player.game;

                      const team1Id = game ? game.home_team_id : player.team_id;
                      const team2Id = game
                        ? game.visitor_team_id
                        : player.opponent_id;

                      router.push(
                        `/playersStats?team1Id=${team1Id}&team2Id=${team2Id}&playerId=${player.player_id}&stat=${selectedStat}`,
                      );
                    }}
                    className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#0D1828] border border-white/[0.06] flex-shrink-0">
                          <Image
                            src={`https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${player.player_id}.png`}
                            width={40}
                            height={30}
                            alt={player.player_name}
                            priority={i === 0}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.opacity = 0.2;
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[13px] font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                              {player.player_name}
                            </p>
                            {player.position && (
                              <span className="text-[9px] font-mono text-slate-600 border border-white/[0.06] rounded px-1">
                                {player.position}
                              </span>
                            )}
                            {injuryStatus && (
                              <span
                                className={`px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-widest ${INJURY_STYLES[injuryStatus] || "bg-slate-500/15 text-slate-400 border-slate-500/30"}`}
                              >
                                {injuryStatus === "Day-To-Day"
                                  ? "DTD"
                                  : injuryStatus}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono font-bold text-orange-400">
                              {player.team}
                            </span>
                            <span className="text-[9px] font-mono text-slate-700">
                              vs
                            </span>
                            <span className="text-[10px] font-mono text-slate-600">
                              {player.opponent}
                            </span>
                          </div>
                        </div>
                        <StarButton
                          isFav={fav}
                          onClick={() =>
                            toggleFavorite(
                              player,
                              selectedStat,
                              roundToBettingLine(prop?.avg),
                              playerGame,
                            )
                          }
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] font-black font-mono text-white">
                        {prop?.avg != null
                          ? roundToBettingLine(prop.avg).toFixed(1)
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span
                          className={`text-[11px] font-mono font-bold ${matchupLabel.color}`}
                        >
                          {matchupLabel.label}
                        </span>
                        {rank != null && (
                          <span className="text-[9px] font-mono text-slate-600">
                            #{rank} allowed
                          </span>
                        )}
                      </div>
                    </td>
                    {PERIODS.map((period) => {
                      const hr = prop?.[period]?.hit_rate;
                      const games = prop?.[period]?.games;
                      return (
                        <td key={period} className="px-4 py-3 text-right">
                          <div className="flex flex-col items-end gap-0.5">
                            <span
                              className={`text-[13px] font-black font-mono ${HIT_RATE_COLOR(hr)}`}
                            >
                              {hr != null ? `${hr}%` : "N/A"}
                            </span>
                            {games != null && games > 0 && (
                              <span className="text-[9px] font-mono text-slate-700">
                                {games}g
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {enrichedProps.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-[12px] font-mono text-slate-600">
                      {totalPropsCount === 0
                        ? "No player props available"
                        : "No props found for the selected filters"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
