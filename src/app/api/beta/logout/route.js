import { NextResponse } from "next/server";
import { BETA_REDEMPTION_COOKIE_NAME } from "@/lib/betaAccess";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(BETA_REDEMPTION_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
