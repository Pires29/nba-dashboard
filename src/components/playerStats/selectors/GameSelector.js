import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const GameSelector = ({ plan, team1Id, team2Id, games, teams }) => {
  const router = useRouter();
  const isPro = plan === "pro";
  const hasGamesData = games !== null && games !== undefined;
  const hasTeamsData = teams !== null && teams !== undefined;
  const hasGames = games?.length > 0;
  const [selectedGame, setSelectedGame] = useState(() => {
    const match = games?.find(
      (g) =>
        Number(g.home_team_id) === team1Id &&
        Number(g.visitor_team_id) === team2Id,
    );
    return match
      ? `${match.date}-${match.home_team_id}-${match.visitor_team_id}`
      : "";
  });
  const [isOpen, setIsOpen] = useState(false);

  let message = "";
  let isLocked = false;
  if (!isPro) {
    message = "Upgrade to Pro to see games";
    isLocked = true;
  } else if (!hasGamesData || !hasTeamsData) {
    message = "Games temporarily unavailable";
  } else if (!hasGames) {
    message = "No games today";
  }

  if (!isPro || !hasGames || !hasGamesData || !hasTeamsData) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-white/[0.06] bg-[#060E1A] opacity-60 cursor-not-allowed">
        {isLocked && (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            className="text-orange-400 flex-shrink-0"
          >
            <rect
              x="3"
              y="11"
              width="18"
              height="11"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M7 11V7a5 5 0 0110 0v4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex-1 truncate">
          {message}
        </span>
        {isLocked && (
          <span className="px-1.5 py-0.5 rounded border border-orange-500/30 bg-orange-500/10 text-orange-400 text-[9px] font-mono font-bold uppercase tracking-widest flex-shrink-0">
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
    setIsOpen(false);
    router.push(
      `/playersStats?team1Id=${game.home_team_id}&team2Id=${game.visitor_team_id}`,
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 h-[42px] rounded-lg border border-white/[0.06] bg-[#0D1828] hover:border-orange-500/30 transition-all duration-200"
      >
        <div className="flex-1 flex items-center text-left min-w-0">
          {selectedGameObj ? (
            <div className="flex items-center gap-1.5">
              <Image
                src={`https://cdn.nba.com/logos/nba/${selectedGameObj.home_team_id}/global/L/logo.svg`}
                alt=""
                width={16}
                height={16}
                className="w-4 h-4 object-contain flex-shrink-0"
              />
              <span className="text-[11px] font-mono text-slate-300 font-bold truncate">
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
              <span className="text-[11px] font-mono text-slate-300 font-bold truncate">
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
          className={`flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-white/[0.06] bg-[#0D1828] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="px-3 py-2 border-b border-white/[0.04]">
            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
              Today&apos;s Games
            </p>
          </div>
          {games.map((game) => {
            const gameId = `${game.date}-${game.home_team_id}-${game.visitor_team_id}`;
            const isSelected = gameId === selectedGame;
            return (
              <button
                key={gameId}
                onClick={() => handleSelect(game)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.04] transition-colors border-b border-white/[0.03] last:border-0 ${isSelected ? "bg-orange-500/10" : ""}`}
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
                <span className="text-[9px] text-slate-600 font-mono">vs</span>
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
      )}
    </div>
  );
};

export default GameSelector;
