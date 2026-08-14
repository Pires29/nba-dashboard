export const runtime = "nodejs";

import prisma from "../../../../../prisma/prismaClient";

export async function DELETE(req) {
  // Verify the secret so this cannot be called by anyone
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CLEANUP_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await prisma.favorite.deleteMany({
    where: {
      gameDate: { lt: new Date() },
    },
  });

  return Response.json({ deleted: deleted.count });
}
