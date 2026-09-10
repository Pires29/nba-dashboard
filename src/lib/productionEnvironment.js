function isLocalQaEnvironment({
  nextAuthUrl,
  nodeEnv,
  qaMode,
  qaAllowProductionLocal,
}) {
  if (
    nodeEnv !== "production" ||
    qaMode !== "true" ||
    qaAllowProductionLocal !== "true"
  ) {
    return false;
  }

  try {
    const hostname = new URL(nextAuthUrl).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function parseHttpsOrigin(value, name) {
  if (!value) {
    throw new Error(`${name} is required in production and must be an HTTPS origin.`);
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid HTTPS origin in production.`);
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(`${name} must be an HTTPS origin without a path, query, or fragment in production.`);
  }

  return url.origin;
}

export function getProductionEnvironment(env = process.env) {
  const nextAuthUrl = env.NEXTAUTH_URL;
  const nodeEnv = env.NODE_ENV;
  const isLocalQa = isLocalQaEnvironment({
    nextAuthUrl,
    nodeEnv,
    qaMode: env.QA_MODE,
    qaAllowProductionLocal: env.QA_ALLOW_PRODUCTION_LOCAL,
  });

  return {
    isProduction: nodeEnv === "production" && !isLocalQa,
    isLocalQa,
    nextAuthUrl,
  };
}

export function validateProductionPublicUrls(env = process.env) {
  const { isProduction } = getProductionEnvironment(env);
  if (!isProduction) return;

  const nextAuthOrigin = parseHttpsOrigin(env.NEXTAUTH_URL, "NEXTAUTH_URL");
  const appOrigin = parseHttpsOrigin(
    env.NEXT_PUBLIC_APP_URL,
    "NEXT_PUBLIC_APP_URL",
  );

  if (nextAuthOrigin !== appOrigin) {
    throw new Error(
      "NEXTAUTH_URL and NEXT_PUBLIC_APP_URL must use the same origin in production.",
    );
  }
}
