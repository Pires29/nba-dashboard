import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "../../prisma/prismaClient";
import { checkRateLimit } from "@/lib/rateLimit";
import { isValidEmail, normalizeEmail } from "@/lib/security";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = normalizeEmail(credentials.email);
        if (!isValidEmail(email) || credentials.password.length > 128) return null;

        const forwarded = req?.headers?.["x-forwarded-for"];
        const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
        const rateLimit = checkRateLimit(`login:${ip ?? "unknown"}:${email}`, {
          limit: 10,
          windowMs: 15 * 60 * 1000,
        });
        if (!rateLimit.allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const email = normalizeEmail(user.email);
      if (!isValidEmail(email)) return false;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            name: user.name,
            email,
            image: user.image,
          },
        });
      }

      return true;
    },

    async session({ session }) {
      const email = normalizeEmail(session.user?.email);
      if (!isValidEmail(email)) return session;
      const dbUser = await prisma.user.findUnique({
        where: { email },
      });

      if (dbUser) {
        const planExpired =
          dbUser.plan === "pro" &&
          dbUser.planInterval === "season" &&
          dbUser.planRenewsAt &&
          dbUser.planRenewsAt <= new Date();

        if (planExpired) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { plan: "free", planRenewsAt: null, planInterval: null },
          });
        }

        session.user.id = dbUser.id;
        session.user.plan = planExpired ? "free" : (dbUser.plan ?? "free");
        session.user.planRenewsAt = planExpired
          ? null
          : (dbUser.planRenewsAt ?? null);
        session.user.planInterval = planExpired ? null : dbUser.planInterval;
      }

      return session;
    },
  },
};
