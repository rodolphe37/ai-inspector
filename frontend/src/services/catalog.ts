import { localizedCatalog } from '@/data/catalog';
import { currentLanguage } from '@/i18n';
import type { Fingerprint } from '@/types/fingerprint';

/** Known detection methods, in the current UI language. Embedded: no network. */
export function getCatalog(): Promise<Fingerprint[]> {
  return Promise.resolve(localizedCatalog(currentLanguage()));
}

export async function getFingerprint(id: string): Promise<Fingerprint> {
  const fp = localizedCatalog(currentLanguage()).find((f) => f.id === id);
  if (!fp) throw new Error(`Unknown fingerprint: ${id}`);
  return fp;
}
