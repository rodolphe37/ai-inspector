import type { FingerprintMatch } from '@/types/analysis';

export function matchFingerprints(_text: string): FingerprintMatch[] {
  return [
    {
      id: 'fp_synthid_text',
      name: 'SynthID Text',
      provider: 'Google DeepMind',
      status: 'possible',
      confidence: 87,
      method: 'Token distribution comparison',
    },
    {
      id: 'fp_watermark_x',
      name: 'Watermark-X',
      provider: 'Confidential',
      status: 'not_found',
      confidence: 99,
      method: 'Log-likelihood ratio test',
    },
    {
      id: 'fp_zeta',
      name: 'Fingerprint-Z',
      provider: 'Independent',
      status: 'inconclusive',
      confidence: 54,
      method: 'Structural pattern matching',
    },
  ];
}
