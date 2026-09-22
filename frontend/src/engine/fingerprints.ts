/**
 * Heuristic fingerprint matcher.
 *
 * Given the raw signals from the other engine modules and the catalogue of
 * known methods (the embedded catalogue), decide (transparently) whether each method's
 * signal is present, absent, or unverifiable in this browser tier.
 */
import type {
  AnalysisType,
  C2PAResult,
  DetectionStatus,
  FingerprintMatch,
  MetadataResult,
  StatisticalResult,
  UnicodeResult,
} from '@/types/analysis';
import type { Fingerprint } from '@/types/fingerprint';
import { t } from '@/i18n';

export interface EngineSignals {
  contentType: AnalysisType;
  unicode: UnicodeResult;
  metadata: MetadataResult;
  c2pa: C2PAResult;
  statistical: StatisticalResult | null;
}

/** Who signed a C2PA manifest: signer, claim generator and software agents. */
const C2PA_SIGNERS: Record<string, RegExp> = {
  'openai-c2pa': /\b(openai|chatgpt|dall[\s-·.]?e|sora)\b/i,
  'adobe-firefly-credentials': /\b(adobe|firefly)\b/i,
  'microsoft-c2pa': /\b(microsoft|bing|azure|designer|copilot)\b/i,
  'google-c2pa': /\b(google|pixel|gemini|imagen)\b/i,
  'samsung-c2pa': /\b(samsung|galaxy)\b/i,
  'camera-c2pa-capture': /\b(leica|sony|nikon|canon|fujifilm|truepic)\b/i,
};

/** Catalogue entries backed by a generator signature in metadata (engine/generators.ts). */
const METADATA_GENERATORS: Record<string, string> = {
  'sd-webui-parameters': 'sd-webui',
  'comfyui-workflow': 'comfyui',
  'invokeai-metadata': 'invokeai',
  'novelai-metadata': 'novelai',
  'midjourney-metadata': 'midjourney',
  'google-ai-credit': 'google-ai',
};

function metaHas(meta: MetadataResult, needle: string): boolean {
  return meta.entries.some(
    (e) => e.key.toLowerCase().includes(needle) || e.value.toLowerCase().includes(needle),
  );
}

export function matchFingerprints(
  signals: EngineSignals,
  catalog: Fingerprint[],
): FingerprintMatch[] {
  const type = signals.contentType;
  const isFile = type !== 'text' && type !== 'code';
  // PDF / DOCX text and pasted text both go through the text methods.
  const hasText = !isFile || type === 'pdf' || type === 'docx';
  const out: FingerprintMatch[] = [];

  for (const fp of catalog) {
    if (fp.status === 'deprecated') continue;

    // Only evaluate methods that apply to this content:
    // text → extracted or pasted text, image / audio → that media, files → any binary file.
    const applies =
      fp.targetContent === 'text' ? hasText
        : fp.targetContent === 'files' ? isFile
          : fp.targetContent === type;
    if (!applies) continue;

    let status: DetectionStatus;
    let confidence = fp.confidence;
    let method = fp.detectionMethod;

    const c = signals.c2pa;
    const signedBy = [c.signer, c.claimGenerator, ...(c.softwareAgents ?? [])].filter(Boolean).join(' ');

    switch (fp.id) {
      case 'c2pa-content-credentials': {
        status = c.manifest ? 'found' : 'not_found';
        if (c.manifest) {
          method = t(c.verified ? 'engine.fingerprints.manifestValid' : 'engine.fingerprints.manifestInvalid');
        }
        break;
      }
      case 'openai-c2pa':
      case 'adobe-firefly-credentials':
      case 'microsoft-c2pa':
      case 'google-c2pa':
      case 'samsung-c2pa':
      case 'camera-c2pa-capture': {
        const bySigner = c.manifest && C2PA_SIGNERS[fp.id].test(signedBy);
        // Firefly is Adobe's generator: an Adobe-signed manifest only counts
        // when it declares generative AI. A camera signature only counts for a
        // capture, not for an AI output.
        const matches =
          fp.id === 'adobe-firefly-credentials' ? bySigner && c.isAiGenerated
            : fp.id === 'camera-c2pa-capture' ? bySigner && !c.isAiGenerated
              : bySigner;
        status = matches ? 'found' : 'not_found';
        if (matches) {
          method = t('engine.fingerprints.signedBy', {
            signer: c.signer ?? c.claimGenerator ?? fp.provider,
            state: t(c.verified ? 'engine.fingerprints.sigValid' : 'engine.fingerprints.sigInvalid'),
          });
        }
        break;
      }
      case 'sd-webui-parameters':
      case 'comfyui-workflow':
      case 'invokeai-metadata':
      case 'novelai-metadata':
      case 'midjourney-metadata':
      case 'google-ai-credit': {
        const found = signals.metadata.generators?.includes(METADATA_GENERATORS[fp.id]) ?? false;
        status = found ? 'found' : 'not_found';
        if (found) method = t('engine.fingerprints.generatorFound');
        break;
      }
      case 'unicode-invisible-characters': {
        status = signals.unicode.invisibleCharacters > 0 ? 'found' : 'not_found';
        method = t('engine.fingerprints.invisible', { count: signals.unicode.invisibleCharacters });
        break;
      }
      case 'homoglyph-substitution': {
        status = signals.unicode.homoglyphs > 0 ? 'found' : 'not_found';
        method = t('engine.fingerprints.homoglyphs', { count: signals.unicode.homoglyphs });
        break;
      }
      case 'iptc-digital-source-type': {
        status = metaHas(signals.metadata, 'digitalsourcetype') ? 'found' : 'not_found';
        break;
      }
      case 'media-generator-tags': {
        // Images are covered by `exif-software-tags`: do not count the same hint twice.
        if (type === 'image') continue;
        const found = (signals.metadata.generators?.length ?? 0) > 0;
        status = found ? 'found' : 'not_found';
        if (found) method = t('engine.fingerprints.generatorFound');
        break;
      }
      case 'exif-software-tags': {
        // Only an identified AI generator counts: "Adobe Photoshop" or a
        // camera model in the Software field is not a signal.
        status = signals.metadata.generators?.length ? 'found' : 'not_found';
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
        method = s ? s.conclusion : t('engine.fingerprints.noSample');
        break;
      }
      case 'synthid-text':
      case 'kgw-green-list-watermark': {
        const s = signals.statistical;
        status = s && s.status === 'possible' ? 'inconclusive' : 'not_found';
        confidence = 30;
        method = t('engine.fingerprints.needsKey');
        break;
      }
      case 'c2pa-soft-binding': {
        if (signals.c2pa.manifest && signals.c2pa.softBinding) {
          status = 'found';
          method = t('engine.fingerprints.softBindingFound');
        } else if (signals.c2pa.manifest) {
          status = 'not_found';
          method = t('engine.fingerprints.softBindingAbsent');
        } else {
          status = 'inconclusive';
          confidence = 30;
          method = t('engine.fingerprints.softBindingNoManifest');
        }
        break;
      }
      case 'synthid-image': {
        status = 'inconclusive';
        confidence = 25;
        method = t('engine.fingerprints.synthidImage');
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
      evidence: fp.evidence ?? 'ai',
    });
  }

  // Surface positives first, then possibles, then the rest.
  const rank: Record<DetectionStatus, number> = {
    found: 0, possible: 1, inconclusive: 2, not_found: 3, clean: 4, failed: 5,
  };
  return out.sort((a, b) => rank[a.status] - rank[b.status]).slice(0, 8);
}
