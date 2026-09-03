import { create } from 'zustand';
import type { Analysis } from '@/types/analysis';
import { historyApi } from '@/services';

interface HistoryState {
  items: Analysis[];
  loading: boolean;
  loaded: boolean;
  filter: 'all' | 'clean' | 'signals' | 'inconclusive';
  search: string;
  setFilter: (filter: HistoryState['filter']) => void;
  setSearch: (search: string) => void;
  load: () => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  filter: 'all',
  search: '',
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),

  load: async () => {
    set({ loading: true });
    try {
      const items = await historyApi.list();
      set({ items, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  remove: async (id) => {
    const prev = get().items;
    set({ items: prev.filter((i) => i.id !== id) });
    try {
      await historyApi.delete(id);
    } catch {
      set({ items: prev });
    }
  },
}));
