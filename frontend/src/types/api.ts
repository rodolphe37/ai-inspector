import type { AnalysisResult, Analysis } from './analysis';
import type { Fingerprint } from './fingerprint';
import type { UserSettings } from './settings';

export interface AnalysisApi {
  getAnalysis(id: string): Promise<AnalysisResult | null>;
}

export interface FingerprintApi {
  list(): Promise<Fingerprint[]>;
  get(id: string): Promise<Fingerprint>;
}

export interface HistoryApi {
  list(): Promise<Analysis[]>;
  delete(id: string): Promise<void>;
}

export interface SettingsApi {
  get(): Promise<UserSettings>;
  update(settings: Partial<UserSettings>): Promise<UserSettings>;
}
