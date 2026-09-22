/**
 * Real metadata extraction: text heuristics + EXIF/XMP/IPTC for images
 * (via `exifr`), plus a lightweight PDF info-dictionary reader and PNG text
 * chunk scan for generator signatures.
 */
import exifr from 'exifr';
import type { MetadataEntry, MetadataResult } from '@/types/analysis';
import { currentLocale, t } from '@/i18n';
import { detectLanguage } from './language';

const AI_SIGNATURES = [
  'stable diffusion', 'stablediffusion', 'automatic1111', 'comfyui', 'invokeai',
  'midjourney', 'dall-e', 'dall·e', 'dalle', 'firefly', 'adobe firefly',
  'novelai', 'leonardo.ai', 'playground', 'ideogram', 'flux', 'gpt-image',
  'made with google', 'gemini', 'imagen', 'grok', 'recraft',
];

function fmt(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().replace('.000Z', 'Z');
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 120);
  return String(value).slice(0, 200);
}

export function analyzeTextMetadata(
  text: string,
  name = 'pasted-content.txt',
  language = 'plaintext',
): MetadataResult {
  const entries: MetadataEntry[] = [];
  const hasBOM = text.charCodeAt(0) === 0xfeff;
  const body = hasBOM ? text.slice(1) : text;

  const crlf = (body.match(/\r\n/g) ?? []).length;
  const loneLf = (body.match(/(?<!\r)\n/g) ?? []).length;
  const loneCr = (body.match(/\r(?!\n)/g) ?? []).length;
  let lineEnding = t('engine.meta.none');
  if (crlf && !loneLf && !loneCr) lineEnding = 'CRLF (Windows)';
  else if (loneLf && !crlf && !loneCr) lineEnding = 'LF (Unix)';
  else if (loneCr && !crlf && !loneLf) lineEnding = 'CR (classic Mac)';
  else if (crlf || loneLf || loneCr) lineEnding = t('engine.meta.mixed');

  const lines = body.split(/\r\n|\r|\n/);
  const trailingWs = lines.filter((l) => /[ \t]+$/.test(l)).length;
  const maxLine = lines.reduce((m, l) => Math.max(m, l.length), 0);

  const loc = currentLocale();
  const isProse = !language || language === 'plaintext';
  entries.push({ key: t('engine.meta.format'), value: isProse ? t('engine.meta.plainText') : language });
  if (isProse && body.trim()) {
    entries.push({
      key: t('engine.meta.language'),
      value: t(`engine.languageName.${detectLanguage(body)}`),
    });
  }
  entries.push({ key: t('engine.meta.chars'), value: body.length.toLocaleString(loc) });
  entries.push({
    key: t('engine.meta.words'),
    value: (body.trim() ? body.trim().split(/\s+/).length : 0).toLocaleString(loc),
  });
  entries.push({ key: t('engine.meta.lines'), value: lines.length.toLocaleString(loc) });
  entries.push({ key: t('engine.meta.lineEndings'), value: lineEnding });
  entries.push({ key: t('engine.meta.bom'), value: hasBOM ? t('engine.meta.bomPresent') : t('engine.meta.none') });
  const isAscii = !Array.from(body).some((c) => c.charCodeAt(0) > 127);
  entries.push({ key: t('engine.meta.encoding'), value: isAscii ? 'ASCII / UTF-8' : t('engine.meta.nonAscii') });
  if (trailingWs) entries.push({ key: t('engine.meta.trailing'), value: String(trailingWs) });
  entries.push({ key: t('engine.meta.longest'), value: t('engine.meta.longestValue', { count: maxLine }) });

  return { status: 'found', format: name.split('.').pop()?.toUpperCase() || 'TXT', entries };
}

async function readPngTextChunks(buf: ArrayBuffer): Promise<MetadataEntry[]> {
  const bytes = new Uint8Array(buf);
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!sig.every((b, i) => bytes[i] === b)) return [];
  const dv = new DataView(buf);
  const decoder = new TextDecoder('latin1');
  const out: MetadataEntry[] = [];
  let pos = 8;
  while (pos + 8 <= bytes.length) {
    const len = dv.getUint32(pos);
    const type = decoder.decode(bytes.subarray(pos + 4, pos + 8));
    const dataStart = pos + 8;
    if (type === 'tEXt' || type === 'iTXt') {
      const raw = decoder.decode(bytes.subarray(dataStart, dataStart + len));
      const nul = raw.indexOf('\0');
      const key = nul >= 0 ? raw.slice(0, nul) : type;
      const value = nul >= 0 ? raw.slice(nul + 1).replace(/\0/g, ' ') : raw;
      out.push({ key: `PNG:${key}`, value: value.slice(0, 300) });
    }
    if (type === 'IEND') break;
    pos = dataStart + len + 4;
  }
  return out;
}

