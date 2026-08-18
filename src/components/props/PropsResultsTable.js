"use client";

import PlayerHeadshotImage from "@/components/PlayerHeadshotImage";
import {
  INITIAL_VISIBLE_ROWS,
  INJURY_STYLES,
  PERIOD_LABELS,
  PERIODS,
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
      className={`flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 disabled:cursor-wait disabled:opacity-50 ${isFavorite ? "text-orange-400" : "text-slate-500 hover:text-slate-200"}`}
    >
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
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
  sortPeriod,
  totalPropsCount,
  visibleRows,
}) {
  const visibleProps = enrichedProps.slice(0, visibleRows);
  const columnCount = 3 + PERIODS.length;

  return (
    <div
      aria-busy={isUpdating}
      className={`relative min-h-0 flex-1 overflow-auto rounded-xl border border-white/[0.08] transition-opacity ${isUpdating ? "opacity-70" : "opacity-100"}`}
    >
      <table className="min-w-[860px] w-full text-left border-collapse">
        <caption className="sr-only">
          NBA player props for {selectedStat}, sorted by {sortPeriod}
        </caption>
        <thead className="sticky top-0 z-10 bg-[#0D1828]">
          <tr className="border-b border-white/[0.08]">
            <th scope="col" className="sticky left-0 z-20 w-[240px] bg-[#0D1828] px-3 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300 sm:w-[280px] sm:px-4">Player</th>
            <th scope="col" className="px-4 py-3 text-right text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">Line</th>
            <th scope="col" className="px-4 py-3 text-right text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">Matchup</th>
            {PERIODS.map((period) => (
              <th key={period} scope="col" aria-sort={sortPeriod === period ? "descending" : "none"} className="px-2 py-1 text-right">
                <button
                  type="button"
                  onClick={() => onSortPeriod(period)}
                  className={`rounded px-2 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${sortPeriod === period ? "text-orange-400" : "text-slate-300 hover:text-white"}`}
                >
                  {PERIOD_LABELS[period]}
                  {sortPeriod === period && <span className="ml-1" aria-hidden="true">↓</span>}
                </button>
              </th>
            ))}
          </tr>
        </thead>
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
                <td className="sticky left-0 z-[1] bg-[#091423] px-3 py-3 group-hover:bg-[#0d1928] sm:px-4">
                  <div className="flex items-center gap-3">
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
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                      aria-label={`Open ${player.player_name} ${selectedStat} details`}
                    >
                      <span className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0D1828]">
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
                    <td key={period} className="px-4 py-3 text-right">
                      <span className={`block text-[13px] font-black font-mono ${hitRateColor(hitRate)}`}>{hitRate != null ? `${hitRate}%` : "N/A"}</span>
                      {games != null && games > 0 && <span className="block text-[9px] font-mono text-slate-400">{games}g</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {enrichedProps.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="px-4 py-12 text-center">
                <p className="text-[12px] font-mono text-slate-300">{totalPropsCount === 0 ? "Player props are not available right now." : "No props found for the selected filters"}</p>
                {totalPropsCount > 0 && <button type="button" onClick={onClearFilters} className="mt-4 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-orange-300 hover:bg-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-500/40">Clear filters</button>}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {visibleRows < enrichedProps.length && (
        <div className="sticky bottom-0 left-0 z-30 flex min-w-[860px] justify-center border-t border-white/[0.08] bg-[#0D1828]/95 px-4 py-3 backdrop-blur">
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
