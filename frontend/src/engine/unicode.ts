/**
 * Real Unicode artifact analysis: runs entirely in the browser.
 *
 * Detects: invisible / zero-width characters, the Unicode Tags block (a known
 * hidden-data channel), bidirectional control overrides, unusual variation
 * selectors, and cross-script homoglyphs (Cyrillic / Greek letters inside
 * otherwise-Latin words).
 */
import type { UnicodeFinding, UnicodeResult } from '@/types/analysis';
import { t } from '@/i18n';

const INVISIBLE = new Set<number>([
  0x00a0, 0x00ad, 0x034f, 0x061c, 0x115f, 0x1160, 0x17b4, 0x17b5, 0x180e,
  0x200b, 0x200c, 0x200d, 0x200e, 0x200f, 0x202f, 0x205f, 0x2060, 0x2061,
  0x2062, 0x2063, 0x2064, 0x206a, 0x206b, 0x206c, 0x206d, 0x206e, 0x206f,
  0x3000, 0x2800, 0xfeff, 0xffa0,
]);

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

/** True when a finding is a bidi override (U+202A to U+202E, U+2066 to U+2069). */
export function isBidiFinding(f: UnicodeFinding): boolean {
  return BIDI_CONTROLS.has(parseInt(f.codepoint.slice(2), 16));
}

function cp(code: number): string {
  return `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
}

export function analyzeUnicode(text: string): UnicodeResult {
  const details: UnicodeFinding[] = [];
  let invisible = 0;
  let control = 0;
  let homoglyphs = 0;
  let tagChars = 0;

  const chars = Array.from(text);
  let offset = 0;

  for (const ch of chars) {
    const code = ch.codePointAt(0)!;

    if (code >= 0xe0000 && code <= 0xe007f) {
      tagChars++;
      details.push({
        type: 'invisible',
        character: ch,
        codepoint: cp(code),
        position: offset,
        description: t('engine.unicode.tag'),
      });
    } else if (INVISIBLE.has(code) || (code >= 0x2000 && code <= 0x200a)) {
      invisible++;
      details.push({
        type: 'invisible',
        character: ch,
        codepoint: cp(code),
        position: offset,
        description: t('engine.unicode.invisible'),
      });
    } else if (BIDI_CONTROLS.has(code)) {
      control++;
      details.push({
        type: 'control',
        character: ch,
        codepoint: cp(code),
        position: offset,
        description: t('engine.unicode.bidi'),
      });
    } else if (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) {
      control++;
      details.push({
        type: 'control',
        character: ch,
        codepoint: cp(code),
        position: offset,
        description: t('engine.unicode.c0'),
      });
    } else if ((code >= 0x7f && code < 0xa0) || (code >= 0xfe00 && code <= 0xfe0f)) {
      if (code >= 0xfe00) {
        control++;
        details.push({
          type: 'control',
          character: ch,
          codepoint: cp(code),
          position: offset,
          description: t('engine.unicode.variation'),
        });
      } else {
        control++;
        details.push({
          type: 'control',
          character: ch,
          codepoint: cp(code),
          position: offset,
          description: t('engine.unicode.c1'),
        });
      }
    } else if (HOMOGLYPHS[ch]) {
      homoglyphs++;
      details.push({
        type: 'homoglyph',
        character: ch,
        codepoint: cp(code),
        position: offset,
        description: t('engine.unicode.homoglyph', { latin: HOMOGLYPHS[ch] }),
      });
    }

    offset += ch.length;
  }

  const total = invisible + control + homoglyphs + tagChars;
  return {
    status: total > 0 ? 'found' : 'clean',
    invisibleCharacters: invisible + tagChars,
    controlCharacters: control,
    homoglyphs,
    details: details.slice(0, 200),
  };
}

/** Strip every artifact `analyzeUnicode` would flag, returning clean text. */
export function stripUnicodeArtifacts(text: string): { text: string; removed: number } {
  let removed = 0;
  const out = Array.from(text)
    .map((ch) => {
      const code = ch.codePointAt(0)!;
      const isTag = code >= 0xe0000 && code <= 0xe007f;
      const isInvisible = INVISIBLE.has(code) || (code >= 0x2000 && code <= 0x200a);
      const isBidi = BIDI_CONTROLS.has(code);
      const isControl =
        (code < 0x20 && ![0x09, 0x0a, 0x0d].includes(code)) ||
        (code >= 0x7f && code < 0xa0) ||
        (code >= 0xfe00 && code <= 0xfe0f);
      if (isTag || isInvisible || isBidi || isControl) {
        removed++;
        return '';
      }
      if (HOMOGLYPHS[ch]) {
        removed++;
        return HOMOGLYPHS[ch];
      }
      return ch;
    })
    .join('');
  return { text: out, removed };
}
