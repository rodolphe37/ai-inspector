export type C2PAStatus = 'found' | 'not_found' | 'invalid';

export interface C2PAResult {
  status: C2PAStatus;
  manifest: boolean;
  signer?: string;
  timestamp?: string;
  claims?: string[];
  valid?: boolean;
}
