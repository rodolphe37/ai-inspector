/**
 * Binary container readers and metadata strippers, all in the browser.
 *
 * Reading: the metadata a file carries (tags, encoder, comments...).
 * Stripping: remove that metadata WITHOUT touching the image, sound or video
 * data (no re-encoding, no quality loss). When a format stores absolute
 * offsets (MP4 / MOV / M4A, AVI), metadata boxes are neutralised in place
 * (turned into same-size padding) so every offset stays valid.
 */
import type { AnalysisType } from '@/types/analysis';

export interface TagEntry {
  key: string;
  value: string;
}

export interface StripResult {
  bytes: Uint8Array<ArrayBuffer>;
  /** Human-oriented names of what was removed (e.g. "EXIF", "ID3v2"). */
  removed: string[];
}

const latin1 = new TextDecoder('latin1');
const utf8 = new TextDecoder('utf-8');
const ascii = (b: Uint8Array, start: number, len: number) => latin1.decode(b.subarray(start, start + len));

function concat(parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

// ---------------------------------------------------------------- sniffing

export type Container = 'jpeg' | 'png' | 'webp' | 'gif' | 'heif' | 'wav' | 'avi' | 'mp3' | 'flac' | 'ogg' | 'mp4' | 'pdf' | 'zip' | 'unknown';

// ISO-BMFF brands that are still images (HEIC / AVIF), not video: their `meta`
// box describes the image itself and must never be neutralised.
const IMAGE_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'mif1', 'msf1', 'avif', 'avis']);

export function sniff(b: Uint8Array): Container {
  if (b[0] === 0xff && b[1] === 0xd8) return 'jpeg';
  if (b[0] === 0x89 && ascii(b, 1, 3) === 'PNG') return 'png';
  if (ascii(b, 0, 4) === 'RIFF') {
    const kind = ascii(b, 8, 4);
    if (kind === 'WEBP') return 'webp';
    if (kind === 'WAVE') return 'wav';
    if (kind === 'AVI ') return 'avi';
  }
  if (ascii(b, 0, 3) === 'GIF') return 'gif';
  if (ascii(b, 0, 3) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)) return 'mp3';
  if (ascii(b, 0, 4) === 'fLaC') return 'flac';
  if (ascii(b, 0, 4) === 'OggS') return 'ogg';
  if (ascii(b, 4, 4) === 'ftyp' && IMAGE_BRANDS.has(ascii(b, 8, 4))) return 'heif';
  if (ascii(b, 4, 4) === 'ftyp' || ascii(b, 4, 4) === 'moov' || ascii(b, 4, 4) === 'mdat' || ascii(b, 4, 4) === 'wide') return 'mp4';
  if (ascii(b, 0, 5) === '%PDF-') return 'pdf';
  if (b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04) return 'zip';
  return 'unknown';
}

// ------------------------------------------------------------------- JPEG

/** Keep image data and colour information; drop EXIF, XMP, IPTC, C2PA (JUMBF), comments. */
export function stripJpeg(b: Uint8Array): StripResult {
  const parts: Uint8Array[] = [b.subarray(0, 2)];
  const removed = new Set<string>();
  let pos = 2;
  while (pos + 4 <= b.length) {
    if (b[pos] !== 0xff) break;
    const marker = b[pos + 1];
    if (marker === 0xda) {
      parts.push(b.subarray(pos)); // start of scan: the rest is image data
      pos = b.length;
      break;
    }
    const len = (b[pos + 2] << 8) | b[pos + 3];
    const seg = b.subarray(pos, pos + 2 + len);
    const id = ascii(b, pos + 4, 14);
    let keep = true;
    if (marker === 0xe1) {
      keep = false;
      removed.add(id.startsWith('Exif') ? 'EXIF' : 'XMP');
    } else if (marker === 0xeb) {
      keep = false;
      removed.add('C2PA (JUMBF)');
    } else if (marker === 0xed) {
      keep = false;
      removed.add('IPTC');
    } else if (marker === 0xfe) {
      keep = false;
      removed.add('Comment');
    } else if (marker >= 0xe3 && marker <= 0xef && marker !== 0xee) {
      keep = false; // vendor APPn blocks (maker notes, previews...)
      removed.add(`APP${marker - 0xe0}`);
    }
    // APP0 (JFIF), APP2 (ICC colour profile), APP14 (Adobe colour transform) and all
    // non-APP segments (tables, frame header) are kept.
    if (keep) parts.push(seg);
    pos += 2 + len;
  }
  if (pos < b.length) parts.push(b.subarray(pos));
  return { bytes: concat(parts), removed: [...removed] };
}

