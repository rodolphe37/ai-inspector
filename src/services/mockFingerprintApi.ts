import type { FingerprintApi } from '@/types/api';
import type { Fingerprint } from '@/types/fingerprint';
import mockFingerprints from '@/data/mockFingerprints.json';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockFingerprintApi: FingerprintApi = {
  async list(): Promise<Fingerprint[]> {
    await delay(300);
    return mockFingerprints as unknown as Fingerprint[];
  },

  async get(id: string): Promise<Fingerprint> {
    await delay(200);
    const list = mockFingerprints as unknown as Fingerprint[];
    const found = list.find((f) => f.id === id);
    if (!found) throw new Error('Fingerprint not found');
    return found;
  },
};
