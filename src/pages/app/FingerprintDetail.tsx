import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Fingerprint as FingerprintIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { fingerprintApi } from '@/services';
import type { Fingerprint, FingerprintStatus } from '@/types/fingerprint';

const statusConfig: Record<FingerprintStatus, { status: 'clean' | 'found' | 'not_found' | 'possible' | 'inconclusive'; label: string }> = {
  available: { status: 'clean', label: 'Available' },
  experimental: { status: 'possible', label: 'Experimental' },
  deprecated: { status: 'not_found', label: 'Deprecated' },
  research: { status: 'inconclusive', label: 'Research' },
};

export default function FingerprintDetail() {
  const { id } = useParams<{ id: string }>();
  const [fp, setFp] = useState<Fingerprint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fingerprintApi.get(id).then((f) => { setFp(f); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

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
          <p className="text-muted">Fingerprint not found.</p>
          <Link to="/app/fingerprints" className="mt-4 inline-block text-primary hover:text-primary-hover">
            Back to fingerprints
          </Link>
        </div>
      </PageTransition>
    );
  }

  const sc = statusConfig[fp.status];

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        <Link to="/app/fingerprints" className="inline-flex items-center gap-1 text-sm text-muted hover:text-content mb-4">
          <ArrowLeft className="h-3.5 w-3.5" />
          Fingerprints
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
            <StatusBadge status={sc.status} label={sc.label} size="md" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="surface p-5">
            <h3 className="text-sm font-semibold text-muted mb-3">Properties</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Type</span>
                <span className="font-medium uppercase">{fp.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Version</span>
                <span className="font-medium">{fp.version}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Target content</span>
                <span className="font-medium capitalize">{fp.targetContent}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Coverage</span>
                <span className="font-medium">{fp.coverage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Last updated</span>
                <span className="font-medium">{fp.lastUpdated}</span>
              </div>
            </div>
          </div>

          <div className="surface p-5">
            <h3 className="text-sm font-semibold text-muted mb-3">Detection metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted">Confidence</span>
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
                <p className="text-sm text-muted mb-1">Detection method</p>
                <p className="text-sm">{fp.detectionMethod}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="surface p-5 mb-6">
          <h3 className="text-sm font-semibold text-muted mb-3">Description</h3>
          <p className="text-sm leading-relaxed">{fp.description}</p>
        </div>

        <div className="surface p-5">
          <h3 className="text-sm font-semibold text-muted mb-4">Capabilities & limitations</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-success mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Can detect
              </h4>
              <ul className="space-y-1.5 text-sm text-muted">
                <li>Known watermark patterns matching this signature</li>
                <li>Statistical distribution anomalies in target content</li>
                <li>Content matching the fingerprint's training parameters</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-warning mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Cannot guarantee
              </h4>
              <ul className="space-y-1.5 text-sm text-muted">
                <li>Detection of unknown or modified watermark schemes</li>
                <li>Absence of all possible watermarks</li>
                <li>Definitive attribution of content origin</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
