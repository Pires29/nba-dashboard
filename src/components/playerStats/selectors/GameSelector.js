"use client";

import { useRouter } from "next/navigation";
import { hasProAccess } from "@/lib/permissions";

const buildGameValue = (game) =>
  `${game.date}-${game.home_team_id}-${game.visitor_team_id}`;

const GameSelector = ({ plan, team1Id, team2Id, games, teams }) => {
  const router = useRouter();
  const isPro = hasProAccess(plan);
  const hasGamesData = games !== null && games !== undefined;
  const hasTeamsData = teams !== null && teams !== undefined;
  const hasGames = games?.length > 0;

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
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex-1 truncate">
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

  const teamMap = teams ?? {};
  const selectedGame =
    games.find(
      (g) =>
        Number(g.home_team_id) === team1Id &&
        Number(g.visitor_team_id) === team2Id,
    ) ?? null;

  return (
    <label className="block">
      <span className="sr-only">Select game</span>
      <select
        aria-label="Select game"
        value={selectedGame ? buildGameValue(selectedGame) : ""}
        onChange={(event) => {
          const game = games.find(
            (item) => buildGameValue(item) === event.target.value,
          );
          if (!game) return;
          router.push(
            `/playersStats?team1Id=${game.home_team_id}&team2Id=${game.visitor_team_id}`,
          );
        }}
        className="w-full rounded-lg border border-white/[0.06] bg-[#0D1828] px-3 py-3 text-[11px] font-mono font-bold text-slate-300 outline-none transition-colors hover:border-orange-500/30 focus:border-orange-500/40"
      >
        <option value="" disabled>
          Select game
        </option>
        {games.map((game) => {
          const gameId = buildGameValue(game);
          const homeName = teamMap[game.home_team_id]?.split(" ").pop();
          const awayName = teamMap[game.visitor_team_id]?.split(" ").pop();
          return (
            <option key={gameId} value={gameId}>
              {homeName} vs {awayName} · {game.status}
            </option>
          );
        })}
      </select>
    </label>
  );
};

export default GameSelector;