function readPdfInfo(buf: ArrayBuffer): MetadataEntry[] {
  const text = new TextDecoder('latin1').decode(new Uint8Array(buf.slice(0, 4096)));
  const tail = new TextDecoder('latin1').decode(
    new Uint8Array(buf.slice(Math.max(0, buf.byteLength - 8192))),
  );
  const hay = text + '\n' + tail;
  const out: MetadataEntry[] = [];
  const grab = (label: string, key: string) => {
    const m = hay.match(new RegExp(`/${key}\\s*\\(([^)]{0,200})\\)`));
    if (m) out.push({ key: label, value: m[1].replace(/\\(.)/g, '$1') });
  };
  grab('PDF version', '');
  const ver = text.match(/^%PDF-(\d\.\d)/);
  if (ver) out.push({ key: 'PDF version', value: ver[1] });
  grab('Title', 'Title');
  grab('Author', 'Author');
  grab('Creator', 'Creator');
  grab('Producer', 'Producer');
  grab('Creation date', 'CreationDate');
  grab('Mod date', 'ModDate');
  return out;
}

export async function analyzeFileMetadata(file: File): Promise<MetadataResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const entries: MetadataEntry[] = [
    { key: t('engine.meta.fileName'), value: file.name },
    { key: t('engine.meta.mime'), value: file.type || t('engine.meta.unknown') },
    { key: t('engine.meta.size'), value: `${(file.size / 1024).toFixed(1)} KB` },
    {
      key: t('engine.meta.modified'),
      value: file.lastModified ? new Date(file.lastModified).toISOString().slice(0, 10) : t('engine.meta.unknown'),
    },
  ];

  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'tif', 'tiff', 'heic', 'avif'].includes(ext);
  let signatureHits: string[] = [];

  if (isImage) {
    try {
      const parsed = await exifr.parse(file, {
        xmp: true,
        iptc: true,
        icc: false,
        jfif: true,
        ihdr: true,
        tiff: true,
        exif: true,
        gps: true,
      });
      if (parsed && typeof parsed === 'object') {
        const interesting = [
          'Make', 'Model', 'Software', 'CreatorTool', 'ProcessingSoftware',
          'DateTimeOriginal', 'CreateDate', 'ModifyDate', 'Artist', 'Copyright',
          'ImageDescription', 'DigitalSourceType', 'Credit', 'Source',
          'latitude', 'longitude', 'ExifImageWidth', 'ExifImageHeight',
        ];
        for (const k of interesting) {
          if (parsed[k] != null && fmt(parsed[k])) {
            entries.push({ key: k, value: fmt(parsed[k]) });
          }
        }
        const blob = JSON.stringify(parsed).toLowerCase();
        signatureHits = AI_SIGNATURES.filter((s) => blob.includes(s));
        if (parsed.DigitalSourceType) {
          entries.push({ key: 'IPTC DigitalSourceType', value: fmt(parsed.DigitalSourceType) });
        }
      }
    } catch {
      /* not all images carry parseable metadata */
    }

    if (ext === 'png') {
      try {
        const chunks = await readPngTextChunks(await file.arrayBuffer());
        entries.push(...chunks);
        const blob = chunks.map((c) => `${c.key} ${c.value}`).join(' ').toLowerCase();
        signatureHits.push(...AI_SIGNATURES.filter((s) => blob.includes(s)));
      } catch {
        /* ignore */
      }
    }
  } else if (ext === 'pdf') {
    try {
      entries.push(...readPdfInfo(await file.arrayBuffer()));
    } catch {
      /* ignore */
    }
  }

  signatureHits = [...new Set(signatureHits)];
  if (signatureHits.length) {
    entries.push({
      key: 'Generator signature',
      value: `matches: ${signatureHits.join(', ')}`,
    });
  }

  const hasRealMetadata = entries.length > 4;
  return {
    status: hasRealMetadata ? 'found' : 'not_found',
    format: ext.toUpperCase() || 'FILE',
    entries,
  };
}
