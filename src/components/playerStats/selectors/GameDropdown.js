import { hasProAccess } from "@/lib/permissions";

const buildGameValue = (game) =>
  `${game.date}-${game.home_team_id}-${game.visitor_team_id}`;

const GameDropdown = ({ plan, team1Id, team2Id, games, teams, onSelect }) => {
  const isPro = hasProAccess(plan);
  const hasGames = games?.length > 0;

  if (!isPro || !hasGames) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#060E1A] opacity-60">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex-1">
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
          onSelect?.(game);
        }}
        className="w-full rounded-lg border border-white/[0.08] bg-[#060E1A] px-3 py-3 text-[11px] font-mono font-bold text-slate-300 outline-none transition-colors hover:border-orange-500/30 focus:border-orange-500/40"
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

export default GameDropdown;
