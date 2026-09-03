/**
 * Deterministic aggregation of engine signals into a single "signal level".
 *
 * The score is NOT a probability of AI vs human authorship. It expresses how
 * much *known provenance signal* the deterministic checks found.
 */
import type { AnalysisStatus, FingerprintMatch, SignalLevel } from '@/types/analysis';
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

export function buildSummary(signals: EngineSignals): string {
  const parts: string[] = [];
  const u = signals.unicode;
  if (u.invisibleCharacters) parts.push(`${u.invisibleCharacters} invisible/tag character(s)`);
  if (u.homoglyphs) parts.push(`${u.homoglyphs} homoglyph(s)`);
  if (u.controlCharacters) parts.push(`${u.controlCharacters} control character(s)`);
  if (signals.c2pa.manifest) parts.push('an embedded C2PA manifest');
  if (signals.statistical?.status === 'possible') parts.push('a statistical distribution anomaly');
  const genSig = signals.metadata.entries.find((e) =>
    e.key.toLowerCase().includes('generator signature'),
  );
  if (genSig) parts.push(genSig.value);

  if (!parts.length) {
    return 'No known provenance signals were detected by the deterministic checks. This is not proof of human origin.';
  }
  return `Detected ${parts.join(', ')}. A detected signal does not by itself establish how the content was produced.`;
}

export const DISCLAIMER =
  'An absence of signal does not constitute proof of human origin, and a detected ' +
  'signal does not constitute proof of machine generation. This analysis inspects ' +
  'for known technical signals only.';
