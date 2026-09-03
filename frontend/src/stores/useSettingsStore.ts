import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings, ThemeMode } from '@/types/settings';
import { DEFAULT_SETTINGS, settingsApi } from '@/services';

interface SettingsState {
  settings: UserSettings;
  loaded: boolean;
  load: () => Promise<void>;
  setTheme: (theme: ThemeMode) => void;
  togglePrivacy: (key: keyof UserSettings['privacy']) => void;
  toggleAnalysis: (key: keyof UserSettings['analysis']) => void;
  toggleNotifications: (key: keyof UserSettings['notifications']) => void;
  updateSettings: (settings: UserSettings) => void;
}

function persistRemote(settings: UserSettings) {
  void settingsApi.update(settings).catch(() => {
    /* offline / anonymous — kept locally */
  });
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      loaded: false,

      load: async () => {
        try {
          const settings = await settingsApi.get();
          set({ settings, loaded: true });
        } catch {
          set({ loaded: true });
        }
      },

      setTheme: (theme) => {
        const settings = {
          ...get().settings,
          appearance: { ...get().settings.appearance, theme },
        };
        set({ settings });
        persistRemote(settings);
      },

      togglePrivacy: (key) => {
        const p = get().settings.privacy;
        const settings = { ...get().settings, privacy: { ...p, [key]: !p[key] } };
        set({ settings });
        persistRemote(settings);
      },

      toggleAnalysis: (key) => {
        const a = get().settings.analysis;
        const settings = { ...get().settings, analysis: { ...a, [key]: !a[key] } };
        set({ settings });
        persistRemote(settings);
      },

      toggleNotifications: (key) => {
        const n = get().settings.notifications;
        const settings = { ...get().settings, notifications: { ...n, [key]: !n[key] } };
        set({ settings });
        persistRemote(settings);
      },

      updateSettings: (settings) => {
        set({ settings });
        persistRemote(settings);
      },
    }),
    {
      name: 'ia-settings',
      partialize: (s) => ({ settings: { appearance: s.settings.appearance } }),
      merge: (persisted, current) => {
        const p = persisted as { settings?: { appearance?: UserSettings['appearance'] } };
        return {
          ...current,
          settings: {
            ...current.settings,
            appearance: p?.settings?.appearance ?? current.settings.appearance,
          },
        };
      },
    },
  ),
);
