// src/app/api/favorites/route.js
export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "../../../../prisma/prismaClient";

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

  const { playerId, playerName, team, stat, avg, gameDate } = await req.json();

  try {
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
        gameDate: gameDate ? new Date(gameDate) : null,
      },
    });

    return Response.json(favorite);
  } catch (error) {
    console.error("Prisma error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await req.json();

  await prisma.favorite.deleteMany({
    where: {
      id: { in: ids },
      userId: session.user.id,
    },
  });

  return Response.json({ ok: true });
}
