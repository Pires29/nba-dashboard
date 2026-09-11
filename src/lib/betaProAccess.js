import prisma from "../../prisma/prismaClient.js";

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

export async function grantBetaProAccess(userId, dependencies = { db: prisma }) {
  if (!userId) return null;
  const db = dependencies.db;
  const campaign = await db.betaCampaign.upsert({
    where: { slug: CLOSED_BETA_CAMPAIGN_SLUG },
    update: {},
    create: {
      slug: CLOSED_BETA_CAMPAIGN_SLUG,
      name: "Closed Beta 2026",
    },
  });
  const now = new Date();
  if (campaign.endsAt && campaign.endsAt <= now) return null;

  const existingGrant = await db.accessGrant.findUnique({
    where: {
      userId_campaignId_access: {
        userId,
        campaignId: campaign.id,
        access: PRO_ACCESS,
      },
    },
  });

  if (existingGrant) {
    return isActiveGrant({ ...existingGrant, campaign }, now);
  }

  await db.accessGrant.upsert({
    where: {
      userId_campaignId_access: {
        userId,
        campaignId: campaign.id,
        access: PRO_ACCESS,
      },
    },
    update: {},
    create: {
      userId,
      campaignId: campaign.id,
      access: PRO_ACCESS,
      notes: "Granted after redeeming a beta invitation.",
    },
  });
  return true;
}
