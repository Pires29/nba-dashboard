import { createHash, randomBytes, randomUUID } from "node:crypto";
import { normalizeEmail } from "./security.js";

export const BETA_INVITE_TTL_DAYS = 14;

export function normalizeBetaInviteCode(value) {
  return typeof value === "string"
    ? value.trim().toUpperCase().replaceAll(/\s+/g, "")
    : "";
}

export function hashBetaInviteCode(value) {
  return createHash("sha256").update(normalizeBetaInviteCode(value)).digest("hex");
}

export function createBetaInviteCode() {
  const raw = randomBytes(16).toString("hex").toUpperCase();
  return `PIB-${raw.match(/.{1,4}/g).join("-")}`;
}

function isRedeemable(invite, now = new Date()) {
  return (
    invite?.status === "active" &&
    invite.waitlistStatus === "approved" &&
    new Date(invite.expiresAt) > now
  );
}

export async function findBetaInviteByCode(code, dependencies) {
  const codeHash = hashBetaInviteCode(code);
  if (!codeHash) return null;
  const [invite] = await dependencies.db.$queryRaw`
    SELECT invite."id", invite."waitlistEmail", invite."status", invite."expiresAt",
      waitlist."status" AS "waitlistStatus"
    FROM "BetaInvite" AS invite
    INNER JOIN "BetaWaitlist" AS waitlist ON waitlist."email" = invite."waitlistEmail"
    WHERE invite."codeHash" = ${codeHash}
    LIMIT 1
  `;
  return isRedeemable(invite) ? invite : null;
}

export async function findBetaInviteById(
  inviteId,
  dependencies,
  { includeUsed = false } = {},
) {
  const [invite] = await dependencies.db.$queryRaw`
    SELECT invite."id", invite."waitlistEmail", invite."status", invite."expiresAt", invite."usedByUserId",
      waitlist."status" AS "waitlistStatus"
    FROM "BetaInvite" AS invite
    INNER JOIN "BetaWaitlist" AS waitlist ON waitlist."email" = invite."waitlistEmail"
    WHERE invite."id" = ${inviteId}
    LIMIT 1
  `;
  if (isRedeemable(invite)) return invite;
  return includeUsed && invite?.status === "used" ? invite : null;
}

export async function consumeBetaInvite(inviteId, userId, dependencies) {
  const now = new Date();
  const consumed = await dependencies.db.$queryRaw`
    UPDATE "BetaInvite"
    SET "status" = 'used', "usedAt" = ${now}, "usedByUserId" = ${userId}
    WHERE "id" = ${inviteId} AND "status" = 'active'
    RETURNING "id"
  `;
  if (consumed.length === 1) return true;

  // Redeeming can be submitted twice while the browser transitions after
  // sign-in. Treat a replay by the same account as a successful, idempotent
  // confirmation; a different account must still be rejected by the caller.
  const [existingInvite] = await dependencies.db.$queryRaw`
    SELECT "status", "usedByUserId"
    FROM "BetaInvite"
    WHERE "id" = ${inviteId}
    LIMIT 1
  `;
  return (
    existingInvite?.status === "used" &&
    existingInvite.usedByUserId === userId
  );
}

export async function createBetaInvite(email, dependencies) {
  const db = dependencies.db;
  const waitlistEmail = normalizeEmail(email);
  const [waitlistEntry] = await db.$queryRaw`
    SELECT "status" FROM "BetaWaitlist" WHERE "email" = ${waitlistEmail} LIMIT 1
  `;
  if (waitlistEntry?.status !== "approved") {
    throw new Error("The waitlist email must be approved before creating an invite.");
  }

  const code = createBetaInviteCode();
  const expiresAt = new Date(Date.now() + BETA_INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();
  await db.$executeRaw`
    UPDATE "BetaInvite"
    SET "status" = 'revoked', "revokedAt" = ${now}
    WHERE "waitlistEmail" = ${waitlistEmail} AND "status" = 'active'
  `;
  await db.$executeRaw`
    INSERT INTO "BetaInvite" ("id", "waitlistEmail", "codeHash", "expiresAt")
    VALUES (${randomUUID()}, ${waitlistEmail}, ${hashBetaInviteCode(code)}, ${expiresAt})
  `;
  return { code, expiresAt, email: waitlistEmail };
}
