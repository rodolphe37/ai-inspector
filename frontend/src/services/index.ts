import {
  deleteLocalAnalysis,
  getLocalAnalysis,
  listLocalAnalyses,
  localSettings,
  saveLocalAnalysis,
} from '@/lib/localDb';
import type { AnalysisApi, FingerprintApi, HistoryApi, SettingsApi } from '@/types/api';
import type { AnalysisResult } from '@/types/analysis';
import type { Fingerprint } from '@/types/fingerprint';
import type { UserSettings } from '@/types/settings';
import { analyzeContent, type AnalyzeInput } from '@/engine';
import { getCatalog, getFingerprint } from './catalog';

export const DEFAULT_SETTINGS: UserSettings = {
  appearance: { theme: 'dark', density: 'comfortable' },
  privacy: { localProcessing: true, storeHistory: true, telemetry: false, showDemoLabels: false },
  analysis: { detailedResults: true, showStatisticalData: true, showTechnicalInfo: false },
  notifications: { analysisComplete: true, securityAlerts: true },
};

// --- Fingerprints ----------------------------------------------------

export const fingerprintApi: FingerprintApi = {
  list: () => getCatalog(),
  get: (id) => getFingerprint(id),
};

// --- History (IndexedDB) -------------------------------------------

export const historyApi: HistoryApi = {
  list: () => listLocalAnalyses(),
  delete: (id) => deleteLocalAnalysis(id),
};

// --- Settings (IndexedDB) ------------------------------------------

export const settingsApi: SettingsApi = {
  async get(): Promise<UserSettings> {
    const stored = await localSettings.get();
    return { ...DEFAULT_SETTINGS, ...stored };
  },
  async update(patch: Partial<UserSettings>): Promise<UserSettings> {
    const current = (await localSettings.get()) ?? DEFAULT_SETTINGS;
    const next = { ...current, ...patch } as UserSettings;
    await localSettings.set(next);
    return next;
  },
};

// --- Analysis retrieval -----------------------------------------

export const analysisApi: AnalysisApi = {
  getAnalysis: (id: string): Promise<AnalysisResult | null> => getLocalAnalysis(id),
};

// --- Running an analysis --------------------------------------

export interface RunAnalysisResult {
  result: AnalysisResult;
  persistedId: string;
}

export async function runAnalysis(input: AnalyzeInput): Promise<RunAnalysisResult> {
  const catalog: Fingerprint[] = await getCatalog();
  const result = await analyzeContent(input, { catalog });
  await saveLocalAnalysis(result);
  return { result, persistedId: result.id };
}

export { getCatalog };
