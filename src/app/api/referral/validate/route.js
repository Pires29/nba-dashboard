import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "../../../../../prisma/prismaClient";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json(
      { valid: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  const { code } = await req.json();

  const referral = await prisma.referralCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!referral) {
    return Response.json(
      { valid: false, error: "Invalid code" },
      { status: 400 },
    );
  }

  const alreadyUsed = await prisma.referralUse.findUnique({
    where: { referredUserId: session.user.id },
  });

  if (alreadyUsed) {
    return Response.json(
      { valid: false, error: "You have already used a code" },
      { status: 400 },
    );
  }

  return Response.json({ valid: true, referralCodeId: referral.id });
}
