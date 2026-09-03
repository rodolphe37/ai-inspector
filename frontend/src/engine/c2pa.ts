/**
 * C2PA / Content Credentials detection.
 *
 * This performs *structural* detection: it locates an embedded JUMBF / C2PA
 * manifest and pulls readable identifiers out of it. It does not verify the
 * COSE signature chain — full verification is a server-side (pro) capability.
 */
import type { C2PAResult } from '@/types/analysis';

const MARKERS = ['jumbf', 'jumb', 'c2pa', 'c2ma', 'urn:c2pa', 'contentauth'];

function latin1(bytes: Uint8Array, start: number, end: number): string {
  let s = '';
  for (let i = start; i < end && i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

export async function analyzeC2PA(file: File): Promise<C2PAResult> {
  let buf: ArrayBuffer;
  try {
    buf = await file.arrayBuffer();
  } catch {
    return { status: 'not_found', manifest: false };
  }
  const bytes = new Uint8Array(buf);
  const haystack = latin1(bytes, 0, Math.min(bytes.length, 3_000_000)).toLowerCase();

  const hasManifest =
    haystack.includes('jumb') &&
    (haystack.includes('c2pa') || haystack.includes('contentauth') || haystack.includes('cai'));

  if (!hasManifest && !MARKERS.some((m) => haystack.includes(m) && haystack.includes('claim'))) {
    return { status: 'not_found', manifest: false };
  }

  // Best-effort readable field extraction from the (mostly CBOR) manifest.
  const readable = latin1(bytes, 0, Math.min(bytes.length, 3_000_000));
  const claims: string[] = [];
  const generator = readable.match(/claim_generator["\s:]*([A-Za-z0-9_.\- /]{3,60})/);
  const signerCN = readable.match(/(?:CN=|commonName["\s:]*)([A-Za-z0-9 .,'&-]{3,60})/);
  const created = readable.match(/(?:c2pa\.created|dc:created|"when"[\s:"]*)([0-9T:\-.Z]{10,30})/);

  if (readable.includes('c2pa.created') || readable.includes('trainedAlgorithmicMedia')) {
    claims.push('Declares an AI-generated / trained-algorithm source');
  }
  if (readable.includes('c2pa.edited') || readable.includes('c2pa.placed')) {
    claims.push('Declares subsequent edits');
  }
  if (readable.includes('c2pa.opened') || readable.includes('c2pa.converted')) {
    claims.push('Declares format conversion');
  }

  return {
    status: 'found',
    manifest: true,
    signer: signerCN?.[1]?.trim() || generator?.[1]?.trim() || 'Unknown (manifest not verified)',
    timestamp: created?.[1],
    claims: claims.length ? claims : ['Manifest present'],
    valid: undefined, // signature not verified in the client tier
  };
}

export const noC2PA: C2PAResult = { status: 'not_found', manifest: false };
