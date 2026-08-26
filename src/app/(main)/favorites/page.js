"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { useRouter } from "next/navigation";
import PlayerHeadshotImage from "@/components/PlayerHeadshotImage";
import { useState } from "react";
import FavoritesMobileList from "@/components/favorites/FavoritesMobileList";
import FavoritesLoadingState from "@/components/favorites/FavoritesLoadingState";

const HIT_RATE_COLOR = (rate) => {
  if (rate == null) return "text-slate-600";
  if (rate >= 70) return "text-emerald-400";
  if (rate >= 50) return "text-yellow-400";
  return "text-red-400";
};

export default function FavoritesPage() {
  const { favorites, loading, error, mutating, toggleFavorite, clearFavorites, fetchFavorites } = useFavorites();
  const router = useRouter();

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [confirmClear, setConfirmClear] = useState(false);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const removeFavorite = (favorite) =>
    toggleFavorite(
      { player_id: favorite.playerId, player_name: favorite.playerName, team: favorite.team },
      favorite.stat,
      favorite.avg,
    );

  if (loading) {
    return <FavoritesLoadingState />;
  }

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] font-sans">
        <div
          className="fixed inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(26,42,62,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,42,62,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1400px] flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => router.push("/props")}
            aria-label="Back to props"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition-colors hover:border-orange-500/35 hover:bg-orange-500/10 hover:text-orange-200"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="w-1 h-5 rounded-sm bg-orange-500" />
          <h1 className="font-mono text-[16px] font-black uppercase tracking-widest text-white">
            Favorites
          </h1>
          <span className="rounded border border-white/[0.06] px-2.5 py-1 text-[11px] font-mono text-slate-500">
            {favorites.length} saved
          </span>

          {favorites.length > 0 && (
            <>
              {selectMode ? (
                <>
                  <button
                    type="button"
                    onClick={exitSelectMode}
                    className="ml-auto px-3 py-1.5 rounded-lg border border-white/[0.08] text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest hover:text-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const ids = [...selected];
                      if (!ids.length) return;
                      await clearFavorites(ids);
                      exitSelectMode();
                    }}
                    disabled={selected.size === 0}
                    className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-30"
                  >
                    Remove ({selected.size})
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectMode(true)}
                    className="ml-auto px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest hover:text-slate-200 transition-all"
                  >
                    Select
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
                  >
                    Clear all
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {error && (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-200">
            <span>{error}</span>
            <button type="button" onClick={fetchFavorites} className="rounded-lg border border-red-400/30 px-3 py-1.5 font-bold">Retry</button>
          </div>
        )}

        {selectMode && favorites.length > 0 && (
          <button type="button" onClick={() => setSelected(selected.size === favorites.length ? new Set() : new Set(favorites.map((favorite) => favorite.id)))} className="self-start text-xs font-bold text-orange-300">
            {selected.size === favorites.length ? "Deselect all" : "Select all"}
          </button>
        )}

        {confirmClear && (
          <div role="alertdialog" aria-labelledby="clear-favorites-title" className="rounded-xl border border-red-500/30 bg-[#160d14] p-4">
            <p id="clear-favorites-title" className="font-bold text-white">Remove all favorites?</p>
            <p className="mt-1 text-xs text-slate-300">This removes all {favorites.length} saved props.</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => setConfirmClear(false)} className="rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-200">Cancel</button>
              <button type="button" disabled={mutating} onClick={async () => { await clearFavorites(); setConfirmClear(false); }} className="rounded-lg bg-red-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Remove all</button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {favorites.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1.5"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-slate-400">
                No favorites yet
              </p>
              <p className="text-[11px] font-mono text-slate-600 max-w-[220px]">
                Save props from the Props page or Player Stats to access them
                here
              </p>
              <button
                onClick={() => router.push("/props")}
                className="mt-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[11px] font-mono font-bold hover:bg-orange-500/20 transition-all"
              >
                Go to Props →
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {favorites.length > 0 && (
          <>
          <FavoritesMobileList favorites={favorites} mutating={mutating} onOpen={() => router.push("/props")} onRemove={removeFavorite} onToggleSelect={toggleSelect} selectMode={selectMode} selected={selected} />
          <div className="hidden flex-1 min-h-0 overflow-auto rounded-xl border border-white/[0.06] md:block">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#0D1828]">
                <tr className="border-b border-white/[0.06]">
                  <th className="px-4 py-3 text-[10px] font-mono text-slate-600 uppercase tracking-widest font-bold w-[280px]">
                    Player
                  </th>
                  <th className="px-4 py-3 text-[10px] font-mono text-slate-600 uppercase tracking-widest font-bold">
                    Stat
                  </th>
                  <th className="px-4 py-3 text-[10px] font-mono text-slate-600 uppercase tracking-widest font-bold text-right">
                    Line
                  </th>
                  <th className="px-4 py-3 text-[10px] font-mono text-slate-600 uppercase tracking-widest font-bold text-right">
                    Saved
                  </th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {favorites.map((fav) => (
                  <tr
                    key={fav.id}
                    onClick={() =>
                      selectMode ? toggleSelect(fav.id) : router.push(`/props`)
                    }
                    className={`border-b border-white/[0.04] transition-colors cursor-pointer group
    ${selectMode && selected.has(fav.id) ? "bg-orange-500/5" : "hover:bg-white/[0.03]"}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {selectMode && (
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
          ${selected.has(fav.id) ? "bg-orange-500 border-orange-500" : "border-white/20"}`}
                          >
                            {selected.has(fav.id) && (
                              <svg
                                width="9"
                                height="9"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M5 12l5 5L20 7"
                                  stroke="white"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                        )}
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#0D1828] border border-white/[0.06] flex-shrink-0">
                          <PlayerHeadshotImage
                            playerId={fav.playerId}
                            alt={fav.playerName}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-200 group-hover:text-white transition-colors">
                            {fav.playerName}
                          </p>
                          <span className="text-[10px] font-mono font-bold text-orange-400">
                            {fav.team}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded bg-slate-800 border border-white/[0.06] text-[10px] font-mono font-bold text-slate-300 uppercase">
                        {fav.stat}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] font-black font-mono text-white">
                        {fav.avg?.toFixed(1) ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[10px] font-mono text-slate-600">
                        {new Date(fav.createdAt).toLocaleDateString("pt-PT", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        aria-label={`Remove ${fav.playerName} ${fav.stat} from favorites`}
                        disabled={mutating}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(fav);
                        }}
                        className="w-6 h-6 flex items-center justify-center text-orange-400 hover:text-red-400 transition-colors"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
        </div>
      </div>
    </>
  );
}
