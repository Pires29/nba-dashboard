import { PrismaClient } from "../src/generated/prisma/index.js"; // usa o caminho certo para o generated

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient();
}

prisma = global.prisma;

export default prisma;