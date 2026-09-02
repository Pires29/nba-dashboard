"use client";

import { usePropsFavorites } from "./PropsFavoritesProvider";

export default function PropsFavoriteButton({ player, selectedStat, avg }) {
  const { hasLoaded, isFavorite, toggleFavorite } = usePropsFavorites();
  const favorite = isFavorite(player.player_id, selectedStat);

  return (
    <button
      type="button"
      aria-label={`${favorite ? "Remove" : "Add"} ${player.player_name} ${favorite ? "from" : "to"} favorites`}
      aria-pressed={favorite}
      disabled={!hasLoaded}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(player, selectedStat, avg, player.game);
      }}
      className={`flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 disabled:cursor-wait disabled:opacity-50 md:h-9 md:w-9 ${favorite ? "text-orange-400" : "text-slate-500 hover:text-slate-200"}`}
    >
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}
