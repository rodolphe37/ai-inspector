import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Fingerprint, Search, ArrowRight, Eye } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTranslation } from 'react-i18next';
import { fingerprintApi } from '@/services';
import { FINGERPRINT_BADGE } from '@/lib/analysisStatus';
import type { Fingerprint as FingerprintType } from '@/types/fingerprint';

const typeColors: Record<string, string> = {
  statistical: 'text-info',
  structural: 'text-primary',
  cryptographic: 'text-success',
  pattern: 'text-warning',
};

export default function Fingerprints() {
  const [fingerprints, setFingerprints] = useState<FingerprintType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fingerprintApi
      .list()
      .then(setFingerprints)
      .catch(() => setFingerprints([]))
      .finally(() => setLoading(false));
  }, [i18n.language]);

  const filtered = fingerprints.filter(
    (f) => f.name.toLowerCase().includes(search.toLowerCase()) || f.provider.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{t('fingerprints.title')}</h1>
          <p className="mt-1 text-muted">{t('fingerprints.subtitle')}</p>
        </div>

        <div className="relative max-w-xs mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('fingerprints.search')}
            className="w-full pl-10 pr-4 py-2 bg-surface-2 border border-default rounded-lg text-sm text-content focus:outline-none focus:border-primary"
          />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="surface p-5 animate-pulse">
                <div className="h-5 w-32 bg-surface-2 rounded mb-3" />
                <div className="h-4 w-48 bg-surface-2 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Fingerprint className="h-8 w-8" />}
            title={t('fingerprints.empty')}
            description={t('fingerprints.emptyDesc')}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((fp, i) => {
              return (
                <motion.div
                  key={fp.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <Link to={`/app/fingerprints/${fp.id}`} className="surface p-5 block group">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-surface-2 ${typeColors[fp.type] || 'text-primary'}`}>
                        <Fingerprint className="h-5 w-5" />
                      </div>
                      <StatusBadge status={FINGERPRINT_BADGE[fp.status]} label={t(`status.fingerprint.${fp.status}`)} />
                    </div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{fp.name}</h3>
                    <p className="text-xs text-muted mt-0.5">{fp.provider}</p>
                    <p className="text-sm text-muted mt-3 line-clamp-2">{fp.description}</p>
                    <div className="mt-4 flex items-center gap-3 text-xs text-subtle">
                      <span className="uppercase">{t(`status.method.${fp.type}`, { defaultValue: fp.type })}</span>
                      <span>·</span>
                      <span>v{fp.version}</span>
                      <span>·</span>
                      <span className="capitalize">{t(`status.type.${fp.targetContent}`, { defaultValue: fp.targetContent })}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
                      <Eye className="h-3.5 w-3.5" />
                      {t('fingerprints.details')}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
