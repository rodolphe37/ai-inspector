import { Link } from 'react-router-dom';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQuotaStore } from '@/stores/useQuotaStore';
import { PLANS, PLAN_LABELS, type Feature } from '@/lib/plans';
import type { PlanTier } from '@/types/user';
import { api } from '@/lib/apiClient';

const FEATURE_COPY: Partial<Record<Feature, string>> = {
  c2pa: 'C2PA / Content Credentials inspection',
  statistical_analysis: 'Statistical distribution analysis',
  fingerprint_matching: 'Known-fingerprint matching',
  full_metadata: 'Full EXIF / XMP / IPTC metadata',
  server_history: 'Saved analysis history',
  detailed_report: 'Detailed technical reports',
  clean_documents: 'Cleaning PDF, DOCX and audio files',
  clean_batch: 'Batch cleaning',
  batch_analysis: 'Batch analysis',
  api_access: 'API access',
  report_export: 'Report export (JSON + PDF)',
};

/** Which paid tier first unlocks a feature. */
function requiredTier(feature: Feature): PlanTier {
  if (PLANS.pro.features[feature]) return 'pro';
  return 'premium';
}

export function UpgradePrompt({
  feature,
  title,
  currentPlan,
}: {
  feature: Feature;
  title?: string;
  currentPlan: PlanTier;
}) {
  const need = requiredTier(feature);
  const { status, refreshUser } = useAuthStore();
  const openModal = useQuotaStore((s) => s.openModal);

  const upgrade = async () => {
    const { setTokens } = await import('@/lib/apiClient');
    const tokens = await api.post<import('@/types/user').AuthTokens>('/billing/upgrade', {
      plan: need,
    });
    setTokens(tokens);
    useAuthStore.getState().applyTokens(tokens);
    await refreshUser();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-md mx-auto text-center surface p-8">
        <div className="mx-auto w-fit p-3 rounded-2xl bg-primary/10 text-primary mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold">{title ?? FEATURE_COPY[feature] ?? 'Upgrade required'}</h2>
        <p className="mt-2 text-sm text-muted">
          {FEATURE_COPY[feature] ?? 'This feature'} is available on{' '}
          <span className="text-content font-medium">{PLAN_LABELS[need]}</span>
          {need === 'pro' ? ' and Premium' : ''}. You're on{' '}
          <span className="text-content font-medium">{PLAN_LABELS[currentPlan]}</span>.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          {status === 'authenticated' ? (
            <button
              onClick={upgrade}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Upgrade to {PLAN_LABELS[need]}
            </button>
          ) : (
            <button
              onClick={openModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Create an account
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          <Link to="/pricing" className="text-sm text-muted hover:text-content">
            Compare plans
          </Link>
        </div>
      </div>
    </div>
  );
}
