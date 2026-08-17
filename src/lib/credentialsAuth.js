import bcrypt from "bcryptjs";
import prisma from "../../prisma/prismaClient.js";
import { checkRateLimit } from "./rateLimit.js";
import { isValidEmail, normalizeEmail } from "./security.js";

export async function authorizeCredentials(
  credentials,
  req,
  { db = prisma, comparePassword = bcrypt.compare, rateLimit = checkRateLimit } = {},
) {
  if (!credentials?.email || !credentials?.password) return null;

  const email = normalizeEmail(credentials.email);
  if (!isValidEmail(email) || credentials.password.length > 128) return null;

  const forwarded = req?.headers?.["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  const limit = await rateLimit(`login:${ip ?? "unknown"}:${email}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.allowed) return null;

  const user = await db.user.findUnique({ where: { email } });
  if (!user?.password) return null;
  if (!(await comparePassword(credentials.password, user.password))) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}
