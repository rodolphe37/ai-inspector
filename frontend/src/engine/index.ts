/**
 * Client-side provenance analysis orchestrator.
 *
 * Runs the deterministic engine modules in the browser and assembles an
 * AnalysisResult. Every module runs for everyone: there are no tiers.
 */
import type { AnalysisResult, AnalysisType, TimelineEvent } from '@/types/analysis';
import type { Fingerprint } from '@/types/fingerprint';
import { analyzeUnicode } from './unicode';
import { analyzeFileMetadata, analyzeTextMetadata } from './metadata';
import { analyzeC2PA, noC2PA } from './c2pa';
import { analyzeStatistics } from './statistics';
import { fileType, sniff, type Container } from './containers';
import { readDocx, readPdf, type DocumentContent } from './documents';
import { analyzeImageAi } from './aiImage';
import { analyzeTextAi } from './aiText';
import { analyzeCodeAi } from './aiCode';
import { assess } from './assess';
import { matchFingerprints, type EngineSignals } from './fingerprints';
import { buildSummary, disclaimer, scoreSignals } from './score';
import { t } from '@/i18n';
import type { AiAssessment, AnalysisStatus } from '@/types/analysis';

export type AnalyzeInput =
  | { mode: 'text'; text: string; language?: string; name?: string }
  | { mode: 'file'; file: File };

export interface AnalyzeOptions {
  catalog: Fingerprint[];
}

