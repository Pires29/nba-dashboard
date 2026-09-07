import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import {
  BETA_COOKIE_NAME,
  isClosedBetaEnabled,
  isValidBetaAccessToken,
} from "@/lib/betaAccess";

export async function proxy(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  if (isClosedBetaEnabled()) {
    const betaAccessToken = req.cookies.get(BETA_COOKIE_NAME)?.value;
    const hasBetaAccess = await isValidBetaAccessToken(betaAccessToken);

    if (!hasBetaAccess) {
      const betaUrl = new URL("/", req.url);
      betaUrl.searchParams.set("beta", "required");
      betaUrl.searchParams.set(
        "callbackUrl",
        `${req.nextUrl.pathname}${req.nextUrl.search}`,
      );
      return NextResponse.redirect(betaUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/playersStats/:path*",
    "/props/:path*",
    "/favorites/:path*",
    "/settings/:path*",
    "/qa/:path*",
  ],
};
