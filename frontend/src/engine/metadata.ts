/**
 * Real metadata extraction: text heuristics + EXIF/XMP/IPTC for images
 * (via `exifr`), PNG text chunks, audio / video tags (containers.ts) and PDF / DOCX
 * properties (documents.ts). Generator signatures are recognised in `generators.ts`.
 */
import exifr from 'exifr';
import type { MetadataEntry, MetadataResult } from '@/types/analysis';
import { currentLocale, t } from '@/i18n';
import { detectLanguage } from './language';
import { detectGenerators, type GeneratorId } from './generators';
import {
  readFlacComments, readId3, readMp4, readRiffInfo, readWebpXmp, readXmpFields, type Container, type TagEntry,
} from './containers';
import type { DocumentContent } from './documents';

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

/** PNG tEXt / iTXt chunks: full text per keyword (lower case), for detection. */
async function readPngTextChunks(buf: ArrayBuffer): Promise<Record<string, string>> {
  const bytes = new Uint8Array(buf);
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!sig.every((b, i) => bytes[i] === b)) return {};
  const dv = new DataView(buf);
  const decoder = new TextDecoder('latin1');
  const out: Record<string, string> = {};
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
      out[key.toLowerCase()] = value;
    }
    if (type === 'IEND') break;
    pos = dataStart + len + 4;
  }
  return out;
}

export interface FileContext {
  bytes: Uint8Array;
  container: Container;
  /** Text and properties of a PDF / DOCX, already extracted. */
  document?: DocumentContent | null;
}

export async function analyzeFileMetadata(file: File, ctx: FileContext): Promise<MetadataResult> {
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
  const baseline = entries.length;

  const isImage = ['jpeg', 'png', 'webp', 'gif', 'heif'].includes(ctx.container) ||
    ['png', 'jpg', 'jpeg', 'webp', 'tif', 'tiff', 'heic', 'heif', 'avif', 'gif'].includes(ext);
  const software: string[] = [];
  const credit: string[] = [];
  const chunks: Record<string, string> = {};

  /** Add tag entries; the fields a tool writes its name into feed generator detection. */
  const addTags = (tags: TagEntry[]) => {
    for (const tag of tags) {
      entries.push({ key: tag.key, value: tag.value.slice(0, 300) });
      if (/^(software|encoder|encoded by|encoder settings|originator|comment|user text|description|application|creator|producer)/i.test(tag.key)) {
        software.push(tag.value);
      }
    }
  };

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
        for (const k of ['Software', 'CreatorTool', 'ProcessingSoftware', 'History']) {
          if (parsed[k] != null) software.push(fmt(parsed[k]));
        }
        for (const k of ['Credit', 'Source']) if (parsed[k] != null) credit.push(fmt(parsed[k]));
        if (parsed.UserComment != null) {
          const uc = parsed.UserComment;
          chunks['usercomment'] = uc instanceof Uint8Array ? new TextDecoder().decode(uc).replace(/^(UNICODE|ASCII)\0+/, '') : String(uc);
        }
        if (parsed.DigitalSourceType) {
          entries.push({ key: 'IPTC DigitalSourceType', value: fmt(parsed.DigitalSourceType) });
        }
      }
    } catch {
      /* not all images carry parseable metadata */
    }

    // XMP the EXIF library may miss (WebP chunk, PNG iTXt `XML:com.adobe.xmp`).
    const rawXmp = ctx.container === 'webp' ? readWebpXmp(ctx.bytes) : '';
    const applyXmp = (xml: string) => {
      for (const f of readXmpFields(xml)) {
        if (entries.some((e) => e.value === f.value)) continue;
        entries.push({ key: f.key === 'DigitalSourceType' ? 'IPTC DigitalSourceType' : f.key, value: f.value });
        if (f.key === 'Credit' || f.key === 'Source') credit.push(f.value);
        if (f.key === 'CreatorTool' || f.key === 'Software') software.push(f.value);
      }
    };
    if (rawXmp) applyXmp(rawXmp);

    if (ctx.container === 'png') {
      const png = await readPngTextChunks(ctx.bytes.slice().buffer);
      Object.assign(chunks, png);
      for (const [key, value] of Object.entries(png)) {
        if (key === 'xml:com.adobe.xmp') applyXmp(value);
        else entries.push({ key: `PNG:${key}`, value: value.slice(0, 300) });
      }
    }
  } else if (ctx.document) {
    addTags(ctx.document.properties);
    software.push(...ctx.document.software);
  } else {
    try {
      switch (ctx.container) {
        case 'mp3': addTags(readId3(ctx.bytes)); break;
        case 'wav':
        case 'avi': addTags(readRiffInfo(ctx.bytes)); break;
        case 'flac': addTags(readFlacComments(ctx.bytes)); break;
        case 'mp4': addTags(readMp4(ctx.bytes)); break;
        default: break;
      }
    } catch {
      /* malformed container: keep the basic file facts */
    }
  }

  const generators = detectGenerators(software, credit, chunks);
  if (generators.length) {
    // Stable key: read by assess.ts / score.ts / fingerprints.ts.
    entries.push({
      key: 'Generator signature',
      value: generators.map((g) => g.name).join(', '),
    });
  }

  return {
    status: entries.length > baseline ? 'found' : 'not_found',
    format: ctx.container !== 'unknown' ? ctx.container.toUpperCase() : ext.toUpperCase() || 'FILE',
    entries,
    generators: [...new Set(generators.map((g) => g.id))] as GeneratorId[],
  };
}
