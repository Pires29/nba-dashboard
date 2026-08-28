import GoogleProviderModule from "next-auth/providers/google";
import CredentialsProviderModule from "next-auth/providers/credentials";
import prisma from "../../prisma/prismaClient";
import { authorizeCredentials } from "@/lib/credentialsAuth";
import { enrichSessionWithUser } from "@/lib/enrichSessionWithUser";
import { isValidEmail, normalizeEmail } from "@/lib/security";
import { logWarning } from "@/lib/logger";

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
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      const email = normalizeEmail(user.email);
      if (!isValidEmail(email)) return false;
      const isVerifiedGoogleEmail =
        account?.provider === "google" && profile?.email_verified !== false;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            name: user.name,
            email,
            image: user.image,
            emailVerifiedAt: isVerifiedGoogleEmail ? new Date() : null,
          },
        });
      } else if (isVerifiedGoogleEmail && !existingUser.emailVerifiedAt) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { emailVerifiedAt: new Date() },
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      const email = normalizeEmail(user?.email ?? token.email);
      if (!isValidEmail(email)) return token;

      if (user || !token.userId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
          });
          if (dbUser) {
            token.userId = dbUser.id;
          } else if (user?.id) {
            token.userId = user.id;
          }
        } catch (error) {
          logWarning("auth_jwt_user_lookup_failed", {
            name: error?.name,
            code: error?.code,
          });
          if (!token.userId && user?.id) token.userId = user.id;
        }
      }

      return token;
    },

    async session({ session, token }) {
      const enrichedSession = await enrichSessionWithUser(session);
      if (
        !enrichedSession.user?.accountDeleted &&
        !enrichedSession.user?.id &&
        token?.userId
      ) {
        enrichedSession.user.id = token.userId;
      }
      return enrichedSession;
    },
  },
};
