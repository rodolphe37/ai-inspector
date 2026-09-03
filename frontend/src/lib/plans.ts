/**
 * Plan capability matrix — mirror of backend/app/plans.py and docs/PLANS.md.
 * The backend is authoritative (GET /meta/plans); this copy powers instant,
 * offline UI gating.
 */
import type { PlanTier } from '@/types/user';

export type Feature =
  | 'unicode_analysis'
  | 'basic_metadata'
  | 'full_metadata'
  | 'c2pa'
  | 'statistical_analysis'
  | 'fingerprint_matching'
  | 'detailed_report'
  | 'server_history'
  | 'clean_text'
  | 'clean_image_metadata'
  | 'clean_documents'
  | 'clean_batch'
  | 'report_export'
  | 'batch_analysis'
  | 'api_access';

export interface PlanCapabilities {
  tier: PlanTier;
  requiresAccount: boolean;
  scanLimit: number | null;
  windowHours: number;
  maxFileBytes: number;
  contentTypes: string[];
  features: Record<Feature, boolean>;
}

const F = (list: Feature[]): Record<Feature, boolean> => {
  const all: Feature[] = [
    'unicode_analysis', 'basic_metadata', 'full_metadata', 'c2pa',
    'statistical_analysis', 'fingerprint_matching', 'detailed_report',
    'server_history', 'clean_text', 'clean_image_metadata', 'clean_documents',
    'clean_batch', 'report_export', 'batch_analysis', 'api_access',
  ];
  return Object.fromEntries(all.map((f) => [f, list.includes(f)])) as Record<Feature, boolean>;
};

export const PLANS: Record<PlanTier, PlanCapabilities> = {
  anonymous: {
    tier: 'anonymous',
    requiresAccount: false,
    scanLimit: 5,
    windowHours: 48,
    maxFileBytes: 2 * 1024 * 1024,
    contentTypes: ['text', 'code', 'image'],
    features: F(['unicode_analysis', 'basic_metadata', 'clean_text', 'clean_image_metadata']),
  },
  pro: {
    tier: 'pro',
    requiresAccount: true,
    scanLimit: 300,
    windowHours: 24,
    maxFileBytes: 50 * 1024 * 1024,
    contentTypes: ['text', 'code', 'image', 'pdf', 'docx', 'audio'],
    features: F([
      'unicode_analysis', 'basic_metadata', 'full_metadata', 'c2pa',
      'statistical_analysis', 'fingerprint_matching', 'server_history',
      'clean_text', 'clean_image_metadata', 'clean_documents', 'report_export',
    ]),
  },
  premium: {
    tier: 'premium',
    requiresAccount: true,
    scanLimit: null,
    windowHours: 24,
    maxFileBytes: 200 * 1024 * 1024,
    contentTypes: ['text', 'code', 'image', 'pdf', 'docx', 'audio', 'video'],
    features: F([
      'unicode_analysis', 'basic_metadata', 'full_metadata', 'c2pa',
      'statistical_analysis', 'fingerprint_matching', 'detailed_report',
      'server_history', 'clean_text', 'clean_image_metadata', 'clean_documents',
      'clean_batch', 'report_export', 'batch_analysis', 'api_access',
    ]),
  },
};

/** Live matrix, replaced once GET /meta/plans resolves. */
let matrix: Record<PlanTier, PlanCapabilities> = PLANS;

export function setPlanMatrix(next: Partial<Record<PlanTier, PlanCapabilities>>) {
  matrix = { ...matrix, ...next };
}

export function planFor(tier: PlanTier): PlanCapabilities {
  return matrix[tier] ?? PLANS[tier];
}

export function can(tier: PlanTier, feature: Feature): boolean {
  return Boolean(planFor(tier).features[feature]);
}

export const PLAN_LABELS: Record<PlanTier, string> = {
  anonymous: 'Free',
  pro: 'Pro',
  premium: 'Premium',
};

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}
