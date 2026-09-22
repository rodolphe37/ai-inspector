import { create } from 'zustand';
import type { Analysis, CleaningRecord } from '@/types/analysis';
import { historyApi } from '@/services';

interface HistoryState {
  items: Analysis[];
  cleanings: CleaningRecord[];
  loading: boolean;
  loaded: boolean;
  tab: 'analyses' | 'cleanings';
  filter: 'all' | 'clean' | 'signals' | 'inconclusive';
  search: string;
  setTab: (tab: HistoryState['tab']) => void;
  setFilter: (filter: HistoryState['filter']) => void;
  setSearch: (search: string) => void;
  load: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  removeCleaning: (id: string) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  items: [],
  cleanings: [],
  loading: false,
  loaded: false,
  tab: 'analyses',
  filter: 'all',
  search: '',
  setTab: (tab) => set({ tab }),
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),

  load: async () => {
    set({ loading: true });
    try {
      const [items, cleanings] = await Promise.all([historyApi.list(), historyApi.listCleanings()]);
      set({ items, cleanings, loaded: true });
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

  removeCleaning: async (id) => {
    const prev = get().cleanings;
    set({ cleanings: prev.filter((i) => i.id !== id) });
    try {
      await historyApi.deleteCleaning(id);
    } catch {
      set({ cleanings: prev });
    }
  },
}));
