export type ThemeMode = 'dark' | 'light' | 'system';

/** Bump when stored settings need a migration (see `settingsApi.get`). */
export const SETTINGS_VERSION = 2;

export interface UserSettings {
  version: number;
  appearance: {
    theme: ThemeMode;
  };
  privacy: {
    /** Save analyses in IndexedDB. Off: results live in memory for the session. */
    storeHistory: boolean;
  };
  analysis: {
    /** Signal breakdown + "What we found" timeline on the results page. */
    detailedResults: boolean;
    /** Letter-frequency test (figures + chart). */
    showStatisticalData: boolean;
    /** Signal level, Unicode, metadata, C2PA and fingerprint cards. */
    showTechnicalInfo: boolean;
  };
}

export interface CleanOperation {
  id: string;
  label: string;
  description: string;
  risk: 'safe' | 'warning' | 'danger';
  enabled: boolean;
}
