import type { SettingsApi } from '@/types/api';
import type { UserSettings } from '@/types/settings';
import mockSettings from '@/data/mockSettings.json';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockSettingsApi: SettingsApi = {
  async get(): Promise<UserSettings> {
    await delay(200);
    return mockSettings as unknown as UserSettings;
  },

  async update(settings: UserSettings): Promise<UserSettings> {
    await delay(300);
    return settings;
  },
};
