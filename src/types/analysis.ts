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
  signer?: string;
  timestamp?: string;
  claims?: string[];
  valid?: boolean;
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
