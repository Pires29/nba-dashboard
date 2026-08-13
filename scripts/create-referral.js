import { config } from "dotenv";
config();

import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  const partnerEmail = process.argv[2];
  const code = process.argv[3];

  if (!partnerEmail || !code) {
    console.error(
      'Uso: npx tsx scripts/create-referral.js "email@parceiro.com" "CODIGO"',
    );
    process.exit(1);
  }

  // Busca o user pelo email
  const user = await prisma.user.findUnique({
    where: { email: partnerEmail },
  });

  if (!user) {
    console.error(`❌ User with email ${partnerEmail} not found`);
    process.exit(1);
  }

  const referral = await prisma.referralCode.create({
    data: {
      partnerId: user.id,
      code: code.toUpperCase(),
    },
  });

  console.log(
    `✅ Code created: ${referral.code} for ${user.name ?? user.email}`,
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
