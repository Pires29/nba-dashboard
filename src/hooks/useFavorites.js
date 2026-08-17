"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function useFavorites({ enabled = true } = {}) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [mutating, setMutating] = useState(false);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Unable to load favorites");
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch favorites", error);
      setError("We couldn't load your favorites.");
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled || hasLoaded) return;

    fetchFavorites();
  }, [enabled, fetchFavorites, hasLoaded]);

  const isFavorite = useCallback(
    (playerId, stat) =>
      favorites.some((f) => f.playerId === playerId && f.stat === stat),
    [favorites],
  );

  const addFavorite = useCallback(
    async ({ playerId, playerName, team, stat, avg, gameDate }) => {
      setMutating(true);
      setError(null);
      try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          playerName,
          team,
          stat,
          avg,
          gameDate,
        }),
      });
      if (res.ok) {
        const newFav = await res.json();
        setFavorites((prev) => [newFav, ...prev]);
        toast.success(`${playerName} added to favorites`, {
          description: `${stat.toUpperCase()} · ${avg?.toFixed(1) ?? "—"}`,
        });
      } else throw new Error("Unable to add favorite");
      } catch (mutationError) {
        console.error("Failed to add favorite", mutationError);
        setError("The favorite wasn't saved. Please try again.");
        toast.error("Failed to add favorite");
      } finally {
        setMutating(false);
      }
    },
    [],
  );

  const removeFavorite = useCallback(
    async (playerId, stat) => {
      const fav = favorites.find(
        (f) => f.playerId === playerId && f.stat === stat,
      );
      if (!fav) return;
      setMutating(true);
      setError(null);
      try {
      const res = await fetch(`/api/favorites/${fav.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFavorites((prev) =>
          prev.filter((f) => !(f.playerId === playerId && f.stat === stat)),
        );
        toast(`${fav.playerName} removed from favorites`, {
          description: `${stat.toUpperCase()}`,
        });
      } else throw new Error("Unable to remove favorite");
      } catch (mutationError) {
        console.error("Failed to remove favorite", mutationError);
        setError("The favorite wasn't removed. Please try again.");
        toast.error("Failed to remove favorite");
      } finally {
        setMutating(false);
      }
    },
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (player, stat, avg, gameInfo) => {
      if (!hasLoaded) await fetchFavorites();

      if (isFavorite(player.player_id, stat)) {
        await removeFavorite(player.player_id, stat);
      } else {
        await addFavorite({
          playerId: player.player_id,
          playerName: player.player_name,
          team: player.team,
          stat,
          avg,
          gameDate: gameInfo?.date ?? null,
        });
      }
    },
    [hasLoaded, fetchFavorites, isFavorite, addFavorite, removeFavorite],
  );

  const clearFavorites = useCallback(
    async (ids) => {
      const toDelete = ids ?? favorites.map((f) => f.id);
      if (!toDelete.length) return;
      setMutating(true);
      setError(null);
      try {
      const res = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: toDelete }),
      });

      if (res.ok) {
        setFavorites((prev) =>
          ids ? prev.filter((f) => !ids.includes(f.id)) : [],
        );
        toast(
          ids
            ? `${ids.length} favorite(s) removed`
            : "All favorites removed",
        );
      } else throw new Error("Unable to remove favorites");
      } catch (mutationError) {
        console.error("Failed to clear favorites", mutationError);
        setError("The selected favorites weren't removed. Please try again.");
        toast.error("Failed to remove favorites");
      } finally {
        setMutating(false);
      }
    },
    [favorites],
  );

  return {
    favorites,
    loading,
    error,
    mutating,
    hasLoaded,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    fetchFavorites,
  };
}
