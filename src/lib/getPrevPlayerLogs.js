import allPlayerLogs from "@/app/data/game_logs_prev.json";

export default function getPrevPlayerLogs(playerId) {
  return allPlayerLogs?.[String(playerId)] ?? [];
}
