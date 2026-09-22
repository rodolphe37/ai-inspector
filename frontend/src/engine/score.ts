/**
 * Deterministic aggregation of engine signals into a single "signal level".
 *
 * The score is NOT a probability of AI vs human authorship. It expresses how
 * much *known provenance signal* the deterministic checks found.
 */
import type { AiAssessment, AnalysisStatus, FingerprintMatch, SignalLevel } from '@/types/analysis';
import type { EngineSignals } from './fingerprints';
import { isBidiFinding } from './unicode';
import { t } from '@/i18n';

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
    const aiClaim = Boolean(signals.c2pa.isAiGenerated);
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

  const u = signals.unicode;
  const bidi = u.details.some(isBidiFinding);
  if (signals.contentType === 'code' && (bidi || u.homoglyphs > 0)) {
    const what = [
      bidi ? t('engine.summary.bidi') : '',
      u.homoglyphs ? t('engine.summary.homoglyphs', { count: u.homoglyphs }) : '',
    ].filter(Boolean).join(t('engine.summary.and'));
    const label = `${ai.label}${ai.confidence === 'statistical' ? ` (${ai.probability}%)` : ''}`;
    return t('engine.summary.trojan', { what, label });
  }

  const extra: string[] = [];
  if (u.invisibleCharacters) extra.push(t('engine.summary.invisible', { count: u.invisibleCharacters }));
  if (u.homoglyphs) extra.push(t('engine.summary.homoglyphsShort', { count: u.homoglyphs }));
  if (signals.c2pa.manifest && !signals.c2pa.isAiGenerated) {
    extra.push(t('engine.summary.c2pa'));
  }

  const tail = extra.length ? t('engine.summary.alsoFound', { items: extra.join(', ') }) : '';
  return `${head} ${ai.basis[0] ?? ''}.${tail}`.replace(/\.\./g, '.');
}

/** Disclaimer in the current language (stored with each result). */
export function disclaimer(): string {
  return t('engine.disclaimer');
}
