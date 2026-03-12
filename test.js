// test.js
import 'dotenv/config';
import prisma from "./prisma/prismaClient.js";

async function main() {
  const users = await prisma.user.findMany();
  console.log(users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
