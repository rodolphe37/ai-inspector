import type { AnalysisResult, CleanResult } from './analysis';

export interface AnalysisApi {
  analyzeText(input: string, language?: string): Promise<AnalysisResult>;
  analyzeFile(file: File): Promise<AnalysisResult>;
  getAnalysis(id: string): Promise<AnalysisResult>;
  cleanContent(id: string, operations: string[]): Promise<CleanResult>;
}

export interface FingerprintApi {
  list(): Promise<import('./fingerprint').Fingerprint[]>;
  get(id: string): Promise<import('./fingerprint').Fingerprint>;
}

export interface HistoryApi {
  list(): Promise<import('./analysis').Analysis[]>;
  delete(id: string): Promise<void>;
}

export interface SettingsApi {
  get(): Promise<import('./settings').UserSettings>;
  update(settings: import('./settings').UserSettings): Promise<import('./settings').UserSettings>;
}
