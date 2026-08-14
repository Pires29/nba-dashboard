"use client";

import { useRouter } from "next/navigation";

const buildGameValue = (game) =>
  `${game.date}-${game.home_team_id}-${game.visitor_team_id}`;

const GameSelector = ({ team1Id, team2Id, games, teams }) => {
  const router = useRouter();
  const hasGamesData = games !== null && games !== undefined;
  const hasTeamsData = teams !== null && teams !== undefined;
  const hasGames = games?.length > 0;

  let message = "";
  if (!hasGamesData || !hasTeamsData) {
    message = "Games temporarily unavailable";
  } else if (!hasGames) {
    message = "No games today";
  }

  if (!hasGames || !hasGamesData || !hasTeamsData) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-white/[0.06] bg-[#060E1A] opacity-60 cursor-not-allowed">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex-1 truncate">
          {message}
        </span>
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
    <label className="relative block">
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
        className="w-full appearance-none rounded-lg border border-white/[0.06] bg-[#0D1828] py-3 pl-3 pr-10 text-[11px] font-mono font-bold text-slate-300 outline-none transition-colors hover:border-orange-500/30 focus:border-orange-500/40"
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
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      >
        <path
          d="m6 8 4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </label>
  );
};

export default GameSelector;
