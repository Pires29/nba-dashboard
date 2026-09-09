import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  const prismaOptions = process.env.DATABASE_URL
    ? {
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      }
    : {};

  globalForPrisma.prisma = new PrismaClient(prismaOptions);
}

const prisma = globalForPrisma.prisma;

export default prisma;
