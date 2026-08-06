import PlayerStats from "@/components/playerStats/PlayerStats";
import { buildPlayerStatsPageData } from "@/lib/buildPlayerStatsPageData";
import getGamesSchedule from "@/lib/getGamesSchedule";
import getInjuries from "@/lib/getInjuries";
import getRosters from "@/lib/getRosters";
import getTeamStats from "@/lib/getTeamStats";
import getPlayerLogs from "@/lib/getPlayerLogs";
import getPrevPlayerLogs from "@/lib/getPrevPlayerLogs";

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const team1Id = Number(resolvedSearchParams.team1Id);
  const team2Id = Number(resolvedSearchParams.team2Id);
  const playerId = Number(resolvedSearchParams.playerId);
  const stat = resolvedSearchParams.stat ?? "points";

  const [
    rawRosterData,
    rawGamesSchedule,
    rawInjuries,
    rawTeamStats,
    { logs, logsPlayoffs },
    logsPrev,
  ] = await Promise.all([
    getRosters(),
    getGamesSchedule(),
    getInjuries(),
    getTeamStats(),
    playerId ? getPlayerLogs(playerId) : Promise.resolve({ logs: [] }),
    playerId ? getPrevPlayerLogs(playerId) : Promise.resolve([]),
  ]);

  const data = await buildPlayerStatsPageData({
    playerId,
    team1Id,
    team2Id,
    stat,
    rawRosterData,
    rawGamesSchedule,
    rawInjuries,
    rawTeamStats,
    playerLogs: logs,
    playerLogsPrev: logsPrev,
    playerLogsPlayoffs: logsPlayoffs,
  });

  return (
    <PlayerStats
      key={`${playerId}-${stat}`}
      plan="free"
      playerId={playerId}
      stat={stat}
      data={data}
    />
  );
}
