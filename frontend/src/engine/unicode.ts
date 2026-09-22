/**
 * Real Unicode artifact analysis: runs entirely in the browser.
 *
 * Detects: invisible / zero-width characters, exotic spaces, the Unicode Tags block (a known
 * hidden-data channel), bidirectional control overrides, unusual variation
 * selectors, and cross-script homoglyphs (Cyrillic / Greek letters inside
 * otherwise-Latin words).
 */
import type { UnicodeFinding, UnicodeResult } from '@/types/analysis';
import { t } from '@/i18n';

// Zero-width / formatting characters with no visible glyph: removed.
const ZERO_WIDTH = new Set<number>([
  0x00ad, 0x034f, 0x061c, 0x115f, 0x1160, 0x17b4, 0x17b5, 0x180e, 0x200b,
  0x200c, 0x200d, 0x200e, 0x200f, 0x2060, 0x2061, 0x2062, 0x2063, 0x2064,
  0x206a, 0x206b, 0x206c, 0x206d, 0x206e, 0x206f, 0x2800, 0x3164, 0xfeff,
  0xffa0,
]);

// Exotic space characters: replaced by a regular space.
const ODD_SPACES = new Set<number>([
  0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008,
  0x200a, 0x205f, 0x3000,
]);

// Legitimate typography (French non-breaking and narrow spaces, thin space):
// never flagged, never touched.
// U+00A0, U+202F, U+2009 are deliberately absent from both sets above.

const BIDI_CONTROLS = new Set<number>([
  0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069,
]);

// Common Cyrillic / Greek letters that are visually identical to Latin.
const HOMOGLYPHS: Record<string, string> = {
  а: 'a', е: 'e', о: 'o', р: 'p', с: 'c', х: 'x', у: 'y', і: 'i', ј: 'j',
  ѕ: 's', ԁ: 'd', А: 'A', В: 'B', Е: 'E', К: 'K', М: 'M', Н: 'H', О: 'O',
  Р: 'P', С: 'C', Т: 'T', Х: 'X', Ѕ: 'S', Ј: 'J', Ι: 'I', Ο: 'O', Ρ: 'P',
  Α: 'A', Β: 'B', Ε: 'E', Ζ: 'Z', Η: 'H', Κ: 'K', Μ: 'M', Ν: 'N', Τ: 'T',
  Υ: 'Y', Χ: 'X', ο: 'o', ν: 'v', ρ: 'p',
};

const EMOJI = /\p{Extended_Pictographic}/u;
const LETTER = /\p{L}/u;
const LATIN = /[A-Za-z\u00C0-\u024F]/;

export type ArtifactKind = 'tag' | 'zeroWidth' | 'space' | 'bidi' | 'c0' | 'c1' | 'variation' | 'homoglyph';

export interface Artifact {
  kind: ArtifactKind;
  /** What the cleaner puts instead ('' = removed). */
  replacement: string;
  /** Latin look-alike, for homoglyphs. */
  latin?: string;
}

/** True when the letter at `i` belongs to a word that also contains Latin letters. */
function inLatinWord(chars: string[], i: number): boolean {
  for (let j = i - 1; j >= 0 && LETTER.test(chars[j]); j--) if (LATIN.test(chars[j])) return true;
  for (let j = i + 1; j < chars.length && LETTER.test(chars[j]); j++) if (LATIN.test(chars[j])) return true;
  return false;
}

/**
 * Classify the character at `i` (array of code points). Returns null for
 * anything legitimate: ordinary text, typographic spaces, the joiners and
 * variation selectors that build emoji, Cyrillic / Greek in their own words.
 */
export function classifyChar(chars: string[], i: number): Artifact | null {
  const ch = chars[i];
  const code = ch.codePointAt(0)!;
  const prev = chars[i - 1] ?? '';
  const next = chars[i + 1] ?? '';

  if (code >= 0xe0000 && code <= 0xe007f) return { kind: 'tag', replacement: '' };
  if (code === 0x200d && EMOJI.test(prev) && EMOJI.test(next)) return null; // emoji ZWJ sequence
  if (ZERO_WIDTH.has(code)) return { kind: 'zeroWidth', replacement: '' };
  if (ODD_SPACES.has(code)) return { kind: 'space', replacement: ' ' };
  if (BIDI_CONTROLS.has(code)) return { kind: 'bidi', replacement: '' };
  if (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) return { kind: 'c0', replacement: '' };
  if (code >= 0x7f && code < 0xa0) return { kind: 'c1', replacement: '' };
  if (code >= 0xfe00 && code <= 0xfe0f) {
    return EMOJI.test(prev) ? null : { kind: 'variation', replacement: '' }; // emoji presentation selector
  }
  if (HOMOGLYPHS[ch] && inLatinWord(chars, i)) {
    return { kind: 'homoglyph', replacement: HOMOGLYPHS[ch], latin: HOMOGLYPHS[ch] };
  }
  return null;
}

/** True when a finding is a bidi override (U+202A to U+202E, U+2066 to U+2069). */
export function isBidiFinding(f: UnicodeFinding): boolean {
  return BIDI_CONTROLS.has(parseInt(f.codepoint.slice(2), 16));
}

function cp(code: number): string {
  return `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
}

/** Human-readable description of an artifact, in the current language. */
export function describeArtifact(a: Artifact): string {
  switch (a.kind) {
    case 'tag': return t('engine.unicode.tag');
    case 'zeroWidth': return t('engine.unicode.invisible');
    case 'space': return t('engine.unicode.space');
    case 'bidi': return t('engine.unicode.bidi');
    case 'c0': return t('engine.unicode.c0');
    case 'c1': return t('engine.unicode.c1');
    case 'variation': return t('engine.unicode.variation');
    case 'homoglyph': return t('engine.unicode.homoglyph', { latin: a.latin });
  }
}

export function analyzeUnicode(text: string): UnicodeResult {
  const details: UnicodeFinding[] = [];
  let invisible = 0;
  let control = 0;
  let homoglyphs = 0;

  const chars = Array.from(text);
  let offset = 0;

  chars.forEach((ch, i) => {
    const a = classifyChar(chars, i);
    if (a) {
      if (a.kind === 'homoglyph') homoglyphs++;
      else if (a.kind === 'tag' || a.kind === 'zeroWidth' || a.kind === 'space') invisible++;
      else control++;
      details.push({
        type: a.kind === 'homoglyph' ? 'homoglyph' : a.kind === 'tag' || a.kind === 'zeroWidth' || a.kind === 'space' ? 'invisible' : 'control',
        character: ch,
        codepoint: cp(ch.codePointAt(0)!),
        position: offset,
        description: describeArtifact(a),
      });
    }
    offset += ch.length;
  });

  const total = invisible + control + homoglyphs;
  return {
    status: total > 0 ? 'found' : 'clean',
    invisibleCharacters: invisible,
    controlCharacters: control,
    homoglyphs,
    details: details.slice(0, 200),
  };
}

/** Count of suspicious characters in `text` (same rules as the cleaner). */
export function countArtifacts(text: string): number {
  const chars = Array.from(text);
  return chars.reduce((n, _, i) => n + (classifyChar(chars, i) ? 1 : 0), 0);
}

/** Strip every artifact `analyzeUnicode` would flag, returning clean text. */
export function stripUnicodeArtifacts(text: string): { text: string; removed: number } {
  let removed = 0;
  const chars = Array.from(text);
  const out = chars
    .map((ch, i) => {
      const a = classifyChar(chars, i);
      if (!a) return ch;
      removed++;
      return a.replacement;
    })
    .join('');
  return { text: out, removed };
}
