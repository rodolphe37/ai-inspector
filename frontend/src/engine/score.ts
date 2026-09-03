/**
 * Deterministic aggregation of engine signals into a single "signal level".
 *
 * The score is NOT a probability of AI vs human authorship. It expresses how
 * much *known provenance signal* the deterministic checks found.
 */
import type { AiAssessment, AnalysisStatus, FingerprintMatch, SignalLevel } from '@/types/analysis';
import type { EngineSignals } from './fingerprints';

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

export function scoreSignals(
  signals: EngineSignals,
  fingerprints: FingerprintMatch[],
): { score: number; signalLevel: SignalLevel; status: AnalysisStatus } {
  let score = 0;

  const u = signals.unicode;
  score += Math.min(30, u.invisibleCharacters * 8);
  score += Math.min(25, u.homoglyphs * 10);
  score += Math.min(15, u.controlCharacters * 5);

  if (signals.c2pa.manifest) {
    const aiClaim = (signals.c2pa.claims ?? []).some((c) => /ai|trained|generat/i.test(c));
    score += aiClaim ? 42 : 26;
  }

  if (signals.metadata.entries.some((e) => e.key.toLowerCase().includes('generator signature'))) {
    score += 30;
  }
  if (signals.metadata.entries.some((e) => /digitalsourcetype/i.test(e.key))) {
    score += 20;
  }

  if (signals.statistical && signals.statistical.status === 'possible') {
    score += Math.min(35, signals.statistical.watermarkSignal * 5);
  }

  const found = fingerprints.filter((f) => f.status === 'found').length;
  const possible = fingerprints.filter((f) => f.status === 'possible').length;
  score += Math.min(45, found * 25 + possible * 12);

  score = Math.round(clamp(score));

  const signalLevel: SignalLevel =
    score <= 12 ? 'clean' :
    score <= 32 ? 'low' :
    score <= 58 ? 'moderate' :
    score <= 80 ? 'high' : 'critical';

  const onlyInconclusive =
    score < 30 &&
    fingerprints.some((f) => f.status === 'inconclusive') &&
    fingerprints.every((f) => f.status !== 'found' && f.status !== 'possible');

  let status: AnalysisStatus;
  if (signals.c2pa.manifest) status = 'c2pa_found';
  else if (score >= 58) status = 'signal_detected';
  else if (score >= 30) status = 'possible_signal';
  else if (onlyInconclusive) status = 'inconclusive';
  else status = 'clean';

  return { score, signalLevel, status };
}

export function buildSummary(signals: EngineSignals, ai: AiAssessment): string {
  const head = `${ai.label}${
    ai.confidence === 'statistical' || ai.confidence === 'metadata'
      ? ` (${ai.probability}%)`
      : ''
  }.`;

  const extra: string[] = [];
  const u = signals.unicode;
  if (u.invisibleCharacters) extra.push(`${u.invisibleCharacters} invisible/tag character(s)`);
  if (u.homoglyphs) extra.push(`${u.homoglyphs} homoglyph(s)`);
  if (signals.c2pa.manifest && !signals.c2pa.isAiGenerated) {
    extra.push('an embedded C2PA provenance manifest');
  }

  const tail = extra.length ? ` Also found: ${extra.join(', ')}.` : '';
  return `${head} ${ai.basis[0] ?? ''}.${tail}`.replace(/\.\./g, '.');
}

export const DISCLAIMER =
  'An absence of signal does not constitute proof of human origin, and a detected ' +
  'signal does not constitute proof of machine generation. This analysis inspects ' +
  'for known technical signals only.';
