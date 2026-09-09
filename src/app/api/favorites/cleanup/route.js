export const runtime = "nodejs";

import prisma from "../../../../../prisma/prismaClient";
import { getFavoriteCleanupCutoff } from "@/lib/favoriteCleanup";

export async function DELETE(req) {
  // Verify the secret so this cannot be called by anyone
  const authHeader = req.headers.get("authorization");
  const cleanupSecret = process.env.CLEANUP_SECRET;
  if (!cleanupSecret || authHeader !== `Bearer ${cleanupSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await prisma.favorite.deleteMany({
    where: {
      gameDate: { lt: getFavoriteCleanupCutoff() },
    },
  });

  return Response.json({ deleted: deleted.count });
}
