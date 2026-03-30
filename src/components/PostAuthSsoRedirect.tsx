import { useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { RootState } from '../store/store';
import { CROSS_APP_LOGOUT_PARAM } from '../constants/crossAppAuth';
import {
  SSO_REDIRECT_URI_PARAM,
  SSO_REDIRECT_URI_STORAGE_KEY,
} from '../constants/ssoRedirect';

const AUTH_PATHS = ['/login', '/signup'];

/**
 * After login/signup with `?redirect_uri=` (App2 SSO return URL), send the user to `/sso`
 * so a code is issued and they land back on App2. Runs globally so Signup does not need
 * duplicate useEffect logic. Persists redirect_uri in sessionStorage when moving between
 * login and signup so the query string is not lost.
 *
 * useLayoutEffect runs before Login/Signup useEffects so we beat `navigate('/')`.
 */
export function PostAuthSsoRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const rehydrated = useSelector(
    (s: RootState) => s._persist?.rehydrated === true
  );
  const { isAuthenticated, user, tokens } = useSelector(
    (s: RootState) => s.auth
  );

  useLayoutEffect(() => {
    if (!rehydrated) return;

    const fromQuery = searchParams.get(SSO_REDIRECT_URI_PARAM);
    if (fromQuery) {
      try {
        sessionStorage.setItem(SSO_REDIRECT_URI_STORAGE_KEY, fromQuery);
      } catch {
        /* ignore quota */
      }
    }

    if (searchParams.has(CROSS_APP_LOGOUT_PARAM)) return;

    const redirectUri =
      fromQuery ||
      (() => {
        try {
          return sessionStorage.getItem(SSO_REDIRECT_URI_STORAGE_KEY);
        } catch {
          return null;
        }
      })();

    if (!redirectUri) return;
    if (!isAuthenticated || !tokens?.access || !tokens?.refresh) return;

    const onAuthPage = AUTH_PATHS.includes(location.pathname);
    if (!onAuthPage) return;

    if (location.pathname === '/sso') return;

    navigate(
      `/sso?${SSO_REDIRECT_URI_PARAM}=${encodeURIComponent(redirectUri)}`,
      { replace: true }
    );
  }, [
    rehydrated,
    isAuthenticated,
    tokens?.access,
    tokens?.refresh,
    location.pathname,
    location.search,
    searchParams,
    navigate,
  ]);

  return null;
}
