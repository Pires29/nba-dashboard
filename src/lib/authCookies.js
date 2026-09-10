import {
  getProductionEnvironment,
  validateProductionPublicUrls,
} from "./productionEnvironment.js";

export function getUseSecureAuthCookies(
  nextAuthUrl = process.env.NEXTAUTH_URL,
  nodeEnv = process.env.NODE_ENV,
  environment = process.env,
) {
  const { isProduction } = getProductionEnvironment({
    ...environment,
    NEXTAUTH_URL: nextAuthUrl,
    NODE_ENV: nodeEnv,
  });

  return isProduction || nextAuthUrl?.startsWith("https://") === true;
}

validateProductionPublicUrls();

export const useSecureAuthCookies = getUseSecureAuthCookies();

export const sessionTokenCookieName = useSecureAuthCookies
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";

export const callbackUrlCookieName = useSecureAuthCookies
  ? "__Secure-next-auth.callback-url"
  : "next-auth.callback-url";

export const csrfTokenCookieName = useSecureAuthCookies
  ? "__Host-next-auth.csrf-token"
  : "next-auth.csrf-token";
