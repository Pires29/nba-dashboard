"use client";

import AppToaster from "@/components/AppToaster";
import { useFavorites } from "@/hooks/useFavorites";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

const HIT_RATE_COLOR = (rate) => {
  if (rate == null) return "text-slate-600";
  if (rate >= 70) return "text-emerald-400";
  if (rate >= 50) return "text-yellow-400";
  return "text-red-400";
};

export default function FavoritesPage() {
  const { favorites, loading, toggleFavorite, clearFavorites } = useFavorites();
  const router = useRouter();

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

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

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-gradient-to-b from-[#0D1B2E] to-[#060E1A]">
        <p className="text-[12px] font-mono text-slate-600">Loading...</p>
      </div>
    );
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

        <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1400px] flex-1 flex-col gap-4 px-6 py-5">
        {/* Header */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-1 h-5 rounded-sm bg-orange-500" />
          <h1 className="font-mono font-black text-sm tracking-widest text-white uppercase">
            Favorites
          </h1>
          <span className="text-[10px] font-mono text-slate-600 border border-white/[0.06] rounded px-2 py-0.5">
            {favorites.length} saved
          </span>

          {favorites.length > 0 && (
            <>
              {selectMode ? (
                <>
                  <button
                    onClick={exitSelectMode}
                    className="ml-auto px-3 py-1.5 rounded-lg border border-white/[0.08] text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest hover:text-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
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
                    onClick={() => setSelectMode(true)}
                    className="ml-auto px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest hover:text-slate-200 transition-all"
                  >
                    Select
                  </button>
                  <button
                    onClick={clearFavorites}
                    className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
                  >
                    Clear all
                  </button>
                </>
              )}
            </>
          )}
        </div>

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
          <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-white/[0.06]">
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
                          <Image
                            src={`https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${fav.playerId}.png`}
                            alt={fav.playerName}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.opacity = 0.2;
                            }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(
                            {
                              player_id: fav.playerId,
                              player_name: fav.playerName,
                              team: fav.team,
                            },
                            fav.stat,
                            fav.avg,
                          );
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
        )}
        </div>
      </div>
      <AppToaster />
    </>
  );
}
