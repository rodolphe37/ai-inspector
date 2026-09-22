/**
 * AI-origin verdict: combines every available signal into one assessment.
 *
 * Confidence ladder:
 *   cryptographic:  a valid C2PA manifest declares (or denies) AI generation
 *   metadata:       generator tags / IPTC declaration / watermark marker
 *   statistical:    forensic estimate only (image frequency analysis, text stylometry)
 */
import type { AiAssessment, AiSignalContribution, FingerprintMatch } from '@/types/analysis';
import type { EngineSignals } from './fingerprints';
import type { ImageAiResult } from './aiImage';
import type { TextAiResult } from './aiText';
import { t } from '@/i18n';

export function assess(
  signals: EngineSignals,
  fingerprints: FingerprintMatch[],
  imageAi: ImageAiResult | null,
  textAi: TextAiResult | null,
): AiAssessment {
  const c = signals.c2pa;
  const contributions: AiSignalContribution[] = [];
  const basis: string[] = [];

  // 1. C2PA: the authoritative path.
  if (c.manifest) {
    if (c.isAiGenerated) {
      const agents = c.softwareAgents?.length ? ` (${c.softwareAgents.join(', ')})` : '';
      basis.push(
        c.verified
          ? t('engine.assess.c2paAiValid', { agents })
          : t('engine.assess.c2paAiInvalid', { agents }),
      );
      contributions.push({
        label: t('engine.assess.c2paAssertion'),
        detail: `${c.generativeType ?? 'trainedAlgorithmicMedia'}${c.signer ? t('engine.assess.signedBy', { signer: c.signer }) : ''}`,
        weight: c.verified ? 1 : 0.7,
      });
      return finish(
        c.verified ? 'ai_confirmed' : 'ai_likely',
        c.verified ? (c.generativeType === 'compositeWithTrainedAlgorithmicMedia' ? 92 : 98) : 72,
        c.verified ? 'cryptographic' : 'metadata',
        basis,
        contributions,
      );
    }
    if (c.verified) {
      basis.push(t('engine.assess.c2paHuman'));
      contributions.push({
        label: t('engine.assess.c2paChain'),
        detail: c.claimGenerator ?? t('engine.assess.signedManifest'),
        weight: 1,
      });
      return finish('human_declared', 6, 'cryptographic', basis, contributions);
    }
  }

  // 2. Metadata / watermark markers (unsigned).
  const metaGen = signals.metadata.entries.find((e) =>
    e.key.toLowerCase().includes('generator signature'),
  );
  const iptcAi = signals.metadata.entries.some(
    (e) =>
      /digitalsourcetype/i.test(e.key) &&
      /trainedalgorithmic|composite/i.test(e.value),
  );
  const fpWatermark = fingerprints.find(
    (f) =>
      (f.status === 'found' || f.status === 'possible') &&
      /synthid|watermark|kgw|green-list/i.test(f.id),
  );

  let metaScore = 0;
  if (metaGen) {
    metaScore = Math.max(metaScore, 0.82);
    basis.push(t('engine.assess.generatorMeta', { value: metaGen.value }));
    contributions.push({ label: t('engine.assess.generatorMetaLabel'), detail: metaGen.value, weight: 0.82 });
  }
  if (iptcAi) {
    metaScore = Math.max(metaScore, 0.75);
    basis.push(t('engine.assess.iptc'));
    contributions.push({ label: 'IPTC DigitalSourceType', detail: 'trainedAlgorithmicMedia', weight: 0.75 });
  }
  if (fpWatermark) {
    metaScore = Math.max(metaScore, fpWatermark.status === 'found' ? 0.78 : 0.45);
    basis.push(t('engine.assess.watermark', { name: fpWatermark.name, status: fpWatermark.status }));
    contributions.push({ label: fpWatermark.name, detail: fpWatermark.method, weight: fpWatermark.status === 'found' ? 0.78 : 0.45 });
  }
  if (metaScore > 0) {
    return finish('ai_likely', Math.round(55 + metaScore * 35), 'metadata', basis, contributions);
  }

  // 3. Forensic estimate.
  if (imageAi && imageAi.usable) {
    for (const s of imageAi.signals) {
      contributions.push({ label: s.label, detail: s.detail, weight: s.weight });
    }
    const p = imageAi.probability;
    basis.push(t('engine.assess.imageEstimate', { p }));
    if (p >= 62) return finish('ai_possible', p, 'statistical', basis, contributions);
    if (p >= 38) return finish('inconclusive', p, 'statistical', basis, contributions);
    return finish('no_evidence', p, 'statistical', basis, contributions);
  }

  if (textAi && textAi.signals.length) {
    for (const s of textAi.signals) {
      contributions.push({ label: s.label, detail: s.detail, weight: s.weight });
    }
    const p = textAi.probability;
    const estimate = signals.contentType === 'code'
      ? t('engine.assess.codeEstimate', { p })
      : t('engine.assess.textEstimate', { p });
    basis.push(`${estimate}${textAi.reliable ? '' : t('engine.assess.lowReliability')}`);
    if (p >= 62) return finish('ai_possible', p, 'statistical', basis, contributions);
    if (p >= 40) return finish('inconclusive', p, 'statistical', basis, contributions);
    return finish('no_evidence', p, 'statistical', basis, contributions);
  }

  basis.push(t('engine.assess.nothing'));
  return finish('no_evidence', 5, 'none', basis, contributions);
}

function finish(
  verdict: AiAssessment['verdict'],
  probability: number,
  confidence: AiAssessment['confidence'],
  basis: string[],
  signals: AiSignalContribution[],
): AiAssessment {
  return {
    verdict,
    probability,
    confidence,
    label: t(`engine.verdict.label.${verdict}`),
    basis,
    signals: signals.sort((a, b) => b.weight - a.weight).slice(0, 8),
    caveat: t(`engine.verdict.caveat.${verdict}`),
  };
}
