import { useEffect, useState } from 'react';
import { api, apiUrl } from '@/lib/apiClient';

interface Provider {
  id: string;
  name: string;
}

const ICONS: Record<string, string> = {
  google: 'G',
  github: '',
  microsoft: '⊞',
  facebook: 'f',
  apple: '',
  twitter: '𝕏',
  linkedin: 'in',
  discord: 'D',
};

export function OAuthButtons({ plan }: { plan: 'pro' | 'premium' }) {
  const [providers, setProviders] = useState<Provider[] | null>(null);

  useEffect(() => {
    api
      .get<{ providers: Provider[] }>('/auth/oauth/providers', { auth: false })
      .then((r) => setProviders(r.providers))
      .catch(() => setProviders([]));
  }, []);

  if (providers === null || providers.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="relative py-1 text-center">
        <span className="relative z-10 bg-surface px-2 text-xs text-subtle">or continue with</span>
        <span className="absolute left-0 right-0 top-1/2 h-px bg-border" />
      </div>
      <div className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <a
            key={p.id}
            href={apiUrl(`/auth/oauth/${p.id}/login?plan=${plan}`)}
            title={`Continue with ${p.name}`}
            aria-label={`Continue with ${p.name}`}
            className="flex flex-1 min-w-[3rem] items-center justify-center gap-2 rounded-lg border border-default px-3 py-2 text-sm font-medium text-content hover:bg-surface-2 transition-colors"
          >
            <span className="font-bold">{ICONS[p.id] || p.name[0]}</span>
            {providers.length <= 3 && <span>{p.name}</span>}
          </a>
        ))}
      </div>
    </div>
  );
}
