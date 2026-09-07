"use client";

const buildGameValue = (game) =>
  `${game.date}-${game.home_team_id}-${game.visitor_team_id}`;

const getTeamLabel = (teamMap, teamId) => {
  const team = teamMap?.[teamId];
  if (!team) return "";

  return team
    .split(" ")
    .filter(Boolean)
    .pop() || "";
};

const buildGameLabel = (game, teamMap) => {
  const homeName = getTeamLabel(teamMap, game.home_team_id);
  const awayName = getTeamLabel(teamMap, game.visitor_team_id);
  const matchup =
    homeName && awayName
      ? `${homeName} vs ${awayName}`
      : `${game.home_team_id ?? "Home"} @ ${game.visitor_team_id ?? "Away"}`;
  const status = game.status ? ` · ${game.status}` : "";

  return `${matchup}${status}`;
};

const GameSelector = ({ team1Id, team2Id, games, teams, onSelect, disabled }) => {
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
        (Number(g.home_team_id) === team1Id &&
          Number(g.visitor_team_id) === team2Id) ||
        (Number(g.home_team_id) === team2Id &&
          Number(g.visitor_team_id) === team1Id),
    ) ?? null;

  return (
    <label className="block">
      <span className="sr-only">Select game. Scheduled times are shown in ET.</span>
      <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#0D1828] transition-colors hover:border-orange-500/30 focus-within:border-orange-500/40">
        <div className="relative">
          <select
            aria-label="Select game. Scheduled times are shown in ET."
            value={selectedGame ? buildGameValue(selectedGame) : ""}
            onChange={(event) => {
              const game = games.find(
                (item) => buildGameValue(item) === event.target.value,
              );
              if (!game) return;
              onSelect?.(game);
            }}
            disabled={disabled}
            className="w-full appearance-none bg-[#0D1828] py-3 pl-3 pr-10 text-[11px] font-mono font-bold text-slate-300 outline-none"
          >
            <option value="" disabled>
              Select game
            </option>
            {games.map((game) => {
              const gameId = buildGameValue(game);
              return (
                <option key={gameId} value={gameId}>
                  {buildGameLabel(game, teamMap)}
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
        </div>
        <div className="border-t border-white/[0.06] px-3 py-1">
          <span className="block text-right text-[9px] font-mono uppercase tracking-widest text-slate-600">
            Times ET
          </span>
        </div>
      </div>
    </label>
  );
};

export default GameSelector;
