import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { validateReferralForUser } from "@/lib/referrals";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { readJson, RequestError } from "@/lib/security";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json(
        { valid: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const rateLimit = await checkRateLimit(`referral:${session.user.id}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const { code } = await readJson(req, { maxBytes: 1_024 });
    const result = await validateReferralForUser({ code, userId: session.user.id });

    if (!result.valid) {
      const error =
        result.reason === "ALREADY_USED"
          ? "You have already used a code"
          : "Invalid code";
      return Response.json({ valid: false, error }, { status: 400 });
    }

    return Response.json({ valid: true });
  } catch (error) {
    if (error instanceof RequestError) {
      return Response.json(
        { valid: false, error: error.message },
        { status: error.status },
      );
    }
    console.error("Referral validation failed");
    return Response.json({ valid: false, error: "Unable to validate code" }, { status: 500 });
  }
}
