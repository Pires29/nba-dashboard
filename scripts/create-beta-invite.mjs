import { config } from "dotenv";

config({ path: process.env.BETA_ENV_FILE || ".env.local" });

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run beta:invite -- person@example.com");
  process.exit(1);
}

const [{ default: prisma }, { createBetaInvite }] = await Promise.all([
  import("../prisma/prismaClient.js"),
  import("../src/lib/betaInvites.js"),
]);

try {
  const invite = await createBetaInvite(email, { db: prisma });
  console.log(`Email: ${invite.email}`);
  console.log(`Code: ${invite.code}`);
  console.log(`Expires: ${invite.expiresAt.toISOString()}`);
  console.log("Send the code now; it is not stored in readable form.");
} finally {
  await prisma.$disconnect();
}
