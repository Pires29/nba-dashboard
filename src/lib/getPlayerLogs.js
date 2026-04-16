import allPlayerLogs from "@/app/data/game_logs_current.json";

export default function getPlayerLogs(playerId) {
  return {
    logs: allPlayerLogs?.[String(playerId)] ?? [],
    logsPrev: [],
  };
}
