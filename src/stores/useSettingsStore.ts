import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings, ThemeMode } from '@/types/settings';
import mockSettings from '@/data/mockSettings.json';

interface SettingsState {
  settings: UserSettings;
  setTheme: (theme: ThemeMode) => void;
  togglePrivacy: (key: keyof UserSettings['privacy']) => void;
  toggleAnalysis: (key: keyof UserSettings['analysis']) => void;
  toggleNotifications: (key: keyof UserSettings['notifications']) => void;
  updateSettings: (settings: UserSettings) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: mockSettings as unknown as UserSettings,
      setTheme: (theme) =>
        set((state) => ({
          settings: { ...state.settings, appearance: { ...state.settings.appearance, theme } },
        })),
      togglePrivacy: (key) =>
        set((state) => ({
          settings: {
            ...state.settings,
            privacy: { ...state.settings.privacy, [key]: !state.settings.privacy[key] },
          },
        })),
      toggleAnalysis: (key) =>
        set((state) => ({
          settings: {
            ...state.settings,
            analysis: { ...state.settings.analysis, [key]: !state.settings.analysis[key] },
          },
        })),
      toggleNotifications: (key) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              [key]: !state.settings.notifications[key],
            },
          },
        })),
      updateSettings: (settings) => set({ settings }),
    }),
    { name: 'provenance-settings' },
  ),
);
