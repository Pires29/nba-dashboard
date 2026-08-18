export const runtime = "nodejs";

import NextAuthModule from "next-auth";
import { authOptions } from "@/lib/authOptions";

const NextAuth = NextAuthModule.default ?? NextAuthModule;
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
