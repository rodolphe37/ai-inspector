import {
  deleteLocalAnalysis,
  deleteLocalCleaning,
  listLocalCleanings,
  saveLocalCleaning,
  getLocalAnalysis,
  listLocalAnalyses,
  localSettings,
  saveLocalAnalysis,
} from '@/lib/localDb';
import type { AnalysisApi, FingerprintApi, HistoryApi, SettingsApi } from '@/types/api';
import type { AnalysisResult } from '@/types/analysis';
import type { Fingerprint } from '@/types/fingerprint';
import { SETTINGS_VERSION, type UserSettings } from '@/types/settings';
import { analyzeContent, type AnalyzeInput } from '@/engine';
import { getCatalog, getFingerprint } from './catalog';

export const DEFAULT_SETTINGS: UserSettings = {
  version: SETTINGS_VERSION,
  appearance: { theme: 'dark' },
  privacy: { storeHistory: true },
  analysis: { detailedResults: true, showStatisticalData: true, showTechnicalInfo: true },
};

/** Bring settings saved by an older version to the current shape. */
function migrate(stored: Partial<UserSettings> | null): UserSettings {
  if (!stored) return DEFAULT_SETTINGS;
  return {
    version: SETTINGS_VERSION,
    appearance: { theme: stored.appearance?.theme ?? DEFAULT_SETTINGS.appearance.theme },
    privacy: { storeHistory: stored.privacy?.storeHistory ?? DEFAULT_SETTINGS.privacy.storeHistory },
    // Before v2 these toggles did nothing (and one defaulted to off): reset them.
    analysis:
      stored.version === SETTINGS_VERSION && stored.analysis
        ? { ...DEFAULT_SETTINGS.analysis, ...stored.analysis }
        : DEFAULT_SETTINGS.analysis,
  };
}

// --- Fingerprints ----------------------------------------------------

export const fingerprintApi: FingerprintApi = {
  list: () => getCatalog(),
  get: (id) => getFingerprint(id),
};

// --- History (IndexedDB) -------------------------------------------

export const historyApi: HistoryApi = {
  list: () => listLocalAnalyses(),
  delete: (id) => deleteLocalAnalysis(id),
  listCleanings: () => listLocalCleanings(),
  deleteCleaning: (id) => deleteLocalCleaning(id),
  async recordCleaning(record) {
    const { privacy } = await settingsApi.get();
    if (!privacy.storeHistory) return;
    await saveLocalCleaning({
      ...record,
      id: `cl_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      date: new Date().toISOString(),
    });
  },
};

// --- Settings (IndexedDB) ------------------------------------------

export const settingsApi: SettingsApi = {
  async get(): Promise<UserSettings> {
    return migrate(await localSettings.get());
  },
  async update(patch: Partial<UserSettings>): Promise<UserSettings> {
    const current = migrate(await localSettings.get());
    const next = { ...current, ...patch, version: SETTINGS_VERSION } as UserSettings;
    await localSettings.set(next);
    return next;
  },
};

// --- Analysis retrieval -----------------------------------------

// Results of this session that were not saved (history turned off).
const sessionResults = new Map<string, AnalysisResult>();

export const analysisApi: AnalysisApi = {
  getAnalysis: async (id: string): Promise<AnalysisResult | null> =>
    sessionResults.get(id) ?? getLocalAnalysis(id),
};

// --- Running an analysis --------------------------------------

export interface RunAnalysisResult {
  result: AnalysisResult;
  persistedId: string;
}

export async function runAnalysis(input: AnalyzeInput): Promise<RunAnalysisResult> {
  const catalog: Fingerprint[] = await getCatalog();
  const result = await analyzeContent(input, { catalog });
  const { privacy } = await settingsApi.get();
  if (privacy.storeHistory) await saveLocalAnalysis(result);
  else sessionResults.set(result.id, result);
  return { result, persistedId: result.id };
}

export { getCatalog };
