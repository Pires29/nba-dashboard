const EMAIL_PATTERN = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export class RequestError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "RequestError";
    this.status = status;
  }
}

export function normalizeEmail(value) {
  return typeof value === "string" ? value.normalize("NFKC").trim().toLowerCase() : "";
}

export function isValidEmail(value) {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

export function safeInternalPath(value, fallback = "/") {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.includes("\\")) return fallback;

  try {
    const parsed = new URL(value, "http://internal.local");
    return parsed.origin === "http://internal.local"
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}

export async function readJson(req, { maxBytes = 16_384 } = {}) {
  const contentLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new RequestError("Request body too large", 413);
  }

  let text;
  try {
    text = await req.text();
  } catch {
    throw new RequestError("Unable to read request body", 400);
  }

  if (new TextEncoder().encode(text).length > maxBytes) {
    throw new RequestError("Request body too large", 413);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new RequestError("Invalid JSON body", 400);
  }
}

export function getRequestIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

