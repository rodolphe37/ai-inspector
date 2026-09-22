/**
 * Lightweight language identification for analysed prose (English / French).
 *
 * Counts high-frequency function words of each language. Deterministic, no
 * model, but good enough to pick the right stylometric and letter-frequency
 * references. Defaults to English when the evidence is weak.
 */

export type ContentLanguage = 'en' | 'fr';

const EN = new Set([
  'the', 'and', 'of', 'to', 'is', 'in', 'that', 'it', 'for', 'with', 'as', 'was',
  'on', 'are', 'this', 'be', 'by', 'or', 'from', 'at', 'which', 'have', 'an', 'not',
  'but', 'they', 'you', 'we', 'can', 'will', 'has', 'their', 'been', 'would',
]);

const FR = new Set([
  'le', 'la', 'les', 'de', 'des', 'du', 'et', 'est', 'un', 'une', 'que', 'qui',
  'dans', 'pour', 'pas', 'sur', 'avec', 'ce', 'cette', 'il', 'elle', 'nous', 'vous',
  'ils', 'sont', 'au', 'aux', 'par', 'plus', 'mais', 'ou', 'où', 'son', 'sa', 'ses',
  'leur', 'leurs', 'été', 'être', 'avoir', 'fait', 'comme', 'aussi', 'très', 'sans',
]);

/** Returns the dominant language of `text` (EN when unsure). */
export function detectLanguage(text: string): ContentLanguage {
  const words = text.toLowerCase().match(/[\p{L}]+/gu) ?? [];
  let en = 0;
  let fr = 0;
  for (const w of words) {
    if (EN.has(w)) en++;
    if (FR.has(w)) fr++;
  }
  // French elisions (l', d', qu', n'…) are a strong extra hint.
  fr += (text.match(/\b(?:l|d|qu|n|s|c|j|m)['’]\p{L}/giu) ?? []).length * 0.5;
  return fr > en * 1.1 && fr >= 3 ? 'fr' : 'en';
}

/** Lower-case, strip diacritics and expand ligatures (é→e, œ→oe). */
export function foldLetters(text: string): string {
  return text
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}
