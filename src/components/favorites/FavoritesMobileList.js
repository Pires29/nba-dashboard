"use client";

import Image from "next/image";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });

export default function FavoritesMobileList({
  favorites,
  mutating,
  onOpen,
  onRemove,
  onToggleSelect,
  selectMode,
  selected,
}) {
  return (
    <div className="grid gap-3 md:hidden">
      {favorites.map((favorite) => {
        const isSelected = selected.has(favorite.id);
        return (
          <article key={favorite.id} className={`rounded-xl border p-4 ${isSelected ? "border-orange-500/40 bg-orange-500/5" : "border-white/[0.08] bg-[#0D1828]"}`}>
            <div className="flex items-center gap-3">
              {selectMode && (
                <input
                  type="checkbox"
                  aria-label={`Select ${favorite.playerName} ${favorite.stat}`}
                  checked={isSelected}
                  onChange={() => onToggleSelect(favorite.id)}
                  className="h-5 w-5 accent-orange-500"
                />
              )}
              <button type="button" onClick={() => selectMode ? onToggleSelect(favorite.id) : onOpen(favorite)} className="flex min-w-0 flex-1 items-center gap-3 rounded text-left focus:outline-none focus:ring-2 focus:ring-orange-500/40">
                <span className="h-10 w-10 overflow-hidden rounded-lg border border-white/[0.08] bg-[#060E1A]">
                  <Image src={`https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${favorite.playerId}.png`} alt="" width={40} height={40} className="h-full w-full object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-white">{favorite.playerName}</span>
                  <span className="mt-1 block text-[10px] font-mono text-slate-400">{favorite.team} · {favorite.stat.toUpperCase()}</span>
                </span>
              </button>
              <span className="text-right">
                <span className="block text-base font-black font-mono text-white">{favorite.avg?.toFixed(1) ?? "—"}</span>
                <span className="block text-[9px] font-mono text-slate-400">{formatDate(favorite.createdAt)}</span>
              </span>
            </div>
            {!selectMode && (
              <button type="button" disabled={mutating} onClick={() => onRemove(favorite)} className="mt-3 w-full rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-red-300 disabled:opacity-50">
                Remove favorite
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}
