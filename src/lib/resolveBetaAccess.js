import { isClosedBetaEnabled } from "./betaAccess.js";
import { userHasBetaAccess } from "./betaUserAccess.js";

// The database-backed session is the authority for account access. A valid
// cookie remains useful for anonymous visitors and for linking pre-login
// access to an account on its next authenticated request.
export async function resolveBetaAccess(session) {
  if (!isClosedBetaEnabled()) return true;
  return userHasBetaAccess(session?.user);
}
