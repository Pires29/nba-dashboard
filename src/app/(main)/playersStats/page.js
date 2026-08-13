import PlayerStats from "@/components/playerStats/PlayerStats";
import { buildPlayerStatsPageData } from "@/lib/buildPlayerStatsPageData";
import getGamesSchedule from "@/lib/getGamesSchedule";
import getInjuries from "@/lib/getInjuries";
import getRosters from "@/lib/getRosters";
import getTeamStats from "@/lib/getTeamStats";
import getPlayerLogs from "@/lib/getPlayerLogs";
import getPrevPlayerLogs from "@/lib/getPrevPlayerLogs";
import { getAvailablePlayers } from "@/lib/getAvailablePlayers";
import { getCurrentSession } from "@/lib/getCurrentSession";

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const team1Id = Number(resolvedSearchParams.team1Id);
  const team2Id = Number(resolvedSearchParams.team2Id);
  const requestedPlayerId = Number(resolvedSearchParams.playerId);
  const stat = resolvedSearchParams.stat ?? "points";
  const session = await getCurrentSession();
  const plan = session?.user?.plan ?? "free";
  const allowedPlayerIds = getAvailablePlayers(plan);

  const rawRosterData = getRosters();

  // Apply the entitlement before resolving the selected player, so restricted
  // identities and their historical logs never reach a Free user's browser.
  const allowedRosterData = rawRosterData.filter((player) =>
    allowedPlayerIds.has(Number(player.PLAYER_ID)),
  );
  const matchupRoster = allowedRosterData.filter((player) => {
    const teamId = Number(player.TEAM_ID);
    return teamId === team1Id || teamId === team2Id;
  });
  const requestedPlayer = matchupRoster.find(
    (player) => Number(player.PLAYER_ID) === requestedPlayerId,
  );
  const homeRoster = matchupRoster.filter(
    (player) => Number(player.TEAM_ID) === team1Id,
  );
  const awayRoster = matchupRoster.filter(
    (player) => Number(player.TEAM_ID) === team2Id,
  );
  const fallbackRoster = homeRoster.length ? homeRoster : awayRoster;
  const fallbackPlayer =
    fallbackRoster.find((player) => player.NUM) ?? fallbackRoster[0] ?? null;
  const playerId = Number(
    requestedPlayer?.PLAYER_ID ?? fallbackPlayer?.PLAYER_ID ?? 0,
  );

  const [
    rawGamesSchedule,
    rawInjuries,
    rawTeamStats,
    { logs, logsPlayoffs },
    logsPrev,
  ] = await Promise.all([
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
