import { api } from '@/lib/apiClient';
import { currentLanguage, type Language } from '@/i18n';
import type { Fingerprint } from '@/types/fingerprint';

// One in-flight / cached request per language.
const cache = new Map<Language, Promise<Fingerprint[]>>();

export function getCatalog(force = false): Promise<Fingerprint[]> {
  const lang = currentLanguage();
  if (force) cache.delete(lang);
  let entry = cache.get(lang);
  if (!entry) {
    entry = api.get<Fingerprint[]>(`/fingerprints?lang=${lang}`).catch((err) => {
      cache.delete(lang);
      throw err;
    });
    cache.set(lang, entry);
  }
  return entry;
}

export function getFingerprint(id: string): Promise<Fingerprint> {
  return api.get<Fingerprint>(`/fingerprints/${encodeURIComponent(id)}?lang=${currentLanguage()}`);
}
