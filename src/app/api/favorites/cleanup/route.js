export const runtime = "nodejs";

import prisma from "../../../../../prisma/prismaClient";
import getProps from "@/lib/getProps";

export async function DELETE(req) {
  // Verifica secret para não ser chamada por qualquer pessoa
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
