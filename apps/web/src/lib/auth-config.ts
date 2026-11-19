// Pure (no Cloudflare env) slice of the better-auth options, so it can be unit
// tested. Accounts are shared across the brand subdomains: one login cookie
// scoped to the parent domain, and every brand origin trusted for CSRF/redirect
// checks. In dev the cookie stays host-only so sign-in on localhost keeps working.
export const SHARED_COOKIE_DOMAIN = ".slogodle.com";

export interface AuthOptionsFragment {
  trustedOrigins: string[];
  advanced?: {
    useSecureCookies: true;
    crossSubDomainCookies: {
      enabled: true;
      domain: typeof SHARED_COOKIE_DOMAIN;
    };
  };
}

export function buildAuthOptionsFragment(
  origins: string[],
  isDev: boolean,
): AuthOptionsFragment {
  const trustedOrigins = [...origins];
  if (isDev) {
    return { trustedOrigins };
  }
  return {
    trustedOrigins,
    advanced: {
      // Pin the `__Secure-` cookie prefix: better-auth otherwise derives it from
      // baseURL, which may be unset on one deployment, giving different names.
      useSecureCookies: true,
      crossSubDomainCookies: { enabled: true, domain: SHARED_COOKIE_DOMAIN },
    },
  };
}
