export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "../../../../../prisma/prismaClient";

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    await prisma.user.delete({
      where: { email: session.user.email },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json(
      { error: "Erro ao apagar conta" },
      { status: 500 },
    );
  }
}
