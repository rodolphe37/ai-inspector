import { create } from 'zustand';
import {
  api,
  getAccessToken,
  onAuthEvent,
  setTokens,
} from '@/lib/apiClient';
import type { AuthTokens, PlanTier, User } from '@/types/user';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  plan: PlanTier;
  initialized: boolean;

  init: () => Promise<void>;
  register: (input: {
    email: string;
    name: string;
    password: string;
    plan: 'pro' | 'premium';
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  applyTokens: (tokens: AuthTokens) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setPlan: (plan: PlanTier) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'loading',
  plan: 'anonymous',
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });

    onAuthEvent((e) => {
      if (e === 'logout') set({ user: null, status: 'anonymous', plan: 'anonymous' });
    });

    if (!getAccessToken()) {
      set({ status: 'anonymous', plan: 'anonymous' });
      return;
    }
    try {
      const user = await api.get<User>('/auth/me');
      set({ user, status: 'authenticated', plan: user.plan });
    } catch {
      setTokens(null);
      set({ user: null, status: 'anonymous', plan: 'anonymous' });
    }
  },

  register: async (input) => {
    const tokens = await api.post<AuthTokens>('/auth/register', input, { auth: false });
    get().applyTokens(tokens);
  },

  login: async (email, password) => {
    const tokens = await api.post<AuthTokens>(
      '/auth/login',
      { email, password },
      { auth: false },
    );
    get().applyTokens(tokens);
  },

  applyTokens: (tokens) => {
    setTokens(tokens);
    set({ user: tokens.user, status: 'authenticated', plan: tokens.user.plan });
  },

  logout: async () => {
    const refresh = (() => {
      try {
        return localStorage.getItem('pi.refreshToken');
      } catch {
        return null;
      }
    })();
    if (refresh) {
      await api.post('/auth/logout', { refreshToken: refresh }, { auth: false }).catch(() => {});
    }
    setTokens(null);
    set({ user: null, status: 'anonymous', plan: 'anonymous' });
  },

  refreshUser: async () => {
    if (!getAccessToken()) return;
    try {
      const user = await api.get<User>('/auth/me');
      set({ user, status: 'authenticated', plan: user.plan });
    } catch {
      /* handled by apiClient */
    }
  },

  setPlan: (plan) => set({ plan }),
}));
