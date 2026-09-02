const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
const vercelEnv = process.env.VERCEL_ENV;
const shouldBlockAll =
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
