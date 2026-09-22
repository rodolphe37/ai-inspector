/** Real content cleaning: runs in the browser, no upload. */
import { stripUnicodeArtifacts } from './unicode';
import {
  fileType, sniff, stripAvi, stripFlac, stripJpeg, stripMp3, stripMp4, stripPng, stripWav, stripWebp,
  type Container,
} from './containers';
import { cleanDocx, cleanPdf } from './documents';
import { t } from '@/i18n';
import type { engine } from '@/i18n/locales/en/engine';
import type { AnalysisType } from '@/types/analysis';

export interface CleanTextResult {
  text: string;
  removed: { type: string; count: number }[];
  beforeSize: number;
  afterSize: number;
}

export function cleanText(
  input: string,
  ops: { unicode?: boolean; trimWhitespace?: boolean; normalizeNewlines?: boolean },
  language = 'plaintext',
): CleanTextResult {
  const code = language !== 'plaintext' && language !== 'markdown';
  let text = input;
  const removed: { type: string; count: number }[] = [];
  const beforeSize = new Blob([input]).size;

  if (ops.unicode) {
    const r = stripUnicodeArtifacts(text);
    text = r.text;
    removed.push({ type: t('engine.clean.unicode'), count: r.removed });
  }
  if (ops.normalizeNewlines) {
    const before = (text.match(/\r\n|\r/g) ?? []).length;
    text = text.replace(/\r\n?/g, '\n');
    if (before) removed.push({ type: t('engine.clean.newlines'), count: before });
  }
  if (ops.trimWhitespace) {
    const lines = text.split('\n');
    let trimmed = 0;
    const out = lines.map((l, i) => {
      // Markdown: two trailing spaces before a non-empty line are a hard line break.
      const hardBreak = language === 'markdown' && / {2,}$/.test(l) && l.trim() !== '' && (lines[i + 1] ?? '').trim() !== '';
      const t = hardBreak ? l.replace(/[ \t]+$/, '  ') : l.replace(/[ \t]+$/, '');
      if (t !== l) trimmed++;
      return t;
    });
    text = out.join('\n');
    // Blank lines are layout in prose, but may be meaningful in code: keep them there.
    if (!code) text = text.replace(/\n{3,}/g, '\n\n');
    if (trimmed) removed.push({ type: t('engine.clean.trailing'), count: trimmed });
  }

  return { text, removed, beforeSize, afterSize: new Blob([text]).size };
}

export interface CleanFileResult {
  blob: Blob;
  beforeSize: number;
  afterSize: number;
  removed: { type: string; count: number }[];
  filename: string;
  /** Content family, as used in the history. */
  type: AnalysisType;
  /** true = metadata removed without re-encoding (no quality loss). */
  lossless: boolean;
}

/** Kept for existing imports. */
export type CleanImageResult = CleanFileResult;

/** Formats the cleaner handles (checked on the file content, not only its name). */
export function canCleanFile(file: File, container: Container): boolean {
  if (container === 'ogg') return false;
  if (container === 'unknown') return /\.(tiff?)$/i.test(file.name) || isTextFile(file, container);
  if (container === 'zip') return /\.docx$/i.test(file.name);
  return true;
}

/** Plain-text and source files: cleaned like pasted text. */
function isTextFile(file: File, container: Container): boolean {
  const kind = fileType(file.name, file.type, container);
  return kind === 'text' || kind === 'code';
}

/** Language for `cleanText`, from the file extension. */
function textLanguage(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'md') return 'markdown';
  if (ext === 'txt' || ext === 'rtf' || ext === 'csv') return 'plaintext';
  return ext || 'plaintext';
}

