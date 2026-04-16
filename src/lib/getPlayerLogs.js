import allPlayerLogs from "@/app/data/nba_active_players_game_logs.json";

export default function getPlayerLogs(playerId) {
  const playerEntry = allPlayerLogs.find((p) => p.player_id === playerId);
  return {
    logs: playerEntry?.games ?? [],
    logsPrev: [],
  };
}