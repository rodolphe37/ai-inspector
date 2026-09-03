import { create } from 'zustand';
import type { Analysis } from '@/types/analysis';
import mockAnalyses from '@/data/mockAnalyses.json';

interface HistoryState {
  items: Analysis[];
  filter: 'all' | 'clean' | 'signals' | 'inconclusive';
  search: string;
  setFilter: (filter: HistoryState['filter']) => void;
  setSearch: (search: string) => void;
  load: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  items: mockAnalyses as unknown as Analysis[],
  filter: 'all',
  search: '',
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),
  load: () => set({ items: mockAnalyses as unknown as Analysis[] }),
}));
