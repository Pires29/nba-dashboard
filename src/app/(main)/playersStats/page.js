import PlayerStats from "@/components/playerStats/PlayerStats";
import { buildPlayerStatsPageData } from "@/lib/buildPlayerStatsPageData";
import getGamesSchedule from "@/lib/getGamesSchedule";
import getInjuries from "@/lib/getInjuries";
import getRosters from "@/lib/getRosters";
import getTeamStats from "@/lib/getTeamStats";
import getPlayerLogs from "@/lib/getPlayerLogs";
import getPrevPlayerLogs from "@/lib/getPrevPlayerLogs";
import { getAvailablePlayers } from "@/lib/getAvailablePlayers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const team1Id = Number(resolvedSearchParams.team1Id);
  const team2Id = Number(resolvedSearchParams.team2Id);
  const requestedPlayerId = Number(resolvedSearchParams.playerId);
  const stat = resolvedSearchParams.stat ?? "points";
  const session = await getServerSession(authOptions);
  const plan = session?.user?.plan ?? "free";
  const allowedPlayerIds = getAvailablePlayers(plan);
  const playerId = allowedPlayerIds.has(requestedPlayerId)
    ? requestedPlayerId
    : 0;

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

  // Apply the entitlement before page data is built, so restricted player
  // identities and their historical logs never reach a Free user's browser.
  const allowedRosterData = rawRosterData.filter((player) =>
    allowedPlayerIds.has(player.PLAYER_ID),
  );

  const data = await buildPlayerStatsPageData({
    playerId,
    team1Id,
    team2Id,
    stat,
    rawRosterData: allowedRosterData,
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
      plan={plan}
      playerId={playerId}
      stat={stat}
      data={data}
    />
  );
}
