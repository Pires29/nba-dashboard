// src/app/api/favorites/route.js
export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "../../../../prisma/prismaClient";
import { getAvailablePlayers } from "@/lib/getAvailablePlayers";
import { readJson, RequestError } from "@/lib/security";
import { getNbaData } from "@/lib/nbaDataSource";

const FAVORITE_STATS = new Set([
  "points", "assists", "rebounds", "blocks", "steals", "turnovers",
  "fg3m", "pra", "pa", "pr", "ra",
]);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(favorites);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await readJson(req);
    const playerId = Number(body.playerId);
    const playerName = typeof body.playerName === "string" ? body.playerName.trim() : "";
    const team = typeof body.team === "string" ? body.team.trim().toUpperCase() : "";
    const stat = typeof body.stat === "string" ? body.stat : "";
    const avg = Number(body.avg);
    const gameDate = body.gameDate;
    const allowedPlayers = getAvailablePlayers(
      session.user.plan ?? "free",
      await getNbaData(),
    );

    if (
      !Number.isSafeInteger(playerId) ||
      !allowedPlayers.has(playerId) ||
      !playerName || playerName.length > 100 ||
      !/^[A-Z]{2,4}$/.test(team) ||
      !FAVORITE_STATS.has(stat) ||
      !Number.isFinite(avg) || avg < 0 || avg > 500
    ) {
      return Response.json({ error: "Invalid favorite" }, { status: 400 });
    }

    let parsedGameDate = null;
    if (gameDate) {
      parsedGameDate = new Date(gameDate);
      if (Number.isNaN(parsedGameDate.getTime())) {
        return Response.json({ error: "Invalid game date" }, { status: 400 });
      }
    }

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_playerId_stat: {
          userId: session.user.id,
          playerId,
          stat,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        playerId,
        playerName,
        team,
        stat,
        avg,
        gameDate: parsedGameDate,
      },
    });

    return Response.json(favorite);
  } catch (error) {
    if (error instanceof RequestError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Favorite creation failed", { code: error?.code });
    return Response.json({ error: "Unable to save favorite" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  let ids;
  try {
    ({ ids } = await readJson(req));
  } catch (error) {
    if (error instanceof RequestError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (
    !Array.isArray(ids) || ids.length > 100 ||
    ids.some((id) => typeof id !== "string" || id.length > 64)
  ) {
    return Response.json({ error: "Invalid favorite IDs" }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: {
      id: { in: ids },
      userId: session.user.id,
    },
  });

  return Response.json({ ok: true });
}
