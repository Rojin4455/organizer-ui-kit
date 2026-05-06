/** OAuth-style param App2 passes so App1 can return user with an SSO code. */
export const SSO_REDIRECT_URI_PARAM = 'redirect_uri';

/** sessionStorage — survives /login → /signup navigation when query string would be dropped. */
export const SSO_REDIRECT_URI_STORAGE_KEY = 'sso_redirect_uri';

/** Prefer current URL param, then sessionStorage (set after visiting login with `?redirect_uri=`). */
export function getPendingSsoRedirectUri(searchParams: URLSearchParams): string | null {
  const q = searchParams.get(SSO_REDIRECT_URI_PARAM);
  if (q) return q;
  try {
    return sessionStorage.getItem(SSO_REDIRECT_URI_STORAGE_KEY);
  } catch {
    return null;
  }
}
