// src/app/api/favorites/[id]/route.js
export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "../../../../../prisma/prismaClient";

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verifica que o favorito pertence ao utilizador
  const favorite = await prisma.favorite.findUnique({ where: { id } });
  if (!favorite || favorite.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.favorite.delete({ where: { id } });
  return Response.json({ success: true });
}