function makeId(): string {
  return `an_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export async function analyzeContent(
  input: AnalyzeInput,
  opts: AnalyzeOptions,
): Promise<AnalysisResult> {
  const { catalog } = opts;
  const date = new Date().toISOString();

  let name: string;
  let type: AnalysisType;
  let text = '';
  let file: File | null = null;
  let bytes: Uint8Array | null = null;
  let container: Container = 'unknown';
  let document: DocumentContent | null = null;

  if (input.mode === 'text') {
    text = input.text;
    name = input.name ?? (input.language && input.language !== 'plaintext'
      ? `snippet.${input.language}` : 'pasted-content.txt');
    type = input.language && input.language !== 'plaintext' ? 'code' : 'text';
  } else {
    file = input.file;
    name = file.name;
    bytes = new Uint8Array(await file.arrayBuffer());
    container = sniff(bytes);
    type = fileType(file.name, file.type, container);
    if (type === 'text' || type === 'code') {
      text = new TextDecoder().decode(bytes);
    } else if (type === 'pdf' || type === 'docx') {
      // Documents: the text goes through the same analyses as pasted text.
      document = await (type === 'pdf' ? readPdf(bytes) : readDocx(bytes)).catch(() => null);
      text = document?.text ?? '';
    }
  }

  const isTextual = type === 'text' || type === 'code';
  const hasText = text.trim().length > 0;
  const isProse = type === 'text' || type === 'pdf' || type === 'docx';

  // --- Unicode (textual content) --------------------------------------
  const unicode = hasText
    ? analyzeUnicode(text)
    : { status: 'clean' as const, invisibleCharacters: 0, controlCharacters: 0, homoglyphs: 0, details: [] };

  // --- Metadata ---------------------------------------------------
  const metadata = isTextual
    ? analyzeTextMetadata(text, name, input.mode === 'text' ? input.language : undefined)
    : file && bytes
      ? await analyzeFileMetadata(file, { bytes, container, document })
      : { status: 'not_found' as const, format: 'UNKNOWN', entries: [] };

  // --- C2PA (the authoritative AI-origin signal) -------------------
  // The c2pa reader handles images, PDF, MP3 / WAV / M4A and MP4 / MOV / AVI.
  const c2pa = file && !isTextual && type !== 'docx' ? await analyzeC2PA(file) : noC2PA;

  // --- Statistics (prose only: letter-frequency is meaningless for code)
  const statistical = isProse && hasText ? analyzeStatistics(text) : null;

  const signals: EngineSignals = { contentType: type, unicode, metadata, c2pa, statistical };

  // --- Fingerprint matching ------------------------------------
  const fingerprints = matchFingerprints(signals, catalog);

  // --- AI-origin detection ------------------------------------
  const hasCameraMetadata = metadata.entries.some((e) =>
    /^(make|model|datetimeoriginal|lensmodel)$/i.test(e.key),
  );
  const imageAi =
    file && type === 'image' ? await analyzeImageAi(file, { hasCameraMetadata }) : null;
  const textAi =
    text.trim().length > 0
      ? type === 'code'
        ? analyzeCodeAi(text, input.mode === 'text' ? input.language : name.split('.').pop())
        : isProse
          ? analyzeTextAi(text)
          : null
      : null;
  const aiAssessment = assess(signals, fingerprints, imageAi, textAi);

  const { score, signalLevel } = scoreSignals(signals, fingerprints);
  const status = deriveStatus(aiAssessment, c2pa.manifest);
  const summary = buildSummary(signals, aiAssessment);

  const timeline = buildTimeline(signals, fingerprints, aiAssessment);

  return {
    id: makeId(),
    name,
    type,
    date,
    status,
    score,
    signalLevel,
    unicode,
    metadata,
    c2pa,
    fingerprints,
    statistical: statistical ?? emptyStatistical(),
    aiAssessment,
    timeline,
    isDemo: false,
    summary,
    disclaimer: disclaimer(),
  };
}

function deriveStatus(ai: AiAssessment, hasManifest: boolean): AnalysisStatus {
  switch (ai.verdict) {
    case 'ai_confirmed':
    case 'ai_likely':
      return 'signal_detected';
    case 'ai_possible':
      return 'possible_signal';
    case 'human_declared':
      return 'c2pa_found';
    case 'inconclusive':
      return 'inconclusive';
    default:
      return hasManifest ? 'c2pa_found' : 'clean';
  }
}

function emptyStatistical() {
  return {
    status: 'inconclusive' as const,
    observedScore: 0,
    threshold: 44.31,
    pValue: 1,
    conclusion: t('engine.statistics.proseOnly'),
    entropy: 0,
    frequencyDeviation: 0,
    watermarkSignal: 0,
    distribution: [],
  };
}

function buildTimeline(
  signals: EngineSignals,
  fingerprints: { status: string; name: string }[],
  ai: AiAssessment,
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const push = (e: Omit<TimelineEvent, 'step'>) => events.push({ ...e, step: events.length + 1 });

  push({
    title: t('engine.timeline.normalised'),
    description: t('engine.timeline.normalisedDesc'),
    icon: 'file',
    status: 'complete',
  });

  push({
    title: t('engine.timeline.verdict', { label: ai.label }),
    description: t('engine.timeline.verdictDesc', {
      confidence: t(`engine.verdict.confidence.${ai.confidence}`),
      basis: ai.basis[0] ?? t('engine.assess.noEvidence'),
    }),
    icon: 'fingerprint',
    status:
      ai.verdict === 'ai_confirmed' || ai.verdict === 'ai_likely'
        ? 'warning'
        : ai.verdict === 'ai_possible' || ai.verdict === 'inconclusive'
          ? 'info'
          : 'complete',
  });

  const u = signals.unicode;
  push({
    title: u.status === 'clean' ? t('engine.timeline.unicodeClean') : t('engine.timeline.unicodeFound'),
    description:
      u.status === 'clean'
        ? t('engine.timeline.unicodeCleanDesc')
        : t('engine.timeline.unicodeFoundDesc', {
          invisible: u.invisibleCharacters, control: u.controlCharacters, homoglyphs: u.homoglyphs,
        }),
    icon: 'type',
    status: u.status === 'clean' ? 'complete' : 'warning',
  });

  push({
    title: signals.metadata.status === 'found' ? t('engine.timeline.metaFound') : t('engine.timeline.metaNone'),
    description: t('engine.timeline.metaDesc', {
      count: signals.metadata.entries.length, format: signals.metadata.format,
    }),
    icon: 'info',
    status: 'info',
  });

  push({
    title: signals.c2pa.manifest ? t('engine.timeline.c2paFound') : t('engine.timeline.c2paNone'),
    description: signals.c2pa.manifest
      ? t('engine.timeline.c2paSigner', { signer: signals.c2pa.signer })
      : t('engine.timeline.c2paNoneDesc'),
    icon: 'shield',
    status: signals.c2pa.manifest ? 'warning' : 'complete',
  });

  if (signals.statistical) {
    push({
      title: t('engine.timeline.statistical'),
      description: signals.statistical.conclusion,
      icon: 'bar-chart',
      status: signals.statistical.status === 'possible' ? 'warning' : 'info',
    });
  }

  const hits = fingerprints.filter((f) => f.status === 'found' || f.status === 'possible');
  push({
    title: hits.length ? t('engine.timeline.fpHits', { count: hits.length }) : t('engine.timeline.fpNone'),
    description: hits.length
      ? hits.map((h) => h.name).join(', ')
      : t('engine.timeline.fpNoneDesc'),
    icon: 'fingerprint',
    status: hits.length ? 'warning' : 'complete',
  });

  return events;
}
