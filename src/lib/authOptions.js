import GoogleProviderModule from "next-auth/providers/google";
import CredentialsProviderModule from "next-auth/providers/credentials";
import prisma from "../../prisma/prismaClient";
import { authorizeCredentials } from "@/lib/credentialsAuth";
import { isValidEmail, normalizeEmail } from "@/lib/security";

const GoogleProvider = GoogleProviderModule.default ?? GoogleProviderModule;
const CredentialsProvider =
  CredentialsProviderModule.default ?? CredentialsProviderModule;

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
        return authorizeCredentials(credentials, req);
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
