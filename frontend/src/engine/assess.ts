/**
 * AI-origin verdict — combines every available signal into one assessment.
 *
 * Confidence ladder:
 *   cryptographic  — a valid C2PA manifest declares (or denies) AI generation
 *   metadata       — generator tags / IPTC declaration / watermark marker
 *   statistical    — forensic estimate only (image frequency analysis, text stylometry)
 */
import type { AiAssessment, AiSignalContribution, FingerprintMatch } from '@/types/analysis';
import type { EngineSignals } from './fingerprints';
import type { ImageAiResult } from './aiImage';
import type { TextAiResult } from './aiText';

const LABELS: Record<AiAssessment['verdict'], string> = {
  ai_confirmed: 'AI-generated — confirmed',
  ai_likely: 'Likely AI-generated',
  ai_possible: 'Possible AI generation',
  inconclusive: 'Inconclusive',
  no_evidence: 'No AI-origin evidence found',
  human_declared: 'Declared non-AI capture',
};

const CAVEATS: Record<AiAssessment['verdict'], string> = {
  ai_confirmed:
    'A cryptographically signed manifest states this. Verify the signer is one you trust.',
  ai_likely:
    'Based on metadata or a watermark marker, which can be removed or forged. Treat as a strong hint, not proof.',
  ai_possible:
    'A forensic estimate from statistical signals. It has a real false-positive rate on edited, upscaled, translated or non-native content, and on short samples. Not proof.',
  inconclusive: 'Not enough signal to make a call in either direction.',
  no_evidence:
    'No AI-provenance signal was found. This is NOT evidence of human authorship — signals are routinely stripped by re-encoding, screenshots and social platforms.',
  human_declared:
    'Signed Content Credentials describe a non-AI capture/edit chain. Still verify the signer.',
};

export function assess(
  signals: EngineSignals,
  fingerprints: FingerprintMatch[],
  imageAi: ImageAiResult | null,
  textAi: TextAiResult | null,
): AiAssessment {
  const c = signals.c2pa;
  const contributions: AiSignalContribution[] = [];
  const basis: string[] = [];

  // 1. C2PA — the authoritative path.
  if (c.manifest) {
    if (c.isAiGenerated) {
      const agents = c.softwareAgents?.length ? ` (${c.softwareAgents.join(', ')})` : '';
      basis.push(
        c.verified
          ? `Valid C2PA Content Credentials declare an AI-generated source${agents}`
          : `C2PA manifest declares an AI-generated source${agents} — signature did NOT validate`,
      );
      contributions.push({
        label: 'C2PA generative assertion',
        detail: `${c.generativeType ?? 'trainedAlgorithmicMedia'}${c.signer ? ` · signed by ${c.signer}` : ''}`,
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
      basis.push('Valid C2PA Content Credentials with no AI-generation assertion (capture / human edit chain)');
      contributions.push({ label: 'C2PA provenance chain', detail: c.claimGenerator ?? 'signed manifest', weight: 1 });
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
    basis.push(`Generator metadata present — ${metaGen.value}`);
    contributions.push({ label: 'Generator metadata', detail: metaGen.value, weight: 0.82 });
  }
  if (iptcAi) {
    metaScore = Math.max(metaScore, 0.75);
    basis.push('IPTC DigitalSourceType declares trained-algorithm / composite media');
    contributions.push({ label: 'IPTC DigitalSourceType', detail: 'trainedAlgorithmicMedia', weight: 0.75 });
  }
  if (fpWatermark) {
    metaScore = Math.max(metaScore, fpWatermark.status === 'found' ? 0.78 : 0.45);
    basis.push(`Watermark signal: ${fpWatermark.name} (${fpWatermark.status})`);
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
    basis.push(`Image forensic estimate: ${p}% (frequency-domain + noise analysis)`);
    if (p >= 62) return finish('ai_possible', p, 'statistical', basis, contributions);
    if (p >= 38) return finish('inconclusive', p, 'statistical', basis, contributions);
    return finish('no_evidence', p, 'statistical', basis, contributions);
  }

  if (textAi && textAi.signals.length) {
    for (const s of textAi.signals) {
      contributions.push({ label: s.label, detail: s.detail, weight: s.weight });
    }
    const p = textAi.probability;
    basis.push(
      `Text stylometric estimate: ${p}%${textAi.reliable ? '' : ' (short sample — low reliability)'}`,
    );
    if (p >= 62) return finish('ai_possible', p, 'statistical', basis, contributions);
    if (p >= 40) return finish('inconclusive', p, 'statistical', basis, contributions);
    return finish('no_evidence', p, 'statistical', basis, contributions);
  }

  basis.push('No provenance manifest, metadata or usable forensic signal.');
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
    label: LABELS[verdict],
    basis,
    signals: signals.sort((a, b) => b.weight - a.weight).slice(0, 8),
    caveat: CAVEATS[verdict],
  };
}
