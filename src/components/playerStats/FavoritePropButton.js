"use client";

import AppToaster from "@/components/AppToaster";
import { useFavorites } from "@/hooks/useFavorites";

const FavoritePropButton = ({ playerStats, selectedStat, betLine, gameInfo }) => {
  const { hasLoaded, isFavorite, toggleFavorite } = useFavorites({
    enabled: false,
  });

  const playerObj = playerStats
    ? {
        player_id: playerStats.playerId,
        player_name: playerStats.playerName,
        team: playerStats.playerTeam,
      }
    : null;

  if (!playerObj) return null;

  const isFav = hasLoaded
    ? isFavorite(playerObj.player_id, selectedStat)
    : false;

  return (
    <>
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
      <AppToaster />
    </>
  );
};

export default FavoritePropButton;
