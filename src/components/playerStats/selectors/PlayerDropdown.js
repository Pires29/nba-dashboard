import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const PlayerDropdown = ({
  combinedRoster,
  selectedName,
  injuryMap,
  onSelect,
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = useMemo(() => {
    if (!query) return combinedRoster;
    return combinedRoster.filter((p) =>
      p.PLAYER.toLowerCase().includes(query.toLowerCase()),
    );
  }, [combinedRoster, query]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((p) => {
      if (!groups[p._teamLabel]) groups[p._teamLabel] = [];
      groups[p._teamLabel].push(p);
    });
    return groups;
  }, [filtered]);

  const selectedPlayer =
    combinedRoster.find((p) => p.PLAYER === selectedName) ?? null;

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Select player"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 h-[42px] rounded-lg border border-white/[0.08] bg-[#060E1A] hover:border-orange-500/30 transition-all"
      >
        {selectedPlayer && (
          <Image
            src={`https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${selectedPlayer.PLAYER_ID}.png`}
            width={24}
            height={24}
            alt={selectedPlayer.PLAYER}
            loading="lazy"
            className="h-6 w-6 rounded-full object-cover bg-white/[0.04] flex-shrink-0"
          />
        )}
        <span className="flex-1 text-left text-[12px] font-semibold text-slate-300 truncate">
          {selectedName || "Select player"}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 bottom-full mb-1 z-50 rounded-xl border border-white/[0.08] bg-[#0D1828] shadow-[0_-8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="p-2 border-b border-white/[0.06]">
            <input
              aria-label="Search player"
              autoFocus
              type="text"
              placeholder="Search player…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#060E1A] border border-white/[0.06] rounded-lg px-3 py-2 text-[12px] font-mono text-slate-300 placeholder-slate-400 outline-none focus:border-orange-500/40"
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto">
            {Object.entries(grouped).map(([teamLabel, players]) => (
              <div key={teamLabel}>
                <div className="px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.04]">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">
                    {teamLabel}
                  </span>
                </div>
                {players.map((p) => {
                  const isSelected = p.PLAYER === selectedName;
                  const injury = injuryMap[p.PLAYER];
                  return (
                    <button
                      key={p.PLAYER_ID}
                      aria-label={`Select ${p.PLAYER}`}
                      onClick={() => {
                        onSelect(p.PLAYER);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors border-b border-white/[0.03] last:border-0
                        ${isSelected ? "bg-orange-500/10" : "hover:bg-white/[0.03]"}`}
                    >
                      <Image
                        src={`https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${p.PLAYER_ID}.png`}
                        width={24}
                        height={24}
                        alt={p.PLAYER}
                        loading="lazy"
                        className="h-6 w-6 rounded-full object-cover bg-white/[0.04] flex-shrink-0"
                      />
                      <span className="text-[9px] font-mono text-slate-400 w-5 flex-shrink-0">
                        #{p.NUM}
                      </span>
                      <span
                        className={`text-[12px] font-semibold flex-1 text-left truncate ${isSelected ? "text-orange-400" : "text-slate-300"}`}
                      >
                        {p.PLAYER}
                      </span>
                      {injury && (
                        <span className="text-[8px] font-mono text-red-400 uppercase flex-shrink-0">
                          {injury === "Day-To-Day" ? "DTD" : injury}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-[11px] font-mono text-slate-400 py-6">
                No players found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDropdown;
