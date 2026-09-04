import { getAvailablePlayers } from "@/lib/getAvailablePlayers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";
import { getNbaData, getNbaPlayerLogs } from "@/lib/nbaDataSource";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  const nbaData = await getNbaData();
  const plan = session?.user?.plan ?? "free";
  const allowedPlayerIds = getAvailablePlayers(plan, nbaData);

  const { searchParams } = new URL(req.url);
  const playerId = Number(searchParams.get("playerId"));

  if (!Number.isSafeInteger(playerId) || playerId <= 0) {
    return NextResponse.json({ error: "INVALID_PLAYER_ID" }, { status: 400 });
  }
  if (!allowedPlayerIds.has(playerId)) {
    return NextResponse.json({ error: "PLAYER_LOCKED" }, { status: 403 });
  }

  const { logs, logsPlayoffs, logsPrev } = await getNbaPlayerLogs(playerId);

  return NextResponse.json({ logs, logsPlayoffs, logsPrev });
}
