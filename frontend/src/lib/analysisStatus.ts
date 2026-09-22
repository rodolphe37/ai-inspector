import type { AnalysisStatus, DetectionStatus } from '@/types/analysis';
import type { FingerprintStatus } from '@/types/fingerprint';

/** Badge style used for each stored analysis status (label: `status.analysis.*`). */
export const ANALYSIS_BADGE: Record<AnalysisStatus, DetectionStatus> = {
  clean: 'clean',
  possible_signal: 'possible',
  signal_detected: 'possible',
  inconclusive: 'inconclusive',
  c2pa_found: 'found',
  failed: 'not_found',
};

export function badgeFor(status: AnalysisStatus): { badge: DetectionStatus; status: AnalysisStatus } {
  return status in ANALYSIS_BADGE ? { badge: ANALYSIS_BADGE[status], status } : { badge: 'clean', status: 'clean' };
}

/** Badge style for each catalogue status (label: `status.fingerprint.*`). */
export const FINGERPRINT_BADGE: Record<FingerprintStatus, DetectionStatus> = {
  available: 'clean',
  experimental: 'possible',
  deprecated: 'not_found',
  research: 'inconclusive',
};
