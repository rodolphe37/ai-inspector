import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { api } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { AuthTokens } from '@/types/user';

/** Handles both OAuth (`?code=`) and magic-link (`?token=`) returns. */
export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const applyTokens = useAuthStore((s) => s.applyTokens);
  const [error, setError] = useState<string | null>(() => params.get('oauth_error'));
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || params.get('oauth_error')) return;
    ran.current = true;

    const code = params.get('code');
    const token = params.get('token');

    (async () => {
      try {
        let tokens: AuthTokens;
        if (code) {
          tokens = await api.post<AuthTokens>('/auth/oauth/exchange', { code }, { auth: false });
        } else if (token) {
          tokens = await api.post<AuthTokens>('/auth/magic/consume', { token }, { auth: false });
        } else {
          setError('Missing authentication code.');
          return;
        }
        applyTokens(tokens);
        await useSettingsStore.getState().load();
        navigate('/app', { replace: true });
      } catch {
        setError('This sign-in link is invalid or has expired.');
      }
    })();
  }, [params, applyTokens, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {error ? (
        <div className="max-w-sm text-center surface p-8">
          <div className="mx-auto w-fit p-3 rounded-2xl bg-error/10 text-error mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-muted">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          Signing you in…
        </div>
      )}
    </div>
  );
}
