export type AnalysisType = 'text' | 'code' | 'image' | 'audio' | 'file';
export type AnalysisStatus =
  | 'clean'
  | 'possible_signal'
  | 'signal_detected'
  | 'inconclusive'
  | 'c2pa_found'
  | 'failed';

export type SignalLevel = 'clean' | 'low' | 'moderate' | 'high' | 'critical';
export type DetectionStatus = 'clean' | 'found' | 'not_found' | 'possible' | 'inconclusive' | 'failed';

export interface Analysis {
  id: string;
  name: string;
  type: AnalysisType;
  date: string;
  status: AnalysisStatus;
  score: number;
  size?: number;
  language?: string;
}

export interface UnicodeResult {
  status: DetectionStatus;
  invisibleCharacters: number;
  controlCharacters: number;
  homoglyphs: number;
  details: UnicodeFinding[];
}

export interface UnicodeFinding {
  type: 'invisible' | 'control' | 'homoglyph';
  character: string;
  codepoint: string;
  position: number;
  description: string;
}

export interface MetadataEntry {
  key: string;
  value: string;
}

export interface MetadataResult {
  status: DetectionStatus;
  entries: MetadataEntry[];
  format: string;
}

export interface C2PAResult {
  status: DetectionStatus;
  manifest: boolean;
  /** Signature chain validated with no errors. */
  verified?: boolean;
  validationState?: 'valid' | 'invalid' | 'unknown';
  signer?: string;
  timestamp?: string;
  claimGenerator?: string;
  /** A generative-AI assertion is present in the (active) manifest. */
  isAiGenerated?: boolean;
  generativeType?: 'trainedAlgorithmicMedia' | 'compositeWithTrainedAlgorithmicMedia' | 'legacy';
  softwareAgents?: string[];
  claims?: string[];
  errors?: string[];
  valid?: boolean;
}

export type AiVerdict =
  | 'ai_confirmed'
  | 'ai_likely'
  | 'ai_possible'
  | 'inconclusive'
  | 'no_evidence'
  | 'human_declared';

export type AiConfidenceBasis = 'cryptographic' | 'metadata' | 'statistical' | 'none';

export interface AiSignalContribution {
  label: string;
  detail: string;
  weight: number; // 0..1 contribution to the probability
}

export interface AiAssessment {
  verdict: AiVerdict;
  /** 0-100. For `cryptographic` this is near-certain; for `statistical` it is an estimate. */
  probability: number;
  confidence: AiConfidenceBasis;
  label: string;
  basis: string[];
  signals: AiSignalContribution[];
  caveat: string;
}

export interface FingerprintMatch {
  id: string;
  name: string;
  provider: string;
  status: DetectionStatus;
  confidence: number;
  method: string;
}

export interface StatisticalResult {
  status: DetectionStatus;
  observedScore: number;
  threshold: number;
  pValue: number;
  conclusion: string;
  distribution: { label: string; observed: number; expected: number }[];
  entropy: number;
  frequencyDeviation: number;
  watermarkSignal: number;
  /** Reference language of the letter-frequency test (absent on older results). */
  language?: 'en' | 'fr';
}

export interface AnalysisStep {
  id: number;
  label: string;
  status: 'pending' | 'running' | 'complete';
}

export interface TimelineEvent {
  step: number;
  title: string;
  description: string;
  icon: string;
  status: 'complete' | 'info' | 'warning';
}

export interface AnalysisResult {
  id: string;
  name: string;
  type: AnalysisType;
  date: string;
  status: AnalysisStatus;
  score: number;
  signalLevel: SignalLevel;
  unicode: UnicodeResult;
  metadata: MetadataResult;
  c2pa: C2PAResult;
  fingerprints: FingerprintMatch[];
  statistical: StatisticalResult;
  aiAssessment: AiAssessment;
  timeline: TimelineEvent[];
  isDemo: boolean;
  summary: string;
  disclaimer: string;
}

export interface CleanResult {
  id: string;
  operations: string[];
  beforeSize: number;
  afterSize: number;
  removed: { type: string; count: number }[];
}
