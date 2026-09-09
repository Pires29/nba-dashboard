// src/app/api/favorites/[id]/route.js
export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "../../../../../prisma/prismaClient";
import { getQaContext } from "@/lib/qa/context";
import { getQaFavorites, setQaFavorites } from "@/lib/qa/favorites";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { requireBetaApiAccess } from "@/lib/betaGate";

export async function DELETE(req, { params }) {
  const betaBlocked = await requireBetaApiAccess();
  if (betaBlocked) return betaBlocked;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimit = await checkRateLimit(`favorites:delete:${session.user.id}`, {
    limit: 60,
    windowMs: 15 * 60 * 1000,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const { id } = await params;

  if (await getQaContext()) {
    const favorites = await getQaFavorites();
    const exists = favorites.some((favorite) => favorite.id === id);
    if (!exists) return Response.json({ error: "Not found" }, { status: 404 });
    await setQaFavorites(favorites.filter((favorite) => favorite.id !== id));
    return Response.json({ success: true });
  }

  // Verify that the favorite belongs to the user
  const favorite = await prisma.favorite.findUnique({ where: { id } });
  if (!favorite || favorite.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.favorite.delete({ where: { id } });
  return Response.json({ success: true });
}