// -------------------------------------------------------------------- PNG

const PNG_KEEP = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'cHRM', 'gAMA', 'iCCP', 'sBIT', 'sRGB', 'bKGD', 'pHYs', 'hIST', 'acTL', 'fcTL', 'fdAT', 'cICP', 'mDCv', 'cLLi']);

export function stripPng(b: Uint8Array): StripResult {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const parts: Uint8Array[] = [b.subarray(0, 8)];
  const removed = new Set<string>();
  let pos = 8;
  while (pos + 12 <= b.length) {
    const len = dv.getUint32(pos);
    const type = ascii(b, pos + 4, 4);
    const end = pos + 12 + len;
    if (PNG_KEEP.has(type)) parts.push(b.subarray(pos, end));
    else removed.add(type === 'caBX' ? 'C2PA' : type === 'eXIf' ? 'EXIF' : type === 'iTXt' || type === 'tEXt' || type === 'zTXt' ? 'Text chunks' : type);
    pos = end;
    if (type === 'IEND') break;
  }
  return { bytes: concat(parts), removed: [...removed] };
}

// ------------------------------------------------------------------- RIFF

interface RiffChunk {
  id: string;
  start: number; // offset of the chunk header
  size: number; // payload size
}

function riffChunks(b: Uint8Array, from: number, to: number): RiffChunk[] {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const out: RiffChunk[] = [];
  let pos = from;
  while (pos + 8 <= to) {
    const size = dv.getUint32(pos + 4, true);
    out.push({ id: ascii(b, pos, 4), start: pos, size });
    pos += 8 + size + (size & 1);
  }
  return out;
}

function riffChunkBytes(b: Uint8Array, c: RiffChunk): Uint8Array {
  return b.subarray(c.start, c.start + 8 + c.size + (c.size & 1));
}

function riffWrap(kind: string, body: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const payload = concat(body);
  const head = new Uint8Array(12);
  head.set([0x52, 0x49, 0x46, 0x46]); // RIFF
  new DataView(head.buffer).setUint32(4, payload.length + 4, true);
  for (let i = 0; i < 4; i++) head[8 + i] = kind.charCodeAt(i);
  return concat([head, payload]);
}

/** WAV: keep only the format, fact and sample data chunks. */
export function stripWav(b: Uint8Array): StripResult {
  const keep = new Set(['fmt ', 'fact', 'data']);
  const body: Uint8Array[] = [];
  const removed = new Set<string>();
  for (const c of riffChunks(b, 12, b.length)) {
    if (keep.has(c.id)) body.push(riffChunkBytes(b, c));
    else removed.add(c.id === 'LIST' ? 'RIFF INFO' : c.id.trim().toUpperCase() === 'C2PA' ? 'C2PA' : c.id.trim());
  }
  return { bytes: riffWrap('WAVE', body), removed: [...removed] };
}

/** WebP: drop EXIF / XMP / C2PA chunks and clear the matching VP8X flags. */
export function stripWebp(b: Uint8Array): StripResult {
  const body: Uint8Array[] = [];
  const removed = new Set<string>();
  for (const c of riffChunks(b, 12, b.length)) {
    if (c.id === 'EXIF' || c.id === 'XMP ' || c.id.toUpperCase() === 'C2PA') {
      removed.add(c.id.trim() === 'XMP' ? 'XMP' : c.id.trim());
      continue;
    }
    const bytes = riffChunkBytes(b, c).slice();
    if (c.id === 'VP8X') bytes[8] &= ~(0x08 | 0x04); // EXIF and XMP presence flags
    body.push(bytes);
  }
  return { bytes: riffWrap('WEBP', body), removed: [...removed] };
}

