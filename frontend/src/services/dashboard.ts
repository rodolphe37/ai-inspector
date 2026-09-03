import { api } from '@/lib/apiClient';
import { getLocalAnalysis, listLocalAnalyses } from '@/lib/localDb';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Analysis } from '@/types/analysis';
import { getCatalog } from './catalog';

export interface DashboardData {
  stats: {
    analyses: number;
    signalsDetected: number;
    cleanFiles: number;
    knownFingerprints: number;
  };
  activity: { date: string; analyses: number; signals: number }[];
  recent: Analysis[];
  scope: 'account' | 'local';
}

const SIGNAL = new Set(['possible_signal', 'signal_detected', 'c2pa_found']);

export async function getDashboard(days = 30): Promise<DashboardData> {
  if (useAuthStore.getState().status === 'authenticated') {
    const d = await api.get<{
      stats: DashboardData['stats'];
      activity: DashboardData['activity'];
      recent: Analysis[];
    }>('/dashboard');
    return { ...d, scope: 'account' };
  }

  // Anonymous: derive from IndexedDB.
  const list = await listLocalAnalyses();
  const catalog = await getCatalog().catch(() => []);
  const full = await Promise.all(list.map((a) => getLocalAnalysis(a.id)));

  const today = new Date();
  const buckets = new Map<string, { analyses: number; signals: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), { analyses: 0, signals: 0 });
  }
  for (const a of list) {
    const key = a.date.slice(0, 10);
    const b = buckets.get(key);
    if (b) {
      b.analyses += 1;
      if (SIGNAL.has(a.status)) b.signals += 1;
    }
  }

  return {
    stats: {
      analyses: list.length,
      signalsDetected: full.filter((r) => r && SIGNAL.has(r.status)).length,
      cleanFiles: list.filter((a) => a.status === 'clean').length,
      knownFingerprints: catalog.length,
    },
    activity: [...buckets.entries()].map(([date, v]) => ({ date, ...v })),
    recent: list.slice(0, 5),
    scope: 'local',
  };
}
