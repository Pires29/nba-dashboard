import { getRequestIp, RequestError } from "@/lib/security";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function shouldEnforceBotProtection() {
  return process.env.NODE_ENV === "production" && Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyBotToken(req, token) {
  if (!shouldEnforceBotProtection()) return;

  if (typeof token !== "string" || !token) {
    throw new RequestError("Bot verification required", 403);
  }

  const formData = new FormData();
  formData.set("secret", process.env.TURNSTILE_SECRET_KEY);
  formData.set("response", token);
  formData.set("remoteip", getRequestIp(req));

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new RequestError("Bot verification unavailable", 503);
  }

  const result = await response.json();
  if (!result.success) {
    throw new RequestError("Bot verification failed", 403);
  }
}