/** AVI: turn metadata chunks into same-size JUNK padding (offsets stay valid). */
export function stripAvi(b: Uint8Array): StripResult {
  const out = b.slice();
  const removed = new Set<string>();
  for (const c of riffChunks(out, 12, out.length)) {
    const listType = c.id === 'LIST' ? ascii(out, c.start + 8, 4) : '';
    const isMeta = listType === 'INFO' || c.id === '_PMX' || c.id.toUpperCase() === 'C2PA' || c.id === 'IDIT';
    if (!isMeta) continue;
    removed.add(listType === 'INFO' ? 'RIFF INFO' : c.id === '_PMX' ? 'XMP' : c.id);
    out.set([0x4a, 0x55, 0x4e, 0x4b], c.start); // "JUNK"
    out.fill(0, c.start + 8, c.start + 8 + c.size);
  }
  return { bytes: out, removed: [...removed] };
}

/** Raw XMP packet of a WebP file (its `XMP ` chunk), or ''. */
export function readWebpXmp(b: Uint8Array): string {
  const chunk = riffChunks(b, 12, b.length).find((c) => c.id === 'XMP ');
  return chunk ? utf8.decode(b.subarray(chunk.start + 8, chunk.start + 8 + chunk.size)) : '';
}

/**
 * The XMP fields that matter for provenance, read from a raw packet (attribute
 * or element form). Used where the EXIF library does not reach the XMP.
 */
