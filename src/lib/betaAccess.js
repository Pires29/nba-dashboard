import { getLaunchConfig } from "../config/launch.js";

const BETA_REDEMPTION_COOKIE_NAME = "propinsight_beta_redemption";
const BETA_REDEMPTION_TOKEN_PREFIX = "v2";
const BETA_REDEMPTION_MAX_AGE_SECONDS = 10 * 60;

function isClosedBetaEnabled() {
  return getLaunchConfig().access.requiresBetaCode;
}

function getBetaSecret() {
  return process.env.BETA_ACCESS_SECRET || process.env.NEXTAUTH_SECRET || "";
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

function base64UrlEncode(bytes) {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function signBetaToken(purpose, payload) {
  const secret = getBetaSecret();
  if (!secret) return "";

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${purpose}:${payload}`),
  );
  return base64UrlEncode(signature);
}

export {
  BETA_REDEMPTION_COOKIE_NAME,
  BETA_REDEMPTION_MAX_AGE_SECONDS,
  isClosedBetaEnabled,
};

export async function createBetaRedemptionToken(inviteId) {
  if (typeof inviteId !== "string" || !inviteId) return "";
  const timestamp = String(Date.now());
  const signature = await signBetaToken("beta-redemption", `${timestamp}:${inviteId}`);
  if (!signature) return "";
  return `${BETA_REDEMPTION_TOKEN_PREFIX}.${timestamp}.${inviteId}.${signature}`;
}

export async function readBetaRedemptionToken(value) {
  if (!isClosedBetaEnabled()) return null;
  if (typeof value !== "string") return false;

  const [prefix, timestamp, inviteId, signature] = value.split(".");
  if (prefix !== BETA_REDEMPTION_TOKEN_PREFIX || !timestamp || !inviteId || !signature) {
    return null;
  }

  const issuedAt = Number(timestamp);
  if (!Number.isFinite(issuedAt)) return null;
  if (Date.now() - issuedAt > BETA_REDEMPTION_MAX_AGE_SECONDS * 1000) {
    return null;
  }

  const expectedSignature = await signBetaToken("beta-redemption", `${timestamp}:${inviteId}`);
  if (!expectedSignature || !timingSafeEqual(expectedSignature, signature)) return null;
  return { inviteId };
}

export async function isValidBetaRedemptionToken(value) {
  return Boolean(await readBetaRedemptionToken(value));
}
