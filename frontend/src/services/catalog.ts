import { api } from '@/lib/apiClient';
import type { Fingerprint } from '@/types/fingerprint';

let cache: Promise<Fingerprint[]> | null = null;

export function getCatalog(force = false): Promise<Fingerprint[]> {
  if (force) cache = null;
  if (!cache) {
    cache = api.get<Fingerprint[]>('/fingerprints').catch((err) => {
      cache = null;
      throw err;
    });
  }
  return cache;
}
