import { create } from 'zustand';
import { api, ensureAnonId, QuotaError } from '@/lib/apiClient';
import { kvGet, kvSet } from '@/lib/localDb';

export interface QuotaStatus {
  tier: 'anonymous' | 'pro' | 'premium';
  limit: number | null;
  used: number;
  remaining: number | null;
  windowHours: number;
  resetsAt: string | null;
  unlimited: boolean;
}

const BLOCK_KEY = 'quota.blockedUntil';

interface QuotaState {
  quota: QuotaStatus | null;
  blockedUntil: string | null;
  modalOpen: boolean;
  ready: boolean;

  bootstrap: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Spend one credit. Returns true if allowed, false if the quota gate fired. */
  consume: (kind?: 'analysis' | 'clean') => Promise<boolean>;
  openModal: () => void;
  closeModal: () => void;
  clearBlock: () => void;
}

function isBlocked(until: string | null): boolean {
  return until != null && new Date(until).getTime() > Date.now();
}

export const useQuotaStore = create<QuotaState>((set, get) => ({
  quota: null,
  blockedUntil: null,
  modalOpen: false,
  ready: false,

  bootstrap: async () => {
    const stored = await kvGet<string>(BLOCK_KEY);
    set({ blockedUntil: isBlocked(stored) ? stored : null });
    if (!isBlocked(stored) && stored) await kvSet(BLOCK_KEY, null);
    try {
      await ensureAnonId();
    } catch {
      /* offline — quota calls will retry */
    }
    await get().refresh();
    set({ ready: true });
  },

  refresh: async () => {
    try {
      const quota = await api.get<QuotaStatus>('/scans/quota');
      set({ quota });
      if (quota.unlimited || (quota.remaining ?? 0) > 0) {
        if (get().blockedUntil) {
          set({ blockedUntil: null });
          await kvSet(BLOCK_KEY, null);
        }
      }
    } catch {
      /* keep last known quota */
    }
  },

  consume: async (kind = 'analysis') => {
    if (isBlocked(get().blockedUntil)) {
      set({ modalOpen: true });
      return false;
    }
    try {
      const quota = await api.post<QuotaStatus>('/scans/consume', { kind });
      set({ quota });
      return true;
    } catch (err) {
      if (err instanceof QuotaError) {
        const until = err.resetsAt;
        set({ blockedUntil: until, modalOpen: true });
        await kvSet(BLOCK_KEY, until);
        await get().refresh();
        return false;
      }
      throw err;
    }
  },

  openModal: () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),
  clearBlock: () => {
    set({ blockedUntil: null });
    void kvSet(BLOCK_KEY, null);
  },
}));
