import allPlayerLogs from "@/app/data/game_logs_current.json";
import allPlayerPlayoffLogs from "@/app/data/game_logs_playoffs.json";

export default function getPlayerLogs(playerId) {
  return {
    logs: allPlayerLogs?.[String(playerId)] ?? [],
    logsPlayoffs: allPlayerPlayoffLogs?.[String(playerId)] ?? [],
    logsPrev: [],
  };
}
