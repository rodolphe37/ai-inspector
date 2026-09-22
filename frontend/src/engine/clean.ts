/** Real content cleaning: runs in the browser, no upload. */
import { stripUnicodeArtifacts } from './unicode';
import { t } from '@/i18n';

export interface CleanTextResult {
  text: string;
  removed: { type: string; count: number }[];
  beforeSize: number;
  afterSize: number;
}

export function cleanText(
  input: string,
  ops: { unicode?: boolean; trimWhitespace?: boolean; normalizeNewlines?: boolean },
): CleanTextResult {
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
    const out = lines.map((l) => {
      const t = l.replace(/[ \t]+$/, '');
      if (t !== l) trimmed++;
      return t;
    });
    text = out.join('\n').replace(/\n{3,}/g, '\n\n');
    if (trimmed) removed.push({ type: t('engine.clean.trailing'), count: trimmed });
  }

  return { text, removed, beforeSize, afterSize: new Blob([text]).size };
}

export interface CleanImageResult {
  blob: Blob;
  beforeSize: number;
  afterSize: number;
  removed: { type: string; count: number }[];
  filename: string;
}

/** Re-encode an image through a canvas, dropping every metadata block. */
export async function cleanImage(file: File): Promise<CleanImageResult> {
  const beforeSize = file.size;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error(t('engine.clean.decode'));

  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error(t('engine.clean.canvas'));
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Encoding failed.'))),
      outType,
      outType === 'image/jpeg' ? 0.95 : undefined,
    );
  });

  const base = file.name.replace(/\.[^.]+$/, '');
  const ext = outType === 'image/png' ? 'png' : 'jpg';

  return {
    blob,
    beforeSize,
    afterSize: blob.size,
    removed: [{ type: t('engine.clean.metadata'), count: 1 }],
    filename: `${base}.cleaned.${ext}`,
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
