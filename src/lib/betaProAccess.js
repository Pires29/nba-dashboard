import prisma from "../../prisma/prismaClient.js";
import { normalizeEmail } from "./security.js";

export const CLOSED_BETA_CAMPAIGN_SLUG = "closed-beta-2026";
export const PRO_ACCESS = "pro_access";

function isActiveGrant(grant, now = new Date()) {
  return (
    grant?.access === PRO_ACCESS &&
    grant.status === "active" &&
    !grant.revokedAt &&
    (!grant.expiresAt || grant.expiresAt > now) &&
    (!grant.campaign?.endsAt || grant.campaign.endsAt > now)
  );
}

export function hasActiveBetaProAccess(user, now = new Date()) {
  return (user?.accessGrants ?? []).some((grant) => isActiveGrant(grant, now));
}

// Approval is intentionally email-based so it works whether the person joins
// the waitlist before or after creating an account. A revoked grant is never
// recreated here: re-grants must be an explicit operator action in Supabase.
export async function syncApprovedBetaWaitlistAccess(
  user,
  dependencies = { db: prisma },
) {
  if (!user?.id || !user?.email) return null;

  const db = dependencies.db;
  const email = normalizeEmail(user.email);
  const waitlistEntry = await db.betaWaitlist.findUnique({ where: { email } });
  if (waitlistEntry?.status !== "approved") return null;

  const campaign = await db.betaCampaign.findUnique({
    where: { slug: CLOSED_BETA_CAMPAIGN_SLUG },
  });
  const now = new Date();
  if (!campaign || (campaign.endsAt && campaign.endsAt <= now)) return null;

  const existingGrant = await db.accessGrant.findUnique({
    where: {
      userId_campaignId_access: {
        userId: user.id,
        campaignId: campaign.id,
        access: PRO_ACCESS,
      },
    },
  });

  if (existingGrant) {
    return {
      betaAccessGrantedAt: user.betaAccessGrantedAt ?? null,
      hasBetaProAccess: isActiveGrant({ ...existingGrant, campaign }, now),
    };
  }

  await db.user.updateMany({
    where: { id: user.id, betaAccessGrantedAt: null },
    data: { betaAccessGrantedAt: now },
  });
  await db.accessGrant.upsert({
    where: {
      userId_campaignId_access: {
        userId: user.id,
        campaignId: campaign.id,
        access: PRO_ACCESS,
      },
    },
    update: {},
    create: {
      userId: user.id,
      campaignId: campaign.id,
      access: PRO_ACCESS,
      notes: "Granted automatically after beta waitlist approval.",
    },
  });

  return { betaAccessGrantedAt: now, hasBetaProAccess: true };
}
