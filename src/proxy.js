import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import {
  sessionTokenCookieName,
  useSecureAuthCookies,
} from "@/lib/authCookies";
import {
  BETA_COOKIE_NAME,
  isClosedBetaEnabled,
  isValidBetaAccessToken,
} from "@/lib/betaAccess";

function createRedirectUrl(req, pathname) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  if (
    process.env.NODE_ENV !== "production" &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1")
  ) {
    url.protocol = "http:";
  }

  return url;
}

export async function proxy(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: sessionTokenCookieName,
    secureCookie: useSecureAuthCookies,
  });

  if (!token) {
    const loginUrl = createRedirectUrl(req, "/login");
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
      const betaUrl = createRedirectUrl(req, "/");
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
