import { getAvailablePlayers } from "@/lib/getAvailablePlayers";
import getPlayerLogs from "@/lib/getPlayerLogs";
import getPrevPlayerLogs from "@/lib/getPrevPlayerLogs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  const plan = session?.user?.plan ?? "free";
  const allowedPlayerIds = getAvailablePlayers(plan);

  const { searchParams } = new URL(req.url);
  const playerId = Number(searchParams.get("playerId"));

  if (!playerId || !allowedPlayerIds.has(playerId)) {
    return NextResponse.json({ logs: [], logsPlayoffs: [], logsPrev: [] });
  }

  const { logs, logsPlayoffs } = getPlayerLogs(playerId);
  const logsPrev = getPrevPlayerLogs(playerId);

  return NextResponse.json({ logs, logsPlayoffs, logsPrev });
}
