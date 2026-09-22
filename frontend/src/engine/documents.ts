/**
 * PDF and DOCX: extract the text (for the text analyses) and the document
 * properties, and clean those properties. Everything runs in the browser; the
 * libraries are only downloaded when such a file is opened.
 */
import type { TagEntry } from './containers';

export interface DocumentContent {
  text: string;
  properties: TagEntry[];
  /** Software that produced the document (Producer, Creator, Application). */
  software: string[];
  /** A C2PA manifest is embedded (PDF only). */
  c2pa: boolean;
}

// Enough text for a reliable stylometric estimate without stalling on huge files.
const MAX_PAGES = 60;
const MAX_CHARS = 200_000;

// ---------------------------------------------------------------- PDF

async function loadPdfJs() {
  const [pdfjs, worker] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjs;
}

export async function readPdf(bytes: Uint8Array): Promise<DocumentContent> {
  const pdfjs = await loadPdfJs();
  const task = pdfjs.getDocument({ data: bytes.slice() });
  const doc = await task.promise;
  try {
    const properties: TagEntry[] = [];
    const software: string[] = [];
    const meta = await doc.getMetadata().catch(() => null);
    const info = (meta?.info ?? {}) as Record<string, unknown>;
    const labels: [string, string][] = [
      ['Title', 'Title'], ['Author', 'Author'], ['Subject', 'Subject'], ['Keywords', 'Keywords'],
      ['Creator', 'Creator'], ['Producer', 'Producer'], ['CreationDate', 'Created'], ['ModDate', 'Modified'],
      ['PDFFormatVersion', 'PDF version'],
    ];
    for (const [key, label] of labels) {
      const v = info[key];
      if (typeof v === 'string' && v.trim()) {
        properties.push({ key: label, value: v.trim() });
        if (key === 'Creator' || key === 'Producer') software.push(v.trim());
      }
    }
    const xmp = meta?.metadata;
    if (xmp) {
      for (const [key, label] of [['xmp:creatortool', 'XMP CreatorTool'], ['pdf:producer', 'XMP Producer'], ['iptc4xmpext:digitalsourcetype', 'DigitalSourceType']] as const) {
        const v = xmp.get(key);
        if (typeof v === 'string' && v.trim()) {
          properties.push({ key: label, value: v.trim() });
          if (label !== 'DigitalSourceType') software.push(v.trim());
        }
      }
    }
    properties.push({ key: 'Pages', value: String(doc.numPages) });

    // Embedded files: C2PA stores its manifest store as an associated file.
    const attachments = (await doc.getAttachments().catch(() => null)) as Record<string, { filename?: string }> | null;
    const c2pa = !!attachments && Object.values(attachments).some((a) => /c2pa|manifest/i.test(a.filename ?? ''));

    let text = '';
    for (let p = 1; p <= Math.min(doc.numPages, MAX_PAGES) && text.length < MAX_CHARS; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      let line = '';
      for (const item of content.items) {
        if (!('str' in item)) continue;
        line += item.str;
        if (item.hasEOL) {
          text += line + '\n';
          line = '';
        }
      }
      text += line + '\n\n';
    }
    return { text: text.slice(0, MAX_CHARS).trim(), properties, software, c2pa };
  } finally {
    void task.destroy();
  }
}

/** Remove document properties, XMP, embedded files (incl. C2PA) and page-piece data. */
export async function cleanPdf(bytes: Uint8Array): Promise<{ bytes: Uint8Array<ArrayBuffer>; removed: string[] }> {
  const { PDFDocument, PDFName } = await import('@cantoo/pdf-lib');
  const doc = await PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: false });
  const removed: string[] = [];
  const info = doc.context.lookup(doc.context.trailerInfo.Info);
  if (info) {
    doc.context.trailerInfo.Info = undefined;
    removed.push('Document properties');
  }
  const catalog = doc.catalog;
  for (const [key, label] of [['Metadata', 'XMP'], ['AF', 'Associated files (C2PA)'], ['PieceInfo', 'PieceInfo']] as const) {
    if (catalog.has(PDFName.of(key))) {
      catalog.delete(PDFName.of(key));
      removed.push(label);
    }
  }
  const names = catalog.lookupMaybe(PDFName.of('Names'), (await import('@cantoo/pdf-lib')).PDFDict);
  if (names?.has(PDFName.of('EmbeddedFiles'))) {
    names.delete(PDFName.of('EmbeddedFiles'));
    removed.push('Embedded files');
  }
  const out = await doc.save({ useObjectStreams: true, updateFieldAppearances: false });
  return { bytes: new Uint8Array(out), removed };
}

