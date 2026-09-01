import * as Sentry from "@sentry/nextjs";

export async function GET(request) {
  const configuredSecret = process.env.SENTRY_TEST_SECRET;
  const providedSecret = new URL(request.url).searchParams.get("secret");

  if (!configuredSecret || providedSecret !== configuredSecret) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const error = new Error("Sentry test error");
  Sentry.captureException(error);
  await Sentry.flush(2000);

  throw error;
}