export function readXmpFields(xml: string): TagEntry[] {
  const fields: [string, string][] = [
    ['xmp:CreatorTool', 'CreatorTool'], ['photoshop:Credit', 'Credit'], ['photoshop:Source', 'Source'],
    ['Iptc4xmpExt:DigitalSourceType', 'DigitalSourceType'], ['tiff:Software', 'Software'],
  ];
  const out: TagEntry[] = [];
  for (const [name, key] of fields) {
    const attr = xml.match(new RegExp(`${name}="([^"]*)"`));
    const elem = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
    const value = (attr?.[1] ?? elem?.[1] ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (value) out.push({ key, value });
  }
  return out;
}

export function readRiffInfo(b: Uint8Array): TagEntry[] {
  const names: Record<string, string> = {
    ISFT: 'Software', IART: 'Artist', ICMT: 'Comment', INAM: 'Title', ICRD: 'Created',
    IENG: 'Engineer', ICOP: 'Copyright', ISRC: 'Source', IGNR: 'Genre',
  };
  const out: TagEntry[] = [];
  for (const c of riffChunks(b, 12, b.length)) {
    if (c.id === 'LIST' && ascii(b, c.start + 8, 4) === 'INFO') {
      for (const sub of riffChunks(b, c.start + 12, c.start + 8 + c.size)) {
        const value = utf8.decode(b.subarray(sub.start + 8, sub.start + 8 + sub.size)).replace(/\0+$/, '').trim();
        if (value) out.push({ key: names[sub.id] ?? sub.id, value });
      }
    }
    if (c.id === 'bext') {
      const originator = latin1.decode(b.subarray(c.start + 8 + 256, c.start + 8 + 288)).replace(/\0+$/, '').trim();
      if (originator) out.push({ key: 'Originator', value: originator });
    }
  }
  return out;
}

// -------------------------------------------------------------------- MP3

function syncsafe(b: Uint8Array, i: number): number {
  return ((b[i] & 0x7f) << 21) | ((b[i + 1] & 0x7f) << 14) | ((b[i + 2] & 0x7f) << 7) | (b[i + 3] & 0x7f);
}

/** ID3v2 size at the start of the file (0 when absent). */
function id3v2Length(b: Uint8Array): number {
  if (ascii(b, 0, 3) !== 'ID3') return 0;
  const footer = (b[5] & 0x10) !== 0;
  return 10 + syncsafe(b, 6) + (footer ? 10 : 0);
}

/** Remove ID3v2 (start), APEv2 and ID3v1 (end). MPEG audio frames are untouched. */
export function stripMp3(b: Uint8Array): StripResult {
  const removed: string[] = [];
  let start = 0;
  let end = b.length;
  // A file can carry several ID3v2 tags in a row.
  for (let n = id3v2Length(b.subarray(start)); n > 0; n = id3v2Length(b.subarray(start))) {
    start += n;
    if (!removed.includes('ID3v2')) removed.push('ID3v2');
  }
  if (end - start >= 128 && ascii(b, end - 128, 3) === 'TAG') {
    end -= 128;
    removed.push('ID3v1');
  }
  if (end - start >= 32 && ascii(b, end - 32, 8) === 'APETAGEX') {
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    const size = dv.getUint32(end - 32 + 12, true);
    const hasHeader = (dv.getUint32(end - 32 + 20, true) & 0x80000000) !== 0;
    end -= size + (hasHeader ? 32 : 0);
    removed.push('APEv2');
  }
  return { bytes: b.slice(start, end), removed };
}

const ID3_NAMES: Record<string, string> = {
  TIT2: 'Title', TPE1: 'Artist', TALB: 'Album', TSSE: 'Encoder settings', TENC: 'Encoded by',
  TCON: 'Genre', TYER: 'Year', TDRC: 'Recorded', TCOP: 'Copyright', TPUB: 'Publisher', TOWN: 'Owner',
};

function decodeId3Text(enc: number, data: Uint8Array): string {
  const dec = enc === 1 || enc === 2 ? new TextDecoder(enc === 2 ? 'utf-16be' : 'utf-16') : enc === 3 ? utf8 : latin1;
  return dec.decode(data).replace(/\0+/g, ' ').trim();
}

export function readId3(b: Uint8Array): TagEntry[] {
  const out: TagEntry[] = [];
  if (ascii(b, 0, 3) === 'ID3') {
    const version = b[3];
    const total = 10 + syncsafe(b, 6);
    let pos = 10;
    while (pos + 10 <= total && pos + 10 <= b.length) {
      const id = ascii(b, pos, 4);
      if (!/^[A-Z0-9]{4}$/.test(id)) break;
      const size = version >= 4 ? syncsafe(b, pos + 4) : (b[pos + 4] << 24) | (b[pos + 5] << 16) | (b[pos + 6] << 8) | b[pos + 7];
      const data = b.subarray(pos + 10, pos + 10 + size);
      if (id === 'GEOB' && /c2pa/i.test(latin1.decode(data.subarray(0, 64)))) out.push({ key: 'C2PA', value: 'ID3 GEOB frame' });
      else if (id === 'COMM' && data.length > 4) out.push({ key: 'Comment', value: decodeId3Text(data[0], data.subarray(4)) });
      else if (id === 'TXXX' && data.length > 1) out.push({ key: 'User text', value: decodeId3Text(data[0], data.subarray(1)) });
      else if (id[0] === 'T' && data.length > 1) out.push({ key: ID3_NAMES[id] ?? id, value: decodeId3Text(data[0], data.subarray(1)) });
      pos += 10 + size;
    }
  }
  if (b.length >= 128 && ascii(b, b.length - 128, 3) === 'TAG') {
    const v1 = (s: number, l: number) => latin1.decode(b.subarray(b.length - 128 + s, b.length - 128 + s + l)).replace(/\0+$/, '').trim();
    if (v1(3, 30)) out.push({ key: 'Title (ID3v1)', value: v1(3, 30) });
    if (v1(33, 30)) out.push({ key: 'Artist (ID3v1)', value: v1(33, 30) });
    if (v1(97, 30)) out.push({ key: 'Comment (ID3v1)', value: v1(97, 30) });
  }
  return out.filter((e) => e.value);
}

// ------------------------------------------------------------------- FLAC

/** Keep STREAMINFO, SEEKTABLE and CUESHEET; drop Vorbis comments, pictures, application blocks. */
export function stripFlac(b: Uint8Array): StripResult {
  const blocks: Uint8Array[] = [];
  const removed = new Set<string>();
  let pos = 4;
  let last = false;
  while (!last && pos + 4 <= b.length) {
    last = (b[pos] & 0x80) !== 0;
    const type = b[pos] & 0x7f;
    const len = (b[pos + 1] << 16) | (b[pos + 2] << 8) | b[pos + 3];
    const block = b.slice(pos, pos + 4 + len);
    if (type === 0 || type === 3 || type === 5) blocks.push(block);
    else if (type !== 1) removed.add(type === 4 ? 'Vorbis comments' : type === 6 ? 'Picture' : type === 2 ? 'Application block' : `Block ${type}`);
    pos += 4 + len;
  }
  blocks.forEach((blk, i) => {
    blk[0] = (blk[0] & 0x7f) | (i === blocks.length - 1 ? 0x80 : 0);
  });
  return { bytes: concat([b.subarray(0, 4), ...blocks, b.subarray(pos)]), removed: [...removed] };
}

export function readFlacComments(b: Uint8Array): TagEntry[] {
  const out: TagEntry[] = [];
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let pos = 4;
  let last = false;
  while (!last && pos + 4 <= b.length) {
    last = (b[pos] & 0x80) !== 0;
    const type = b[pos] & 0x7f;
    const len = (b[pos + 1] << 16) | (b[pos + 2] << 8) | b[pos + 3];
    if (type === 4) {
      let p = pos + 4;
      const vendorLen = dv.getUint32(p, true);
      out.push({ key: 'Encoder', value: utf8.decode(b.subarray(p + 4, p + 4 + vendorLen)) });
      p += 4 + vendorLen;
      const count = dv.getUint32(p, true);
      p += 4;
      for (let i = 0; i < count && p + 4 <= pos + 4 + len; i++) {
        const l = dv.getUint32(p, true);
        const kv = utf8.decode(b.subarray(p + 4, p + 4 + l));
        const eq = kv.indexOf('=');
        if (eq > 0) out.push({ key: kv.slice(0, eq), value: kv.slice(eq + 1) });
        p += 4 + l;
      }
    }
    pos += 4 + len;
  }
  return out;
}

// ------------------------------------------------------ MP4 / MOV / M4A

interface Box {
  type: string;
  start: number;
  headerSize: number;
  size: number; // total size including header
}

function boxes(b: Uint8Array, from: number, to: number): Box[] {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const out: Box[] = [];
  let pos = from;
  while (pos + 8 <= to) {
    let size = dv.getUint32(pos);
    let headerSize = 8;
    if (size === 1 && pos + 16 <= to) {
      size = Number(dv.getBigUint64(pos + 8));
      headerSize = 16;
    } else if (size === 0) {
      size = to - pos;
    }
    if (size < headerSize) break;
    out.push({ type: ascii(b, pos + 4, 4), start: pos, headerSize, size });
    pos += size;
  }
  return out;
}

// C2PA stores its manifest in a top-level `uuid` box with this identifier.
const C2PA_UUID = 'd8fec3d61b0e483c92975828877ec481';

function neutralise(b: Uint8Array, box: Box) {
  b.set([0x66, 0x72, 0x65, 0x65], box.start + 4); // "free"
  b.fill(0, box.start + box.headerSize, box.start + box.size);
}

/** Neutralise udta / meta boxes (in moov and each trak) and the C2PA uuid box, in place. */
export function stripMp4(b: Uint8Array): StripResult {
  const out = b.slice();
  const removed = new Set<string>();
  const hex = (s: number) => [...out.subarray(s, s + 16)].map((x) => x.toString(16).padStart(2, '0')).join('');
  const walk = (from: number, to: number, depth: number) => {
    for (const box of boxes(out, from, to)) {
      if (depth === 0 && box.type === 'uuid' && hex(box.start + box.headerSize) === C2PA_UUID) {
        neutralise(out, box);
        removed.add('C2PA');
      } else if (box.type === 'udta' || (box.type === 'meta' && depth > 0) || (depth === 0 && box.type === 'meta')) {
        neutralise(out, box);
        removed.add(box.type === 'udta' ? 'User data (udta)' : 'Metadata (meta)');
      } else if (box.type === 'moov' || box.type === 'trak') {
        walk(box.start + box.headerSize, box.start + box.size, depth + 1);
      }
    }
  };
  walk(0, out.length, 0);
  return { bytes: out, removed: [...removed] };
}

const MP4_NAMES: Record<string, string> = {
  '©too': 'Encoder', '©swr': 'Software', '©nam': 'Title', '©ART': 'Artist', '©cmt': 'Comment',
  '©day': 'Date', '©des': 'Description', '©enc': 'Encoded by', '©mak': 'Make', '©mod': 'Model',
  desc: 'Description', ldes: 'Long description',
};

/** iTunes-style (ilst) and QuickTime keys metadata, plus a C2PA marker. */
export function readMp4(b: Uint8Array): TagEntry[] {
  const out: TagEntry[] = [];
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const hex = (s: number) => [...b.subarray(s, s + 16)].map((x) => x.toString(16).padStart(2, '0')).join('');
  const readMeta = (meta: Box) => {
    // `meta` is a full box (4 bytes version/flags) in MP4, not always in QuickTime.
    let inner = meta.start + meta.headerSize;
    if (ascii(b, inner + 4, 4) !== 'hdlr') inner += 4;
    const children = boxes(b, inner, meta.start + meta.size);
    const keys: string[] = [];
    const keysBox = children.find((c) => c.type === 'keys');
    if (keysBox) {
      let p = keysBox.start + keysBox.headerSize + 8;
      const count = dv.getUint32(keysBox.start + keysBox.headerSize + 4);
      for (let i = 0; i < count && p + 8 <= keysBox.start + keysBox.size; i++) {
        const size = dv.getUint32(p);
        keys.push(latin1.decode(b.subarray(p + 8, p + size)));
        p += size;
      }
    }
    const ilst = children.find((c) => c.type === 'ilst');
    if (!ilst) return;
    for (const item of boxes(b, ilst.start + ilst.headerSize, ilst.start + ilst.size)) {
      const index = dv.getUint32(item.start + 4);
      const name = keys.length && index >= 1 && index <= keys.length ? keys[index - 1] : item.type;
      const data = boxes(b, item.start + item.headerSize, item.start + item.size).find((c) => c.type === 'data');
      if (!data) continue;
      const kind = dv.getUint32(data.start + 8) & 0xffffff;
      if (kind !== 1) continue; // UTF-8 text only
      const value = utf8.decode(b.subarray(data.start + 16, data.start + data.size)).trim();
      const label = MP4_NAMES[name] ?? name.replace(/^com\.apple\.quicktime\./, '');
      if (value) out.push({ key: label, value });
    }
  };
  const walk = (from: number, to: number, depth: number) => {
    for (const box of boxes(b, from, to)) {
      if (depth === 0 && box.type === 'uuid' && hex(box.start + box.headerSize) === C2PA_UUID) out.push({ key: 'C2PA', value: 'uuid box' });
      if (box.type === 'meta') readMeta(box);
      if (box.type === 'moov' || box.type === 'udta' || box.type === 'trak') walk(box.start + box.headerSize, box.start + box.size, depth + 1);
      if (box.type === 'udta') {
        // Classic QuickTime text atoms directly under udta (©too, ©swr...).
        for (const atom of boxes(b, box.start + box.headerSize, box.start + box.size)) {
          if (atom.type.startsWith('©') && MP4_NAMES[atom.type] && atom.size > 12) {
            const len = dv.getUint16(atom.start + 8);
            const value = utf8.decode(b.subarray(atom.start + 12, atom.start + 12 + len)).trim();
            if (value && !out.some((e) => e.key === MP4_NAMES[atom.type] && e.value === value)) out.push({ key: MP4_NAMES[atom.type], value });
          }
        }
      }
    }
  };
  walk(0, b.length, 0);
  return out;
}

/** Content family of a file, from its extension, MIME type and sniffed container. */
export function fileType(name: string, mime: string, container: Container): AnalysisType {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (container === 'pdf' || ext === 'pdf') return 'pdf';
  if (ext === 'docx') return 'docx';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'tif', 'tiff', 'heic', 'heif', 'avif'].includes(ext)) return 'image';
  if (['wav', 'mp3', 'flac', 'm4a', 'aac', 'ogg', 'opus'].includes(ext)) return 'audio';
  if (['mp4', 'mov', 'm4v', 'avi', 'webm', 'mkv'].includes(ext)) return 'video';
  if (['ts', 'tsx', 'js', 'jsx', 'mjs', 'py', 'go', 'rs', 'java', 'kt', 'swift', 'c', 'h', 'cpp', 'cs', 'rb', 'php', 'sh', 'sql'].includes(ext)) return 'code';
  if (['txt', 'md', 'json', 'html', 'css', 'csv', 'xml', 'yml', 'yaml', 'rtf'].includes(ext)) return 'text';
  if (mime.startsWith('image/') || ['jpeg', 'png', 'webp', 'gif', 'heif'].includes(container)) return 'image';
  if (mime.startsWith('audio/') || ['mp3', 'flac', 'wav', 'ogg'].includes(container)) return 'audio';
  if (mime.startsWith('video/') || container === 'avi') return 'video';
  if (mime.startsWith('text/')) return 'text';
  return 'file';
}
