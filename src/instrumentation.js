export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config.js");
    return;
  }

  await import("../sentry.server.config.js");
}

export { captureRequestError as onRequestError } from "@sentry/nextjs";
