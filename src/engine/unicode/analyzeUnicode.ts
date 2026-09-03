import type { UnicodeResult } from '@/types/unicode';

export function analyzeUnicode(text: string): UnicodeResult {
  const findings: UnicodeResult['details'] = [];
  let invisible = 0;
  let control = 0;
  let homoglyphs = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.codePointAt(0)!;

    if (
      code === 0x200b ||
      code === 0x200c ||
      code === 0x200d ||
      code === 0xfeff ||
      code === 0x2060 ||
      code === 0x2061 ||
      code === 0x2062 ||
      code === 0x2063 ||
      code === 0x2064
    ) {
      invisible++;
      findings.push({
        type: 'invisible',
        character: char,
        codepoint: `U+${code.toString(16).toUpperCase().padStart(4, '0')}`,
        position: i,
        description: 'Invisible character detected',
      });
    }

    if (code < 0x20 || (code >= 0x7f && code < 0xa0)) {
      if (code !== 0x09 && code !== 0x0a && code !== 0x0d) {
        control++;
        findings.push({
          type: 'control',
          character: char,
          codepoint: `U+${code.toString(16).toUpperCase().padStart(4, '0')}`,
          position: i,
          description: 'Control character detected',
        });
      }
    }
  }

  return {
    status: invisible + control + homoglyphs > 0 ? 'found' : 'clean',
    invisibleCharacters: invisible,
    controlCharacters: control,
    homoglyphs,
    details: findings,
  };
}
