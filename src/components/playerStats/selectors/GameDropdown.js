import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const GameDropdown = ({ plan, team1Id, team2Id, games, teams, onSelect }) => {
  const [selectedGame, setSelectedGame] = useState(() => {
    if (!team1Id || !team2Id) return "";
    const match = games?.find(
      (g) =>
        Number(g.home_team_id) === team1Id &&
        Number(g.visitor_team_id) === team2Id,
    );
    return match
      ? `${match.date}-${match.home_team_id}-${match.visitor_team_id}`
      : "";
  });
  const isPro = plan === "pro";
  const hasGames = games?.length > 0;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isPro || !hasGames) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#060E1A] opacity-60">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex-1">
          {!isPro ? "Upgrade to Pro" : "No games today"}
        </span>
        {!isPro && (
          <span className="px-1.5 py-0.5 rounded border border-orange-500/30 bg-orange-500/10 text-orange-400 text-[9px] font-mono font-bold uppercase">
            Pro
          </span>
        )}
      </div>
    );
  }

  const teamMap = teamNameMap
  const selectedGameObj = games.find(
    (g) => `${g.date}-${g.home_team_id}-${g.visitor_team_id}` === selectedGame,
  );

  const handleSelect = (game) => {
    const gameId = `${game.date}-${game.home_team_id}-${game.visitor_team_id}`;
    setSelectedGame(gameId);
    setOpen(false);
    onSelect?.(game);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 h-10.5 rounded-lg border border-white/[0.08] bg-[#060E1A] hover:border-orange-500/30 transition-all"
      >
        <div className="flex-1 text-left min-w-0">
          {selectedGameObj ? (
            <div className="flex items-center gap-1.5">
              <Image
                src={`https://cdn.nba.com/logos/nba/${selectedGameObj.home_team_id}/global/L/logo.svg`}
                alt=""
                width={16}
                height={16}
                className="w-4 h-4 object-contain flex-shrink-0"
              />
              <span className="text-[11px] font-mono text-slate-300 font-bold">
                {teamMap[selectedGameObj.home_team_id]?.split(" ").pop()}
              </span>
              <span className="text-[9px] text-slate-600 font-mono">vs</span>
              <Image
                src={`https://cdn.nba.com/logos/nba/${selectedGameObj.visitor_team_id}/global/L/logo.svg`}
                alt=""
                width={16}
                height={16}
                className="w-4 h-4 object-contain flex-shrink-0"
              />
              <span className="text-[11px] font-mono text-slate-300 font-bold">
                {teamMap[selectedGameObj.visitor_team_id]?.split(" ").pop()}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
              Select game
            </span>
          )}
        </div>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="#475569"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 bottom-full mb-1 z-50 rounded-xl border border-white/[0.08] bg-[#0D1828] shadow-[0_-8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="px-3 py-2 border-b border-white/[0.04]">
            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
              Today&apos;s Games
            </p>
          </div>
          <div className="max-h-[180px] overflow-y-auto">
            {games.map((game) => {
              const gameId = `${game.date}-${game.home_team_id}-${game.visitor_team_id}`;
              const isSelected = gameId === selectedGame;
              return (
                <button
                  key={gameId}
                  onClick={() => handleSelect(game)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 transition-colors border-b border-white/[0.03] last:border-0
                    ${isSelected ? "bg-orange-500/10" : "hover:bg-white/[0.03]"}`}
                >
                  <Image
                    src={`https://cdn.nba.com/logos/nba/${game.home_team_id}/global/L/logo.svg`}
                    alt=""
                    width={16}
                    height={16}
                    className="w-4 h-4 object-contain"
                  />
                  <span className="text-[11px] font-mono text-slate-300 font-bold">
                    {teamMap[game.home_team_id]?.split(" ").pop()}
                  </span>
                  <span className="text-[9px] text-slate-600 font-mono">
                    vs
                  </span>
                  <Image
                    src={`https://cdn.nba.com/logos/nba/${game.visitor_team_id}/global/L/logo.svg`}
                    alt=""
                    width={16}
                    height={16}
                    className="w-4 h-4 object-contain"
                  />
                  <span className="text-[11px] font-mono text-slate-300 font-bold">
                    {teamMap[game.visitor_team_id]?.split(" ").pop()}
                  </span>
                  <span className="ml-auto text-[9px] font-mono text-slate-600">
                    {game.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDropdown;