const MIME: Partial<Record<Container, string>> = {
  jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', wav: 'audio/wav', avi: 'video/x-msvideo',
  mp3: 'audio/mpeg', flac: 'audio/flac', pdf: 'application/pdf',
  zip: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/**
 * Remove metadata from any supported file. Images, audio and video keep their
 * pixels / samples untouched; only formats without a lossless path (GIF, AVIF,
 * HEIC, TIFF) are re-encoded through a canvas.
 */
// Readable names for the parts the container strippers report; format names
// (EXIF, XMP, ID3v2, C2PA...) are shown as is.
type PartKey = keyof typeof engine.clean.parts;
const PART_KEYS: Record<string, PartKey> = {
  Comment: 'comment',
  'Text chunks': 'textChunks',
  'Vorbis comments': 'vorbis',
  Picture: 'picture',
  'Application block': 'appBlock',
  'User data (udta)': 'udta',
  'Metadata (meta)': 'meta',
  'Document properties': 'docProps',
  'Associated files (C2PA)': 'associated',
  'Embedded files': 'embedded',
  'Author and core properties': 'coreProps',
  'Application properties': 'appProps',
  'Custom properties': 'customProps',
};
const partLabel = (type: string): string => {
  const key = PART_KEYS[type];
  return key ? t(`engine.clean.parts.${key}` as const) : type;
};

export async function cleanFile(file: File): Promise<CleanFileResult> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const container = sniff(bytes);
  if (!canCleanFile(file, container)) throw new Error(t('engine.clean.unsupported'));

  if (container === 'unknown' && isTextFile(file, container)) {
    // Invisible characters, homoglyphs and trailing whitespace, as for pasted text.
    const source = new TextDecoder().decode(bytes);
    const r = cleanText(source, { unicode: true, trimWhitespace: true }, textLanguage(file.name));
    const blob = new Blob([r.text], { type: file.type || 'text/plain' });
    const ext = file.name.match(/\.[^.]+$/)?.[0] ?? '';
    return {
      blob,
      beforeSize: file.size,
      afterSize: blob.size,
      removed: r.removed.some((x) => x.count > 0) ? r.removed : [{ type: t('engine.clean.nothingFound'), count: 0 }],
      filename: `${file.name.slice(0, file.name.length - ext.length)}.cleaned${ext}`,
      type: fileType(file.name, file.type, container),
      lossless: true,
    };
  }

  let result: { bytes: Uint8Array<ArrayBuffer>; removed: string[] } | null = null;
  switch (container) {
    case 'jpeg': result = stripJpeg(bytes); break;
    case 'png': result = stripPng(bytes); break;
    case 'webp': result = stripWebp(bytes); break;
    case 'wav': result = stripWav(bytes); break;
    case 'avi': result = stripAvi(bytes); break;
    case 'mp3': result = stripMp3(bytes); break;
    case 'flac': result = stripFlac(bytes); break;
    case 'mp4': result = stripMp4(bytes); break;
    case 'pdf': result = await cleanPdf(bytes); break;
    case 'zip': result = await cleanDocx(bytes); break;
    default: break;
  }
  if (!result) return reencodeImage(file);

  const ext = file.name.match(/\.[^.]+$/)?.[0] ?? '';
  const blob = new Blob([result.bytes], { type: MIME[container] ?? file.type ?? 'application/octet-stream' });
  return {
    blob,
    beforeSize: file.size,
    afterSize: blob.size,
    removed: result.removed.length
      ? result.removed.map((type) => ({ type: partLabel(type), count: 1 }))
      : [{ type: t('engine.clean.nothingFound'), count: 0 }],
    filename: `${file.name.slice(0, file.name.length - ext.length)}.cleaned${ext}`,
    type: fileType(file.name, file.type, container),
    lossless: true,
  };
}

/** Fallback for images without a lossless path: decode and re-encode, dropping everything. */
async function reencodeImage(file: File): Promise<CleanFileResult> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error(t('engine.clean.decode'));

  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error(t('engine.clean.canvas'));
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Encoding failed.'))), 'image/png');
  });
  const base = file.name.replace(/\.[^.]+$/, '');
  return {
    blob,
    beforeSize: file.size,
    afterSize: blob.size,
    removed: [{ type: t('engine.clean.metadata'), count: 1 }],
    filename: `${base}.cleaned.png`,
    type: 'image',
    lossless: false,
  };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
