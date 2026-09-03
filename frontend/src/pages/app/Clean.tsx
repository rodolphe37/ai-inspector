import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Eye, AlertTriangle, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { Modal } from '@/components/ui/Modal';
import type { CleanOperation } from '@/types/settings';

const operations: CleanOperation[] = [
  {
    id: 'unicode',
    label: 'Remove invisible Unicode',
    description: 'Strip zero-width spaces, joiners, directional marks and other invisible characters.',
    risk: 'safe',
    enabled: false,
  },
  {
    id: 'metadata',
    label: 'Remove metadata',
    description: 'Delete embedded metadata fields such as creator, creation date, and software.',
    risk: 'safe',
    enabled: false,
  },
  {
    id: 'exif',
    label: 'Remove EXIF data',
    description: 'Strip EXIF information from image files (GPS, camera, settings).',
    risk: 'safe',
    enabled: false,
  },
  {
    id: 'xmp',
    label: 'Remove XMP data',
    description: 'Remove Adobe XMP metadata blocks from files.',
    risk: 'safe',
    enabled: false,
  },
  {
    id: 'c2pa',
    label: 'Remove C2PA provenance',
    description: 'Strip C2PA manifest and cryptographic provenance signatures.',
    risk: 'warning',
    enabled: false,
  },
];

const riskConfig = {
  safe: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', label: 'SAFE', icon: CheckCircle2 },
  warning: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', label: 'WARNING', icon: AlertTriangle },
  danger: { color: 'text-error', bg: 'bg-error/10', border: 'border-error/20', label: 'DANGER', icon: AlertTriangle },
};

const beforeText = 'The rapid\u200b advancement of machine learning\u200d models has transformed how we interact with digital content. Understanding the provenance of information is essential for maintaining trust in media ecosystems.';
const afterText = 'The rapid advancement of machine learning models has transformed how we interact with digital content. Understanding the provenance of information is essential for maintaining trust in media ecosystems.';

export default function Clean() {
  const [ops, setOps] = useState(operations);
  const [showPreview, setShowPreview] = useState(false);
  const [cleaned, setCleaned] = useState(false);

  const toggle = (id: string) => {
    setOps((prev) => prev.map((op) => (op.id === id ? { ...op, enabled: !op.enabled } : op)));
  };

  const enabledCount = ops.filter((o) => o.enabled).length;

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Clean content</h1>
          <p className="mt-1 text-muted">Remove detectable metadata and safe-to-remove artifacts.</p>
        </div>

        {/* Warning banner */}
        <div className="flex gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20 mb-6">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted">
            Removing provenance metadata may permanently remove information about the content's origin.
            This action cannot be undone.
          </p>
        </div>

        {/* Operations */}
        <div className="space-y-3 mb-6">
          {ops.map((op, i) => {
            const rc = riskConfig[op.risk];
            return (
              <motion.div
                key={op.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="surface p-4"
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggle(op.id)}
                    className={`relative h-6 w-11 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
                      op.enabled ? 'bg-primary' : 'bg-border-hover'
                    }`}
                  >
                    <motion.span
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-0.5 h-5 w-5 rounded-full bg-white"
                      style={{ left: op.enabled ? '1.375rem' : '0.125rem' }}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold">{op.label}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${rc.bg} ${rc.border} ${rc.color}`}>
                        {rc.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted mt-1">{op.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Important note */}
        <div className="surface p-4 mb-6 border-info/20">
          <div className="flex gap-3">
            <Eye className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted">
              This demo does not remove statistical watermarks. Statistical watermark removal
              requires server-side processing and is not available in this version.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowPreview(true)}
            disabled={enabledCount === 0}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-default text-sm font-medium hover:bg-surface-2 transition-colors disabled:opacity-50"
          >
            <Eye className="h-4 w-4" />
            Preview changes
          </button>
          <button
            onClick={() => { setCleaned(true); setTimeout(() => setCleaned(false), 3000); }}
            disabled={enabledCount === 0}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            Clean
          </button>
        </div>

        <AnimatePresence>
          {cleaned && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20"
            >
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-sm text-success">Content cleaned successfully (demo).</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview modal */}
      <Modal open={showPreview} onClose={() => setShowPreview(false)} title="Preview changes" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {enabledCount} operation{enabledCount !== 1 ? 's' : ''} selected. Here's a comparison
            of your content before and after cleaning.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowLeft className="h-4 w-4 text-muted" />
                <span className="text-sm font-semibold">Before</span>
              </div>
              <div className="surface-2 p-4 rounded-lg font-mono text-xs text-muted max-h-48 overflow-y-auto">
                {beforeText}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="h-4 w-4 text-success" />
                <span className="text-sm font-semibold text-success">After</span>
              </div>
              <div className="surface-2 p-4 rounded-lg font-mono text-xs text-content max-h-48 overflow-y-auto border-success/20">
                {afterText}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 rounded-lg border border-default text-sm font-medium hover:bg-surface-2 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => { setShowPreview(false); setCleaned(true); setTimeout(() => setCleaned(false), 3000); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Apply changes
            </button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}
