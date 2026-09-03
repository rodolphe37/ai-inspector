/**
 * Client-side provenance analysis orchestrator.
 *
 * Runs the deterministic engine modules in the browser and assembles an
 * AnalysisResult. Which modules run depends on the caller's plan tier.
 */
import type { AnalysisResult, AnalysisType, TimelineEvent } from '@/types/analysis';
import type { Fingerprint } from '@/types/fingerprint';
import type { PlanTier } from '@/types/user';
import { can } from '@/lib/plans';
import { analyzeUnicode } from './unicode';
import { analyzeFileMetadata, analyzeTextMetadata } from './metadata';
import { analyzeC2PA, noC2PA } from './c2pa';
import { analyzeStatistics } from './statistics';
import { analyzeImageAi } from './aiImage';
import { analyzeTextAi } from './aiText';
import { analyzeCodeAi } from './aiCode';
import { assess } from './assess';
import { matchFingerprints, type EngineSignals } from './fingerprints';
import { buildSummary, DISCLAIMER, scoreSignals } from './score';
import type { AiAssessment, AnalysisStatus } from '@/types/analysis';

export type AnalyzeInput =
  | { mode: 'text'; text: string; language?: string; name?: string }
  | { mode: 'file'; file: File };

export interface AnalyzeOptions {
  tier: PlanTier;
  catalog: Fingerprint[];
}

function fileType(name: string, mime: string): AnalysisType {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'tif', 'tiff', 'heic', 'avif'].includes(ext)) return 'image';
  if (['wav', 'mp3', 'flac', 'm4a', 'ogg'].includes(ext)) return 'audio';
  if (['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'rb'].includes(ext)) return 'code';
  if (['txt', 'md', 'json', 'html', 'css', 'csv'].includes(ext)) return 'text';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('text/')) return 'text';
  return 'file';
}

function makeId(): string {
  return `an_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export async function analyzeContent(
  input: AnalyzeInput,
  opts: AnalyzeOptions,
): Promise<AnalysisResult> {
  const { tier, catalog } = opts;
  const date = new Date().toISOString();

  let name: string;
  let type: AnalysisType;
  let text = '';
  let file: File | null = null;

  if (input.mode === 'text') {
    text = input.text;
    name = input.name ?? (input.language && input.language !== 'plaintext'
      ? `snippet.${input.language}` : 'pasted-content.txt');
    type = input.language && input.language !== 'plaintext' ? 'code' : 'text';
  } else {
    file = input.file;
    name = file.name;
    type = fileType(file.name, file.type);
    if (type === 'text' || type === 'code') {
      try {
        text = await file.text();
      } catch {
        text = '';
      }
    }
  }

  const isTextual = type === 'text' || type === 'code';

  // --- Unicode (all tiers, textual content) --------------------------
  const unicode = isTextual
    ? analyzeUnicode(text)
    : { status: 'clean' as const, invisibleCharacters: 0, controlCharacters: 0, homoglyphs: 0, details: [] };

  // --- Metadata (all tiers) ---------------------------------------
  const metadata = isTextual
    ? analyzeTextMetadata(text, name, input.mode === 'text' ? input.language : undefined)
    : file
      ? await analyzeFileMetadata(file)
      : { status: 'not_found' as const, format: 'UNKNOWN', entries: [] };

  // --- C2PA (pro+) ----------------------------------------------
  // --- C2PA (all tiers — the authoritative AI-origin signal) --------
  const c2pa = file && !isTextual ? await analyzeC2PA(file) : noC2PA;

  // --- Statistics (pro+, prose only — letter-frequency is meaningless for code)
  const statistical =
    can(tier, 'statistical_analysis') && type === 'text' && text.trim().length > 0
      ? analyzeStatistics(text)
      : null;

  const signals: EngineSignals = { contentType: type, unicode, metadata, c2pa, statistical };

  // --- Fingerprint matching (pro+) ------------------------------
  const fingerprints = can(tier, 'fingerprint_matching')
    ? matchFingerprints(signals, catalog)
    : [];

  // --- AI-origin detection (all tiers) --------------------------
  const hasCameraMetadata = metadata.entries.some((e) =>
    /^(make|model|datetimeoriginal|lensmodel)$/i.test(e.key),
  );
  const imageAi =
    file && type === 'image' ? await analyzeImageAi(file, { hasCameraMetadata }) : null;
  const textAi =
    text.trim().length > 0
      ? type === 'code'
        ? analyzeCodeAi(text, input.mode === 'text' ? input.language : name.split('.').pop())
        : type === 'text'
          ? analyzeTextAi(text)
          : null
      : null;
  const aiAssessment = assess(signals, fingerprints, imageAi, textAi);

  const { score, signalLevel } = scoreSignals(signals, fingerprints);
  const status = deriveStatus(aiAssessment, c2pa.manifest);
  const summary = buildSummary(signals, aiAssessment);

  const timeline = buildTimeline(signals, fingerprints, aiAssessment, tier);

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
    disclaimer: DISCLAIMER,
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
    conclusion: 'Statistical analysis is available on the Pro and Premium plans.',
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
  tier: PlanTier,
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const push = (e: Omit<TimelineEvent, 'step'>) => events.push({ ...e, step: events.length + 1 });

  push({
    title: 'Content normalised',
    description: 'Input decoded and prepared for inspection.',
    icon: 'file',
    status: 'complete',
  });

  push({
    title: `AI-origin verdict: ${ai.label}`,
    description: `${ai.confidence === 'cryptographic' ? 'Cryptographic' : ai.confidence === 'metadata' ? 'Metadata-based' : ai.confidence === 'statistical' ? 'Forensic estimate' : 'No signal'} — ${ai.basis[0] ?? 'no evidence'}.`,
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
    title: u.status === 'clean' ? 'No Unicode artifacts' : 'Unicode artifacts found',
    description:
      u.status === 'clean'
        ? 'No invisible, control or homoglyph characters detected.'
        : `${u.invisibleCharacters} invisible, ${u.controlCharacters} control, ${u.homoglyphs} homoglyph character(s).`,
    icon: 'type',
    status: u.status === 'clean' ? 'complete' : 'warning',
  });

  push({
    title: signals.metadata.status === 'found' ? 'Metadata extracted' : 'No readable metadata',
    description: `${signals.metadata.entries.length} field(s) read from the ${signals.metadata.format} container.`,
    icon: 'info',
    status: 'info',
  });

  if (can(tier, 'c2pa')) {
    push({
      title: signals.c2pa.manifest ? 'C2PA manifest detected' : 'No C2PA manifest',
      description: signals.c2pa.manifest
        ? `Signer: ${signals.c2pa.signer}. Signature not verified in this tier.`
        : 'No embedded Content Credentials were found.',
      icon: 'shield',
      status: signals.c2pa.manifest ? 'warning' : 'complete',
    });
  }

  if (signals.statistical) {
    push({
      title: 'Statistical analysis',
      description: signals.statistical.conclusion,
      icon: 'bar-chart',
      status: signals.statistical.status === 'possible' ? 'warning' : 'info',
    });
  }

  if (can(tier, 'fingerprint_matching')) {
    const hits = fingerprints.filter((f) => f.status === 'found' || f.status === 'possible');
    push({
      title: hits.length ? `${hits.length} fingerprint signal(s)` : 'No fingerprint matches',
      description: hits.length
        ? hits.map((h) => h.name).join(', ')
        : 'None of the known detection methods produced a positive signal.',
      icon: 'fingerprint',
      status: hits.length ? 'warning' : 'complete',
    });
  }

  return events;
}
