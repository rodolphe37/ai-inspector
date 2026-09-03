/**
 * Heuristic fingerprint matcher.
 *
 * Given the raw signals from the other engine modules and the catalogue of
 * known methods (from the API), decide — transparently — whether each method's
 * signal is present, absent, or unverifiable in this browser tier.
 */
import type {
  C2PAResult,
  DetectionStatus,
  FingerprintMatch,
  MetadataResult,
  StatisticalResult,
  UnicodeResult,
} from '@/types/analysis';
import type { Fingerprint } from '@/types/fingerprint';

export interface EngineSignals {
  contentType: 'text' | 'code' | 'image' | 'audio' | 'file';
  unicode: UnicodeResult;
  metadata: MetadataResult;
  c2pa: C2PAResult;
  statistical: StatisticalResult | null;
}

function metaHas(meta: MetadataResult, needle: string): boolean {
  return meta.entries.some(
    (e) => e.key.toLowerCase().includes(needle) || e.value.toLowerCase().includes(needle),
  );
}

export function matchFingerprints(
  signals: EngineSignals,
  catalog: Fingerprint[],
): FingerprintMatch[] {
  const isText = signals.contentType === 'text' || signals.contentType === 'code';
  const out: FingerprintMatch[] = [];

  for (const fp of catalog) {
    if (fp.status === 'deprecated') continue;

    // Only evaluate methods that target this content type.
    const targets = fp.targetContent;
    if (isText && targets !== 'text') continue;
    if (!isText && targets === 'text') continue;

    let status: DetectionStatus;
    let confidence = fp.confidence;
    let method = fp.detectionMethod;

    switch (fp.id) {
      case 'c2pa-content-credentials':
      case 'openai-c2pa':
      case 'adobe-firefly-credentials': {
        if (signals.c2pa.manifest) {
          const signer = (signals.c2pa.signer ?? '').toLowerCase();
          const provider = fp.provider.toLowerCase().split(/[ /]/)[0];
          status = signer.includes(provider) || fp.id === 'c2pa-content-credentials'
            ? 'found'
            : 'possible';
          method = 'Embedded JUMBF/C2PA manifest located (signature not verified client-side)';
        } else {
          status = 'not_found';
        }
        break;
      }
      case 'unicode-invisible-characters': {
        status = signals.unicode.invisibleCharacters > 0 ? 'found' : 'not_found';
        method = `${signals.unicode.invisibleCharacters} invisible/tag character(s) found`;
        break;
      }
      case 'homoglyph-substitution': {
        status = signals.unicode.homoglyphs > 0 ? 'found' : 'not_found';
        method = `${signals.unicode.homoglyphs} cross-script homoglyph(s) found`;
        break;
      }
      case 'iptc-digital-source-type': {
        status = metaHas(signals.metadata, 'digitalsourcetype') ? 'found' : 'not_found';
        break;
      }
      case 'exif-software-tags': {
        const hit = metaHas(signals.metadata, 'generator signature') ||
          metaHas(signals.metadata, 'software') ||
          metaHas(signals.metadata, 'creatortool');
        status = metaHas(signals.metadata, 'generator signature')
          ? 'found'
          : hit
            ? 'possible'
            : 'not_found';
        break;
      }
      case 'ngram-frequency-deviation': {
        const s = signals.statistical;
        status = !s
          ? 'inconclusive'
          : s.status === 'possible'
            ? 'possible'
            : s.status === 'inconclusive'
              ? 'inconclusive'
              : 'not_found';
        confidence = s ? Math.round(Math.min(95, 40 + s.watermarkSignal * 5)) : 40;
        method = s ? s.conclusion : 'No statistical sample available';
        break;
      }
      case 'synthid-text':
      case 'kgw-green-list-watermark': {
        const s = signals.statistical;
        status = s && s.status === 'possible' ? 'inconclusive' : 'not_found';
        confidence = 30;
        method = 'Cannot be verified without the provider detector / watermark key';
        break;
      }
      case 'synthid-image': {
        status = 'inconclusive';
        confidence = 25;
        method = 'Invisible generative watermark — verifiable only with the provider detector';
        break;
      }
      default: {
        status = 'inconclusive';
        confidence = Math.min(confidence, 40);
      }
    }

    out.push({
      id: fp.id,
      name: fp.name,
      provider: fp.provider,
      status,
      confidence: status === 'not_found' ? fp.confidence : confidence,
      method,
    });
  }

  // Surface positives first, then possibles, then the rest.
  const rank: Record<DetectionStatus, number> = {
    found: 0, possible: 1, inconclusive: 2, not_found: 3, clean: 4, failed: 5,
  };
  return out.sort((a, b) => rank[a.status] - rank[b.status]).slice(0, 8);
}
