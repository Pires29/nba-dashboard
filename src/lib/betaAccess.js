import { getLaunchConfig } from "../config/launch.js";

const BETA_COOKIE_NAME = "propinsight_beta_access";
const BETA_TOKEN_PREFIX = "v1";
const BETA_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

function isClosedBetaEnabled() {
  return getLaunchConfig().access.requiresBetaCode;
}

function getBetaSecret() {
  return process.env.BETA_ACCESS_SECRET || process.env.NEXTAUTH_SECRET || "";
}

function getAllowedBetaCodes() {
  return (process.env.BETA_ACCESS_CODES || "")
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);
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

async function signBetaAccessToken(timestamp) {
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
    new TextEncoder().encode(`beta-access:${timestamp}`),
  );
  return base64UrlEncode(signature);
}

export {
  BETA_COOKIE_MAX_AGE_SECONDS,
  BETA_COOKIE_NAME,
  getAllowedBetaCodes,
  isClosedBetaEnabled,
};

export function isValidBetaCode(value) {
  const normalizedCode = typeof value === "string" ? value.trim() : "";
  if (!normalizedCode) return false;

  return getAllowedBetaCodes().some((code) =>
    timingSafeEqual(code, normalizedCode),
  );
}

export async function createBetaAccessToken() {
  const timestamp = String(Date.now());
  const signature = await signBetaAccessToken(timestamp);
  if (!signature) return "";
  return `${BETA_TOKEN_PREFIX}.${timestamp}.${signature}`;
}

export async function isValidBetaAccessToken(value) {
  if (!isClosedBetaEnabled()) return true;
  if (typeof value !== "string") return false;

  const [prefix, timestamp, signature] = value.split(".");
  if (prefix !== BETA_TOKEN_PREFIX || !timestamp || !signature) return false;

  const issuedAt = Number(timestamp);
  if (!Number.isFinite(issuedAt)) return false;

  const maxAgeMs = BETA_COOKIE_MAX_AGE_SECONDS * 1000;
  if (Date.now() - issuedAt > maxAgeMs) return false;

  const expectedSignature = await signBetaAccessToken(timestamp);
  if (!expectedSignature) return false;
  return timingSafeEqual(expectedSignature, signature);
}
