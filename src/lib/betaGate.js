import { cookies } from "next/headers";
import {
  BETA_COOKIE_NAME,
  isClosedBetaEnabled,
  isValidBetaAccessToken,
} from "@/lib/betaAccess";

export async function requireBetaApiAccess() {
  if (!isClosedBetaEnabled()) return null;

  const cookieStore = await cookies();
  const betaAccessToken = cookieStore.get(BETA_COOKIE_NAME)?.value;
  const hasBetaAccess = await isValidBetaAccessToken(betaAccessToken);

  if (hasBetaAccess) return null;

  return Response.json(
    { error: "Beta access required" },
    { status: 403 },
  );
}
