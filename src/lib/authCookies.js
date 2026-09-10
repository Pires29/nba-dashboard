export function getUseSecureAuthCookies(
  nextAuthUrl = process.env.NEXTAUTH_URL,
  nodeEnv = process.env.NODE_ENV,
) {
  return nextAuthUrl?.startsWith("https://") ?? nodeEnv === "production";
}

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
