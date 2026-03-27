import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { RootState } from '../store/store';

const API_BASE = import.meta.env.VITE_API_URL || 'https://tools.advancedtaxgroup.com/api';

/**
 * SSOHandlerPage — App1 route: /sso
 *
 * If the user is already authenticated:
 *   1. Call POST /api/form/sso/issue-code/  (with Bearer token) to get a one-time code.
 *   2. Redirect the user to app2's /sso-callback?code=<uuid>.
 *
 * If not authenticated:
 *   → Forward to /login?redirect=<redirect_uri> so the user can log in first.
 *
 * The short-lived opaque code (not the JWT) travels via the URL, so no sensitive
 * data is ever exposed in browser or server logs.
 */
const SSOHandlerPage: React.FC = () => {
  const { tokens } = useSelector((state: RootState) => state.auth);
  const rehydrated = useSelector(
    (state: RootState) => state._persist?.rehydrated === true
  );
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redirectUri = searchParams.get('redirect_uri');

    if (!redirectUri) {
      navigate('/', { replace: true });
      return;
    }

    // PersistGate uses loading={null}, so auth is empty until redux-persist rehydrates.
    // Avoid sending an already-signed-in user through /login or racing issue-code without tokens.
    if (!rehydrated) {
      return;
    }

    const access =
      tokens?.access || (typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null);

    if (!access) {
      // Not logged in — send to login, preserving the redirect_uri
      navigate(`/login?redirect_uri=${encodeURIComponent(redirectUri)}`, { replace: true });
      return;
    }

    // Authenticated — ask the backend for a single-use code
    const issueCode = async () => {
      try {
        const res = await fetch(`${API_BASE}/form/sso/issue-code/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Failed to issue SSO code (${res.status})`);
        }

        const { code } = await res.json();
        // Redirect app2 with only the opaque code — no JWT in the URL
        window.location.replace(`${redirectUri}?code=${encodeURIComponent(code)}`);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'SSO failed. Please try again.'
        );
      }
    };

    issueCode();
  }, [rehydrated, tokens?.access, searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-destructive text-sm">{error}</p>
        <button className="text-primary underline text-sm" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm">Authenticating…</p>
    </div>
  );
};

export default SSOHandlerPage;
