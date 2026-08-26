import GoogleProviderModule from "next-auth/providers/google";
import CredentialsProviderModule from "next-auth/providers/credentials";
import prisma from "../../prisma/prismaClient";
import { authorizeCredentials } from "@/lib/credentialsAuth";
import { enrichSessionWithUser } from "@/lib/enrichSessionWithUser";
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
      return enrichSessionWithUser(session);
    },
  },
};
