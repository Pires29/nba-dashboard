import { getAvailablePlayers } from "@/lib/getAvailablePlayers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";
import { getNbaData, getNbaPlayerLogs } from "@/lib/nbaDataSource";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { getRequestIp } from "@/lib/security";
import { requireBetaApiAccess } from "@/lib/betaGate";

export async function GET(req) {
  const betaBlocked = await requireBetaApiAccess();
  if (betaBlocked) return betaBlocked;

  const session = await getServerSession(authOptions);
  const rateLimitKey = session?.user?.id
    ? `player-logs:user:${session.user.id}`
    : `player-logs:ip:${getRequestIp(req)}`;
  const rateLimit = await checkRateLimit(rateLimitKey, {
    limit: session?.user?.id ? 120 : 30,
    windowMs: 15 * 60 * 1000,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const nbaData = await getNbaData();
  const plan = session?.user?.plan ?? "free";
  const allowedPlayerIds = getAvailablePlayers(plan, nbaData);

  const { searchParams } = new URL(req.url);
  const playerId = Number(searchParams.get("playerId"));
  const teammateOfPlayerId = Number(searchParams.get("teammateOfPlayerId"));

  if (!Number.isSafeInteger(playerId) || playerId <= 0) {
    return NextResponse.json({ error: "INVALID_PLAYER_ID" }, { status: 400 });
  }
  const selectedPlayer = nbaData.rosters.find(
    (player) => Number(player.PLAYER_ID) === teammateOfPlayerId,
  );
  const isAccessibleTeammate = Number.isSafeInteger(teammateOfPlayerId) &&
    teammateOfPlayerId > 0 &&
    allowedPlayerIds.has(teammateOfPlayerId) &&
    selectedPlayer &&
    nbaData.rosters.some((player) =>
      Number(player.PLAYER_ID) === playerId &&
      Number(player.TEAM_ID) === Number(selectedPlayer.TEAM_ID),
    );

  if (!allowedPlayerIds.has(playerId) && !isAccessibleTeammate) {
    return NextResponse.json({ error: "PLAYER_LOCKED" }, { status: 403 });
  }

  const { logs, logsPlayoffs, logsPrev } = await getNbaPlayerLogs(playerId);

  return NextResponse.json({
    logs: logs.slice(0, 120),
    logsPlayoffs: logsPlayoffs.slice(0, 120),
    logsPrev: logsPrev.slice(0, 120),
  });
}
