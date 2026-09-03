export type FingerprintType = 'statistical' | 'structural' | 'cryptographic' | 'pattern';
export type FingerprintStatus = 'available' | 'experimental' | 'deprecated' | 'research';

export interface Fingerprint {
  id: string;
  name: string;
  provider: string;
  type: FingerprintType;
  version: string;
  status: FingerprintStatus;
  description: string;
  lastUpdated: string;
  confidence: number;
  detectionMethod: string;
  targetContent: 'text' | 'image' | 'audio' | 'files';
  coverage: string;
}
