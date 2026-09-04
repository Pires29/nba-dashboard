import PlayerStats from "@/components/playerStats/PlayerStats";
import { buildPlayerStatsPageData } from "@/lib/buildPlayerStatsPageData";
import { getAvailablePlayers } from "@/lib/getAvailablePlayers";
import { getCurrentSession } from "@/lib/getCurrentSession";
import LockedPlayerState from "@/components/playerStats/LockedPlayerState";
import { getNbaData, getNbaPlayerLogs } from "@/lib/nbaDataSource";

export const dynamic = "force-dynamic";

const SERVER_STARTED_AT = Date.now();

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const team1Id = Number(resolvedSearchParams.team1Id);
  const team2Id = Number(resolvedSearchParams.team2Id);
  const requestedPlayerId = Number(resolvedSearchParams.playerId);
  const stat = resolvedSearchParams.stat ?? "points";
  const session = await getCurrentSession();
  const nbaData = await getNbaData();
  const plan = session?.user?.plan ?? "free";
  const allowedPlayerIds = getAvailablePlayers(plan, nbaData);

  const rawRosterData = nbaData.rosters;
  const matchupRoster = rawRosterData.filter((player) => {
    const teamId = Number(player.TEAM_ID);
    return teamId === team1Id || teamId === team2Id;
  }).map((player) => ({
    ...player,
    _isLocked: !allowedPlayerIds.has(Number(player.PLAYER_ID)),
  }));
  const requestedRosterPlayer = matchupRoster.find(
    (player) => Number(player.PLAYER_ID) === requestedPlayerId,
  );
  const requestedPlayer = requestedRosterPlayer?._isLocked
    ? null
    : requestedRosterPlayer;
  const isPlayerLocked = Boolean(requestedRosterPlayer?._isLocked);

  const accessibleRoster = matchupRoster.filter((player) => !player._isLocked);
  const homeRoster = accessibleRoster.filter(
    (player) => Number(player.TEAM_ID) === team1Id,
  );
  const awayRoster = accessibleRoster.filter(
    (player) => Number(player.TEAM_ID) === team2Id,
  );
  const fallbackRoster = homeRoster.length ? homeRoster : awayRoster;
  const fallbackPlayer =
    fallbackRoster.find((player) => player.NUM) ?? fallbackRoster[0] ?? null;
  const playerId = Number(
    requestedRosterPlayer?.PLAYER_ID ??
      requestedPlayer?.PLAYER_ID ??
      fallbackPlayer?.PLAYER_ID ??
      0,
  );

  if (!playerId) {
    return <LockedPlayerState />;
  }

  const playerLogBundle = isPlayerLocked
    ? { logs: [], logsPrev: [], logsPlayoffs: [] }
    : await getNbaPlayerLogs(playerId);
  const rawGamesSchedule = nbaData.games;
  const rawInjuries = isPlayerLocked ? [] : nbaData.injuries;
  const rawTeamStats = isPlayerLocked ? [] : nbaData.teamStats;
  const { logs, logsPrev, logsPlayoffs } = playerLogBundle;
  const selectedTeamId = Number(
    requestedRosterPlayer?.TEAM_ID ?? requestedPlayer?.TEAM_ID ?? fallbackPlayer?.TEAM_ID,
  );
  const teammates = isPlayerLocked
    ? []
    : matchupRoster.filter(
        (rosterPlayer) =>
          Number(rosterPlayer.TEAM_ID) === selectedTeamId &&
          Number(rosterPlayer.PLAYER_ID) !== playerId,
      );
  const data = await buildPlayerStatsPageData({
    playerId,
    team1Id,
    team2Id,
    stat,
    rawRosterData: matchupRoster,
    rawGamesSchedule,
    rawInjuries,
    rawTeamStats,
    playerLogs: logs,
    playerLogsPrev: logsPrev,
    playerLogsPlayoffs: logsPlayoffs,
    teammateRoster: teammates,
  });

  return (
    <PlayerStats
      key={`${playerId}-${stat}`}
      plan={plan}
      playerId={playerId}
      stat={stat}
      data={data}
      dataStatus={{
        source: nbaData.source,
        updatedAt: nbaData.updatedAt ?? null,
        isStale: nbaData.updatedAt
          ? SERVER_STARTED_AT - new Date(nbaData.updatedAt).getTime() > 24 * 60 * 60 * 1000
          : false,
        logsAvailable: isPlayerLocked || playerLogBundle.source !== "unavailable",
      }}
      isPlayerLocked={isPlayerLocked}
      lockedPlayerName={requestedRosterPlayer?.PLAYER}
    />
  );
}
