import { getCurrentSession } from "@/lib/getCurrentSession";
import { resolveBetaAccess } from "@/lib/resolveBetaAccess";

export async function requireBetaApiAccess() {
  const session = await getCurrentSession();
  if (await resolveBetaAccess(session)) return null;

  return Response.json(
    { error: "Beta access required" },
    { status: 403 },
  );
}
