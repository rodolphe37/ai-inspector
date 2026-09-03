export type UnicodeStatus = 'clean' | 'found';

export interface UnicodeFinding {
  type: 'invisible' | 'control' | 'homoglyph';
  character: string;
  codepoint: string;
  position: number;
  description: string;
}

export interface UnicodeResult {
  status: UnicodeStatus;
  invisibleCharacters: number;
  controlCharacters: number;
  homoglyphs: number;
  details: UnicodeFinding[];
}