// ---------------------------------------------------------------- DOCX

const xmlText = (xml: string, tag: string): string => {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  return m ? decodeXml(m[1]).trim() : '';
};

function decodeXml(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&');
}

export async function readDocx(bytes: Uint8Array): Promise<DocumentContent> {
  const { unzipSync, strFromU8 } = await import('fflate');
  const files = unzipSync(bytes, {
    filter: (f) => ['word/document.xml', 'docProps/core.xml', 'docProps/app.xml', 'docProps/custom.xml'].includes(f.name),
  });
  const read = (name: string) => (files[name] ? strFromU8(files[name]) : '');

  const properties: TagEntry[] = [];
  const software: string[] = [];
  const core = read('docProps/core.xml');
  for (const [tag, label] of [['dc:title', 'Title'], ['dc:creator', 'Author'], ['cp:lastModifiedBy', 'Last modified by'], ['dcterms:created', 'Created'], ['dcterms:modified', 'Modified'], ['cp:revision', 'Revision']] as const) {
    const v = xmlText(core, tag);
    if (v) properties.push({ key: label, value: v });
  }
  const app = read('docProps/app.xml');
  for (const [tag, label] of [['Application', 'Application'], ['AppVersion', 'Application version'], ['Company', 'Company'], ['Template', 'Template'], ['TotalTime', 'Editing time (min)']] as const) {
    const v = xmlText(app, tag);
    if (v) {
      properties.push({ key: label, value: v });
      if (tag === 'Application') software.push(v);
    }
  }
  const custom = read('docProps/custom.xml');
  for (const m of custom.matchAll(/<property[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/property>/g)) {
    const name = decodeXml(m[1]);
    const value = decodeXml(m[2]).trim().slice(0, 200);
    properties.push({ key: `Custom: ${name}`, value });
    // Custom properties that name the producing tool count as a software field.
    if (value && /generat|producer|creator|tool|software/i.test(name)) software.push(value);
  }

  // Body text: one line per paragraph, tabs and breaks preserved.
  const text = decodeXml(
    read('word/document.xml')
      .replace(/<w:tab\/>/g, '\t')
      .replace(/<w:br[^>]*\/>/g, '\n')
      .replace(/<\/w:p>/g, '\n'),
  )
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, MAX_CHARS)
    .trim();

  return { text, properties, software, c2pa: false };
}

/** Blank the author / company / application properties and custom properties. */
export async function cleanDocx(bytes: Uint8Array): Promise<{ bytes: Uint8Array<ArrayBuffer>; removed: string[] }> {
  const { unzipSync, zipSync, strFromU8, strToU8 } = await import('fflate');
  const files = unzipSync(bytes);
  const removed: string[] = [];
  const blank = (xml: string, tags: string[]) => {
    let out = xml;
    for (const tag of tags) {
      const re = new RegExp(`(<${tag}(?:\\s[^>]*)?>)[\\s\\S]*?(</${tag}>)`, 'g');
      out = out.replace(re, '$1$2');
    }
    return out;
  };
  if (files['docProps/core.xml']) {
    files['docProps/core.xml'] = strToU8(blank(strFromU8(files['docProps/core.xml']), ['dc:title', 'dc:subject', 'dc:creator', 'cp:keywords', 'dc:description', 'cp:lastModifiedBy', 'cp:category', 'cp:revision']));
    removed.push('Author and core properties');
  }
  if (files['docProps/app.xml']) {
    files['docProps/app.xml'] = strToU8(blank(strFromU8(files['docProps/app.xml']), ['Application', 'AppVersion', 'Company', 'Manager', 'Template', 'TotalTime']));
    removed.push('Application properties');
  }
  if (files['docProps/custom.xml']) {
    files['docProps/custom.xml'] = strToU8(strFromU8(files['docProps/custom.xml']).replace(/<property[\s\S]*?<\/property>/g, ''));
    removed.push('Custom properties');
  }
  return { bytes: zipSync(files, { level: 6 }) as Uint8Array<ArrayBuffer>, removed };
}
