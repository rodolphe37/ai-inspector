import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Fingerprint as FingerprintIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useTranslation } from 'react-i18next';
import { fingerprintApi } from '@/services';
import { FINGERPRINT_BADGE } from '@/lib/analysisStatus';
import type { Fingerprint } from '@/types/fingerprint';

export default function FingerprintDetail() {
  const { id } = useParams<{ id: string }>();
  const [fp, setFp] = useState<Fingerprint | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!id) return;
    fingerprintApi.get(id).then((f) => { setFp(f); setLoading(false); }).catch(() => setLoading(false));
  }, [id, i18n.language]);

  if (loading) {
    return (
      <PageTransition>
        <div className="p-8">
          <div className="h-8 w-48 bg-surface-2 rounded animate-pulse mb-4" />
          <div className="h-32 bg-surface-2 rounded animate-pulse" />
        </div>
      </PageTransition>
    );
  }

  if (!fp) {
    return (
      <PageTransition>
        <div className="p-8 text-center">
          <p className="text-muted">{t('fingerprints.notFound')}</p>
          <Link to="/app/fingerprints" className="mt-4 inline-block text-primary hover:text-primary-hover">
            {t('fingerprints.back')}
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-8">
        <Link to="/app/fingerprints" className="inline-flex items-center gap-1 text-sm text-muted hover:text-content mb-4">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('nav.app.fingerprints')}
        </Link>

        <div className="surface p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <FingerprintIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{fp.name}</h1>
                <p className="text-sm text-muted mt-1">{fp.provider}</p>
              </div>
            </div>
            <StatusBadge status={FINGERPRINT_BADGE[fp.status]} label={t(`status.fingerprint.${fp.status}`)} size="md" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="surface p-5">
            <h3 className="text-sm font-semibold text-muted mb-3">{t('fingerprints.properties')}</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t('common.table.type')}</span>
                <span className="font-medium uppercase">{t(`status.method.${fp.type}`, { defaultValue: fp.type })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t('fingerprints.version')}</span>
                <span className="font-medium">{fp.version}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t('fingerprints.target')}</span>
                <span className="font-medium capitalize">{t(`status.type.${fp.targetContent}`, { defaultValue: fp.targetContent })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t('fingerprints.coverage')}</span>
                <span className="font-medium">{fp.coverage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t('fingerprints.updated')}</span>
                <span className="font-medium">{fp.lastUpdated}</span>
              </div>
            </div>
          </div>

          <div className="surface p-5">
            <h3 className="text-sm font-semibold text-muted mb-3">{t('fingerprints.metrics')}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted">{t('fingerprints.confidence')}</span>
                  <span className="font-medium tabular-nums">{fp.confidence}%</span>
                </div>
                <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fp.confidence}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      fp.confidence >= 80 ? 'bg-success' : fp.confidence >= 50 ? 'bg-warning' : 'bg-error'
                    }`}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">{t('fingerprints.method')}</p>
                <p className="text-sm">{fp.detectionMethod}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="surface p-5 mb-6">
          <h3 className="text-sm font-semibold text-muted mb-3">{t('fingerprints.description')}</h3>
          <p className="text-sm leading-relaxed">{fp.description}</p>
        </div>

        <div className="surface p-5">
          <h3 className="text-sm font-semibold text-muted mb-4">{t('fingerprints.capabilities')}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-success mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {t('howItWorks.can.title')}
              </h4>
              <ul className="space-y-1.5 text-sm text-muted">
                {(t('fingerprints.can', { returnObjects: true }) as string[]).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-warning mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                {t('howItWorks.cannot.title')}
              </h4>
              <ul className="space-y-1.5 text-sm text-muted">
                {(t('fingerprints.cannot', { returnObjects: true }) as string[]).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
