"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function useFavorites({ enabled = true } = {}) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [hasLoaded, setHasLoaded] = useState(false);

  const cleanupExpiredFavorites = useCallback(async (favoritesToCheck) => {
    const now = new Date();

    const expired = favoritesToCheck.filter((fav) => {
      if (!fav.gameDate) return false;
      const gameDay = new Date(fav.gameDate);
      // Considera expirado se o dia do jogo já passou (comparação por dia, não hora)
      gameDay.setHours(23, 59, 59, 999);
      return now > gameDay;
    });

    if (!expired.length) return;

    await Promise.all(
      expired.map((fav) =>
        fetch(`/api/favorites/${fav.id}`, { method: "DELETE" }),
      ),
    );

    setFavorites((prev) =>
      prev.filter((f) => !expired.some((e) => e.id === f.id)),
    );
  }, []);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        await cleanupExpiredFavorites(data); // <-- cleanup antes de setar
        setFavorites(
          data.filter((fav) => {
            if (!fav.gameDate) return true;
            const gameDay = new Date(fav.gameDate);
            gameDay.setHours(23, 59, 59, 999);
            return new Date() <= gameDay;
          }),
        );
      }
    } catch (error) {
      console.error("Failed to fetch favorites", error);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, [cleanupExpiredFavorites]);

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
        toast.success(`${playerName} adicionado aos favoritos`, {
          description: `${stat.toUpperCase()} · ${avg?.toFixed(1) ?? "—"}`,
        });
      } else {
        toast.error("Erro ao adicionar favorito");
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

      const res = await fetch(`/api/favorites/${fav.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFavorites((prev) =>
          prev.filter((f) => !(f.playerId === playerId && f.stat === stat)),
        );
        toast(`${fav.playerName} removido dos favoritos`, {
          description: `${stat.toUpperCase()}`,
        });
      } else {
        toast.error("Erro ao remover favorito");
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
            ? `${ids.length} favorito(s) removido(s)`
            : "Todos os favoritos removidos",
        );
      } else {
        toast.error("Erro ao remover favoritos");
      }
    },
    [favorites],
  );

  return {
    favorites,
    loading,
    hasLoaded,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    fetchFavorites,
  };
}
