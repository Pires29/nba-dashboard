import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "../../../../../prisma/prismaClient";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json(
      { valid: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  const { code } = await req.json();

  const referral = await prisma.referralCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!referral) {
    return Response.json(
      { valid: false, error: "Código inválido" },
      { status: 400 },
    );
  }

  const alreadyUsed = await prisma.referralUse.findUnique({
    where: { referredUserId: session.user.id },
  });

  if (alreadyUsed) {
    return Response.json(
      { valid: false, error: "Já usaste um código" },
      { status: 400 },
    );
  }

  return Response.json({ valid: true, referralCodeId: referral.id });
}
