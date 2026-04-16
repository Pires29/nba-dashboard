import { getAvailablePlayers } from "@/lib/getAvailablePlayers";
import getPlayerLogs from "@/lib/getPlayerLogs";
import getPrevPlayerLogs from "@/lib/getPrevPlayerLogs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  const plan = session?.user?.plan ?? "free";
  const allowedPlayerIds = getAvailablePlayers(plan);

  const { searchParams } = new URL(req.url);
  const playerId = Number(searchParams.get("playerId"));
  const playerName = searchParams.get("playerName");

  if (!playerId || !playerName || !allowedPlayerIds.has(playerId)) {
    return NextResponse.json({ logs: [], logsPrev: [] });
  }

  const logs = getPlayerLogs().filter((p) => p.player_name === playerName);
  const logsPrev = getPrevPlayerLogs().filter(
    (p) => p.player_name === playerName,
  );

  return NextResponse.json({ logs, logsPrev });
}
