import { isMockMode } from '@/lib/apiClient';
import type { AnalysisApi } from '@/types/api';
import type { FingerprintApi } from '@/types/api';
import type { HistoryApi } from '@/types/api';
import type { SettingsApi } from '@/types/api';
import { mockAnalysisApi } from './mockAnalysisApi';
import { mockFingerprintApi } from './mockFingerprintApi';
import { mockHistoryApi } from './mockHistoryApi';
import { mockSettingsApi } from './mockSettingsApi';

export const analysisApi: AnalysisApi = mockAnalysisApi;
export const fingerprintApi: FingerprintApi = mockFingerprintApi;
export const historyApi: HistoryApi = mockHistoryApi;
export const settingsApi: SettingsApi = mockSettingsApi;

export { isMockMode };
