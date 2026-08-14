import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
export const QA_COOKIE = "nba_qa_scenario";
export const QA_SCENARIOS = ["regular", "no-games", "partial-data"];
export const QA_PERSONAS = ["free", "trial", "pro"];

export function isQaEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.QA_MODE === "true";
}

const getSecret = () => process.env.QA_SECRET || process.env.NEXTAUTH_SECRET || "";
const sign = (payload) => createHmac("sha256", getSecret()).update(payload).digest("base64url");

export function createQaToken(state) {
  if (!isQaEnabled() || !getSecret()) throw new Error("QA mode is not configured securely");
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function parseQaToken(token) {
  if (!isQaEnabled() || !getSecret() || typeof token !== "string") return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const state = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!QA_PERSONAS.includes(state.persona) || !QA_SCENARIOS.includes(state.scenario)) return null;
    return state;
  } catch {
    return null;
  }
}

export async function getQaContext() {
  if (!isQaEnabled()) return null;
  const store = await cookies();
  const state = parseQaToken(store.get(QA_COOKIE)?.value);
  if (!state) return null;
  const { getQaFixtures } = await import("./fixtures");
  return { ...state, data: getQaFixtures(state.scenario) };
}
