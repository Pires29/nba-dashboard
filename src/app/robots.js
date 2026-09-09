const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
const appPhase = process.env.APP_PHASE || process.env.NEXT_PUBLIC_APP_PHASE;
const vercelEnv = process.env.VERCEL_ENV;
const shouldBlockAll =
  appPhase === "beta" ||
  appEnv === "preview" ||
  appEnv === "qa" ||
  appEnv === "test" ||
  vercelEnv === "preview";

export default function robots() {
  if (shouldBlockAll) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/verify-request",
        "/props",
        "/playersStats",
        "/favorites",
        "/settings",
        "/qa",
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
