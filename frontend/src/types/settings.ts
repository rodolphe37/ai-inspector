export type ThemeMode = 'dark' | 'light' | 'system';

export interface UserSettings {
  appearance: {
    theme: ThemeMode;
    density: 'comfortable' | 'compact';
  };
  privacy: {
    localProcessing: boolean;
    storeHistory: boolean;
    telemetry: boolean;
    showDemoLabels: boolean;
  };
  analysis: {
    detailedResults: boolean;
    showStatisticalData: boolean;
    showTechnicalInfo: boolean;
  };
  notifications: {
    analysisComplete: boolean;
    securityAlerts: boolean;
  };
}

export interface CleanOperation {
  id: string;
  label: string;
  description: string;
  risk: 'safe' | 'warning' | 'danger';
  enabled: boolean;
}
