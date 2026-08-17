// src/app/api/favorites/[id]/route.js
export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "../../../../../prisma/prismaClient";
import { getQaContext } from "@/lib/qa/context";
import { getQaFavorites, setQaFavorites } from "@/lib/qa/favorites";

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

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
