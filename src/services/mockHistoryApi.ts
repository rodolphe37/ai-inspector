import type { HistoryApi } from '@/types/api';
import type { Analysis } from '@/types/analysis';
import mockAnalyses from '@/data/mockAnalyses.json';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockHistoryApi: HistoryApi = {
  async list(): Promise<Analysis[]> {
    await delay(300);
    return mockAnalyses as unknown as Analysis[];
  },

  async delete(): Promise<void> {
    await delay(200);
  },
};
