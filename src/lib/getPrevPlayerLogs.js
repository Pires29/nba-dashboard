import allPlayerLogs from "@/app/data/nba_active_players_game_logs_2024_25.json";

export default function getPrevPlayerLogs(playerId) {
  const playerEntry = allPlayerLogs.find((p) => p.player_id === playerId);
  return playerEntry?.games ?? [];
}