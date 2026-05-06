import { useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { persistor, type RootState } from '../store/store';
import { clearAllAuthAndPurgeAsync } from '../utils/authLogout';
import { CROSS_APP_LOGOUT_PARAM, isCrossAppLogoutSearch } from '../constants/crossAppAuth';

/**
 * Runs after redux-persist rehydration. Clears App1 session when App2 (or a manual URL)
 * includes `?cross_app_logout=1` (also accepts `true` or empty value).
 * Any other query params (e.g. `redirect_uri` back to App2 SSO) are kept on `/login`
 * so PostAuthSsoRedirect can return the user after they sign in again.
 * useLayoutEffect runs before child useEffects so Login cannot redirect to `/` first.
 */
export function CrossAppLogoutHandler() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const rehydrated = useSelector(
    (s: RootState) => s._persist?.rehydrated === true
  );
  const ranForSearch = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (!rehydrated || !isCrossAppLogoutSearch(location.search)) return;
    if (ranForSearch.current === location.search) return;
    ranForSearch.current = location.search;

    void (async () => {
      await clearAllAuthAndPurgeAsync(dispatch, persistor);
      const next = new URLSearchParams(location.search);
      next.delete(CROSS_APP_LOGOUT_PARAM);
      const qs = next.toString();
      navigate(
        { pathname: '/login', search: qs ? `?${qs}` : '' },
        { replace: true }
      );
      ranForSearch.current = null;
    })();
  }, [rehydrated, location.search, dispatch, navigate]);

  return null;
}
