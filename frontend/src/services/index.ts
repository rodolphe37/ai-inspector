import { api } from '@/lib/apiClient';
import {
  deleteLocalAnalysis,
  getLocalAnalysis,
  listLocalAnalyses,
  localSettings,
  saveLocalAnalysis,
} from '@/lib/localDb';
import { can, planFor } from '@/lib/plans';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQuotaStore } from '@/stores/useQuotaStore';
import type { AnalysisApi, FingerprintApi, HistoryApi, SettingsApi } from '@/types/api';
import type { Analysis, AnalysisResult } from '@/types/analysis';
import type { Fingerprint } from '@/types/fingerprint';
import type { UserSettings } from '@/types/settings';
import { analyzeContent, type AnalyzeInput } from '@/engine';
import { getCatalog } from './catalog';
import { PlanLimitError, QuotaBlockedError } from './errors';

const isAuthed = () => useAuthStore.getState().status === 'authenticated';

export const DEFAULT_SETTINGS: UserSettings = {
  account: { email: '', name: 'Guest', plan: 'anonymous' },
  appearance: { theme: 'dark', density: 'comfortable' },
  privacy: { localProcessing: true, storeHistory: false, telemetry: false, showDemoLabels: false },
  analysis: { detailedResults: true, showStatisticalData: true, showTechnicalInfo: false },
  notifications: { emailAlerts: false, analysisComplete: true, securityAlerts: true },
};

// --- Fingerprints ----------------------------------------------------

export const fingerprintApi: FingerprintApi = {
  list: () => getCatalog(),
  async get(id) {
    return api.get<Fingerprint>(`/fingerprints/${id}`);
  },
};

// --- History -------------------------------------------------------

export const historyApi: HistoryApi = {
  async list(): Promise<Analysis[]> {
    if (isAuthed()) {
      const rows = await api.get<
        Array<Analysis & { signalLevel: string }>
      >('/analyses');
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        date: r.date,
        status: r.status,
        score: r.score,
        size: r.size,
        language: r.language,
      }));
    }
    return listLocalAnalyses();
  },
  async delete(id: string): Promise<void> {
    if (isAuthed()) {
      await api.delete(`/analyses/${id}`);
      return;
    }
    await deleteLocalAnalysis(id);
  },
};

// --- Settings ------------------------------------------------------

export const settingsApi: SettingsApi = {
  async get(): Promise<UserSettings> {
    if (isAuthed()) return api.get<UserSettings>('/settings');
    const stored = await localSettings.get();
    return stored ?? DEFAULT_SETTINGS;
  },
  async update(patch: Partial<UserSettings>): Promise<UserSettings> {
    if (isAuthed()) {
      return api.put<UserSettings>('/settings', {
        appearance: patch.appearance,
        privacy: patch.privacy,
        analysis: patch.analysis,
        notifications: patch.notifications,
      });
    }
    const current = (await localSettings.get()) ?? DEFAULT_SETTINGS;
    const next = { ...current, ...patch } as UserSettings;
    await localSettings.set(next);
    return next;
  },
};

// --- Analysis retrieval -----------------------------------------

export const analysisApi: AnalysisApi = {
  async getAnalysis(id: string): Promise<AnalysisResult | null> {
    if (isAuthed()) {
      try {
        const row = await api.get<{ result: AnalysisResult }>(`/analyses/${id}`);
        return { ...row.result, id };
      } catch {
        return getLocalAnalysis(id);
      }
    }
    return getLocalAnalysis(id);
  },
};

// --- Running an analysis --------------------------------------

function assertContentAllowed(input: AnalyzeInput) {
  const plan = planFor(useAuthStore.getState().plan);
  if (input.mode === 'file') {
    if (input.file.size > plan.maxFileBytes) {
      throw new PlanLimitError(
        `Files above ${Math.round(plan.maxFileBytes / 1024 / 1024)} MB require a higher plan.`,
        'max_file_bytes',
      );
    }
    const ext = input.file.name.split('.').pop()?.toLowerCase() ?? '';
    const kind =
      ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'heic', 'tif', 'tiff'].includes(ext) ? 'image'
      : ['pdf'].includes(ext) ? 'pdf'
      : ['docx', 'doc'].includes(ext) ? 'docx'
      : ['wav', 'mp3', 'flac', 'ogg', 'm4a'].includes(ext) ? 'audio'
      : ['mp4', 'mov', 'webm'].includes(ext) ? 'video'
      : 'text';
    if (!plan.contentTypes.includes(kind) && !(kind === 'text' && plan.contentTypes.includes('text'))) {
      throw new PlanLimitError(
        `${kind.toUpperCase()} files are not available on the ${plan.tier} plan.`,
        'content_types',
      );
    }
  }
}

export interface RunAnalysisResult {
  result: AnalysisResult;
  persistedId: string;
}

export async function runAnalysis(input: AnalyzeInput): Promise<RunAnalysisResult> {
  assertContentAllowed(input);

  const allowed = await useQuotaStore.getState().consume('analysis');
  if (!allowed) throw new QuotaBlockedError();

  const tier = useAuthStore.getState().plan;
  const catalog: Fingerprint[] = can(tier, 'fingerprint_matching')
    ? await getCatalog().catch(() => [])
    : [];

  const result = await analyzeContent(input, { tier, catalog });

  let persistedId = result.id;
  if (isAuthed() && can(tier, 'server_history')) {
    try {
      const saved = await api.post<{ id: string }>('/analyses', {
        id: result.id,
        name: result.name,
        type: result.type,
        status: result.status,
        score: result.score,
        signalLevel: result.signalLevel,
        size: input.mode === 'file' ? input.file.size : result.name.length,
        language: input.mode === 'text' ? input.language : null,
        result,
      });
      persistedId = saved.id;
    } catch {
      await saveLocalAnalysis(result);
    }
  } else {
    await saveLocalAnalysis(result);
  }

  void useQuotaStore.getState().refresh();
  return { result: { ...result, id: persistedId }, persistedId };
}

export { getCatalog };
export { QuotaBlockedError, PlanLimitError } from './errors';
