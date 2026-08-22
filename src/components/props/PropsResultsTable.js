"use client";

import PlayerHeadshotImage from "@/components/PlayerHeadshotImage";
import {
  INITIAL_VISIBLE_ROWS,
  INJURY_STYLES,
  PERIOD_LABELS,
  PERIODS,
  STAT_LABELS,
  hitRateColor,
  roundToBettingLine,
} from "./propsConfig";

function FavoriteButton({ isFavorite, onClick, playerName, disabled }) {
  return (
    <button
      type="button"
      aria-label={`${isFavorite ? "Remove" : "Add"} ${playerName} ${isFavorite ? "from" : "to"} favorites`}
      aria-pressed={isFavorite}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 disabled:cursor-wait disabled:opacity-50 md:h-9 md:w-9 ${isFavorite ? "text-orange-400" : "text-slate-500 hover:text-slate-200"}`}
    >
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}

function ResultsHeader({ sortDirection, sortPeriod, onSortPeriod }) {
  return (
    <thead className="sticky top-0 z-10 bg-[#0D1828]">
      <tr className="border-b border-white/[0.08]">
        <th scope="col" className="sticky left-0 z-20 w-[205px] min-w-[205px] max-w-[205px] bg-[#0D1828] px-2 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300 md:w-[280px] md:min-w-[280px] md:max-w-[280px] md:px-4">Player</th>
        <th scope="col" className="px-4 py-3 text-right text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">Line</th>
        <th scope="col" className="px-4 py-3 text-right text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">Matchup</th>
        {PERIODS.map((period) => (
          <th key={period} scope="col" aria-sort={sortPeriod === period ? (sortDirection === "asc" ? "ascending" : "descending") : "none"} className="px-2 py-1 text-right last:pr-6 last:[&>button]:pr-0">
            <button
              type="button"
              onClick={() => onSortPeriod(period)}
              className={`rounded px-2 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${sortPeriod === period ? "text-orange-400" : "text-slate-300 hover:text-white"}`}
            >
              {PERIOD_LABELS[period]}
              {sortPeriod === period && (
                <span
                  className="ml-1 inline-block text-[15px] font-black leading-none"
                  aria-hidden="true"
                >
                  {sortDirection === "asc" ? "↑" : "↓"}
                </span>
              )}
            </button>
          </th>
        ))}
      </tr>
    </thead>
  );
}

function PeriodMetric({ label, hitRate, games }) {
  return (
    <div className="min-w-0 rounded-md border border-white/[0.07] bg-white/[0.035] px-2 py-1.5 text-center">
      <span className="block text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className={`mt-0.5 block text-[12px] font-mono font-black leading-tight ${hitRateColor(hitRate)}`}>
        {hitRate != null ? `${hitRate}%` : "N/A"}
      </span>
      <span className="block min-h-3 text-[8px] font-mono leading-tight text-slate-500">
        {games != null && games > 0 ? `${games}g` : ""}
      </span>
    </div>
  );
}

function MobilePropRow({
  favorite,
  favoritesLoaded,
  index,
  injuryStatus,
  onOpenPlayer,
  onToggleFavorite,
  player,
  prop,
  selectedStat,
}) {
  const line = prop?.avg != null ? roundToBettingLine(prop.avg).toFixed(1) : "—";

  return (
    <article className="border-b border-white/[0.07] px-3 py-3 last:border-b-0">
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={() => onOpenPlayer(player)}
          className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 rounded-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
          aria-label={`Open ${player.player_name} ${selectedStat} details`}
        >
          <span className="mt-0.5 h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0D1828]">
            <PlayerHeadshotImage
              playerId={player.player_id}
              width={40}
              height={30}
              alt=""
              priority={index === 0}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-[13px] font-semibold leading-tight text-slate-100">
                {player.player_name}
              </span>
              {player.position && (
                <span className="shrink-0 rounded border border-white/[0.08] px-1 text-[8px] font-mono text-slate-400">
                  {player.position}
                </span>
              )}
              {injuryStatus && (
                <span className={`shrink-0 rounded border px-1 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider ${INJURY_STYLES[injuryStatus] || "border-slate-500/30 bg-slate-500/15 text-slate-300"}`}>
                  {injuryStatus === "Day-To-Day" ? "DTD" : injuryStatus}
                </span>
              )}
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] font-mono">
              <span className="font-bold text-orange-400">{player.team}</span>
              <span className="text-slate-500">vs</span>
              <span className="text-slate-400">{player.opponent}</span>
              <span className="text-slate-600">·</span>
              <span className="font-bold text-slate-200">{STAT_LABELS?.[selectedStat] ?? selectedStat}</span>
            </span>
          </span>
        </button>

        <div className="flex shrink-0 items-start gap-1.5">
          <div className="text-right">
            <span className="block text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Line
            </span>
            <span className="block text-[14px] font-mono font-black leading-tight text-white">
              {line}
            </span>
          </div>
          <FavoriteButton
            isFavorite={favorite}
            playerName={player.player_name}
            disabled={!favoritesLoaded}
            onClick={() => onToggleFavorite(player, selectedStat, roundToBettingLine(prop?.avg), player.game)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpenPlayer(player)}
        aria-label={`Open ${player.player_name} details`}
        className="mt-2 grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
      >
        <span>
          <span className={`block text-[11px] font-mono font-bold ${player.matchupLabel.color}`}>
            {player.matchupLabel.label}
          </span>
          {player.matchupRank != null && (
            <span className="block text-[9px] font-mono text-slate-500">
              #{player.matchupRank} allowed
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] text-slate-400"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {PERIODS.map((period) => (
          <PeriodMetric
            key={period}
            label={PERIOD_LABELS[period]}
            hitRate={prop?.[period]?.hit_rate}
            games={prop?.[period]?.games}
          />
        ))}
      </div>
    </article>
  );
}

export default function PropsResultsTable({
  enrichedProps,
  favoritesLoaded,
  injuryMap,
  isFavorite,
  isUpdating,
  onClearFilters,
  onLoadMore,
  onOpenPlayer,
  onSortPeriod,
  onToggleFavorite,
  selectedStat,
  sortDirection,
  sortPeriod,
  totalPropsCount,
  visibleRows,
}) {
  const visibleProps = enrichedProps.slice(0, visibleRows);

  if (enrichedProps.length === 0) {
    return (
      <div
        aria-busy={isUpdating}
        className={`min-h-36 flex-1 overflow-hidden rounded-xl border border-white/[0.08] text-center transition-opacity ${isUpdating ? "opacity-70" : "opacity-100"}`}
      >
        <div className="compact-horizontal-scrollbar overflow-x-scroll md:overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <caption className="sr-only">NBA player props columns</caption>
            <ResultsHeader
              sortDirection={sortDirection}
              sortPeriod={sortPeriod}
              onSortPeriod={onSortPeriod}
            />
          </table>
        </div>
        <div className="flex min-h-28 items-center justify-center px-4 py-8">
          <div>
          <p className="text-[12px] font-mono text-slate-300">
            {totalPropsCount === 0
              ? "Sorry, player props are not available right now."
              : "No props found for the selected filters"}
          </p>
          {totalPropsCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-4 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-orange-300 hover:bg-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            >
              Clear filters
            </button>
          )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      aria-busy={isUpdating}
      className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.08] transition-opacity ${isUpdating ? "opacity-70" : "opacity-100"}`}
    >
      <div className="min-h-0 flex-1 overflow-y-auto md:hidden">
        {visibleProps.map((player, index) => {
          const prop = player.props?.[selectedStat];
          const injuryStatus = injuryMap[player.player_name];
          const favorite = isFavorite(player.player_id, selectedStat);

          return (
            <MobilePropRow
              key={player.player_id}
              favorite={favorite}
              favoritesLoaded={favoritesLoaded}
              index={index}
              injuryStatus={injuryStatus}
              onOpenPlayer={onOpenPlayer}
              onToggleFavorite={onToggleFavorite}
              player={player}
              prop={prop}
              selectedStat={selectedStat}
            />
          );
        })}
      </div>

      <div className="compact-horizontal-scrollbar hidden min-h-0 flex-1 overflow-x-auto overflow-y-auto md:block">
        <table className="min-w-[860px] w-full text-left border-collapse">
          <caption className="sr-only">
            NBA player props for {selectedStat}, sorted by {sortPeriod}
          </caption>
          <ResultsHeader
            sortDirection={sortDirection}
            sortPeriod={sortPeriod}
            onSortPeriod={onSortPeriod}
          />
          <tbody>
            {visibleProps.map((player, index) => {
              const prop = player.props?.[selectedStat];
              const injuryStatus = injuryMap[player.player_name];
              const favorite = isFavorite(player.player_id, selectedStat);

              return (
              <tr
                key={player.player_id}
                onClick={() => onOpenPlayer(player)}
                className="group cursor-pointer border-b border-white/[0.05] transition-colors hover:bg-white/[0.04]"
              >
                <td className="sticky left-0 z-[1] w-[205px] min-w-[205px] max-w-[205px] bg-[#091423] px-2 py-3 group-hover:bg-[#0d1928] md:w-[280px] md:min-w-[280px] md:max-w-[280px] md:px-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <button
                      type="button"
                      data-player-trigger
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenPlayer(player);
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
                        event.preventDefault();
                        const triggers = Array.from(
                          event.currentTarget
                            .closest("tbody")
                            ?.querySelectorAll("[data-player-trigger]") ?? [],
                        );
                        const currentIndex = triggers.indexOf(event.currentTarget);
                        const direction = event.key === "ArrowDown" ? 1 : -1;
                        const nextIndex = Math.min(
                          triggers.length - 1,
                          Math.max(0, currentIndex + direction),
                        );
                        triggers[nextIndex]?.focus();
                      }}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 md:gap-3"
                      aria-label={`Open ${player.player_name} ${selectedStat} details`}
                    >
                      <span className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0D1828] md:h-9 md:w-9">
                        <PlayerHeadshotImage
                          playerId={player.player_id}
                          width={40}
                          height={30}
                          alt=""
                          priority={index === 0}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-semibold text-slate-100">{player.player_name}</span>
                          {player.position && <span className="rounded border border-white/[0.08] px-1 text-[9px] font-mono text-slate-400">{player.position}</span>}
                          {injuryStatus && (
                            <span className={`rounded border px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest ${INJURY_STYLES[injuryStatus] || "border-slate-500/30 bg-slate-500/15 text-slate-300"}`}>
                              {injuryStatus === "Day-To-Day" ? "DTD" : injuryStatus}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-mono">
                          <span className="font-bold text-orange-400">{player.team}</span>
                          <span className="text-slate-500">vs</span>
                          <span className="text-slate-400">{player.opponent}</span>
                        </span>
                      </span>
                    </button>
                    <FavoriteButton
                      isFavorite={favorite}
                      playerName={player.player_name}
                      disabled={!favoritesLoaded}
                      onClick={() => onToggleFavorite(player, selectedStat, roundToBettingLine(prop?.avg), player.game)}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-[13px] font-black font-mono text-white">{prop?.avg != null ? roundToBettingLine(prop.avg).toFixed(1) : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`block text-[11px] font-mono font-bold ${player.matchupLabel.color}`}>{player.matchupLabel.label}</span>
                  {player.matchupRank != null && <span className="block text-[9px] font-mono text-slate-400">#{player.matchupRank} allowed</span>}
                </td>
                {PERIODS.map((period) => {
                  const hitRate = prop?.[period]?.hit_rate;
                  const games = prop?.[period]?.games;
                  return (
                    <td key={period} className="px-4 py-3 text-right last:pr-6">
                      <span className={`block text-[13px] font-black font-mono ${hitRateColor(hitRate)}`}>{hitRate != null ? `${hitRate}%` : "N/A"}</span>
                      {games != null && games > 0 && <span className="block text-[9px] font-mono text-slate-400">{games}g</span>}
                    </td>
                  );
                })}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {visibleRows < enrichedProps.length && (
        <div className="sticky bottom-0 left-0 z-30 flex justify-center border-t border-white/[0.08] bg-[#0D1828]/95 px-4 py-3 backdrop-blur md:min-w-[860px]">
          <button
            type="button"
            onClick={() => onLoadMore(Math.min(visibleRows + INITIAL_VISIBLE_ROWS, enrichedProps.length))}
            className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-5 py-2.5 text-[11px] font-mono font-bold uppercase tracking-wider text-orange-300 hover:bg-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            Load more ({enrichedProps.length - visibleRows} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
