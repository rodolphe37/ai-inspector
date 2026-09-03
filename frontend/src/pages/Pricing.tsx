import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQuotaStore } from '@/stores/useQuotaStore';
import { api } from '@/lib/apiClient';
import type { AuthTokens } from '@/types/user';

const plans = [
  {
    id: 'anonymous' as const,
    name: 'Free',
    description: 'No account. Analyse in your browser.',
    monthly: 0,
    yearly: 0,
    features: [
      '5 scans per 48 hours',
      'Unicode artifact analysis',
      'Basic metadata inspection',
      'Text + image files up to 2 MB',
      'Local history (this device only)',
      'Clean invisible characters & image metadata',
    ],
    cta: 'Start analysing',
    highlight: false,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    description: 'For professionals and researchers',
    monthly: 24,
    yearly: 19,
    features: [
      '300 scans per day',
      'Full EXIF / XMP / IPTC metadata',
      'C2PA / Content Credentials inspection',
      'Statistical distribution analysis (χ², entropy, p-value)',
      'Known-fingerprint matching',
      'Synced, unlimited history',
      'PDF, DOCX, audio · files up to 50 MB',
      'Report export (JSON + PDF)',
    ],
    cta: 'Get Pro',
    highlight: true,
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    description: 'For power users and teams',
    monthly: 99,
    yearly: 79,
    features: [
      'Everything in Pro',
      'Unlimited scans',
      'Detailed / technical reports',
      'Batch analysis & batch cleaning',
      'Files up to 200 MB',
      'API access (API key)',
    ],
    cta: 'Get Premium',
    highlight: false,
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const { status, plan: currentPlan, applyTokens } = useAuthStore();
  const openModal = useQuotaStore((s) => s.openModal);

  const choose = async (id: 'anonymous' | 'pro' | 'premium') => {
    if (id === 'anonymous') return; // link handles it
    if (status !== 'authenticated') {
      openModal();
      return;
    }
    setBusy(id);
    try {
      const tokens = await api.post<AuthTokens>('/billing/upgrade', { plan: id });
      applyTokens(tokens);
    } finally {
      setBusy(null);
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-4xl font-bold tracking-tight">
            Simple, transparent pricing
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Use it free without an account. Upgrade for the full analysis pipeline.
          </motion.p>

          <div className="mt-8 inline-flex items-center gap-3">
            <span className={`text-sm ${!yearly ? 'text-content font-medium' : 'text-muted'}`}>Monthly</span>
            <button onClick={() => setYearly(!yearly)} className={`relative h-7 w-12 rounded-full transition-colors ${yearly ? 'bg-primary' : 'bg-border-hover'}`}>
              <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-1 h-5 w-5 rounded-full bg-white" style={{ left: yearly ? '1.5rem' : '0.25rem' }} />
            </button>
            <span className={`text-sm ${yearly ? 'text-content font-medium' : 'text-muted'}`}>
              Yearly<span className="ml-1.5 text-xs text-success">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const isCurrent = status === 'authenticated' ? currentPlan === plan.id : plan.id === 'anonymous';
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`surface p-6 relative ${plan.highlight ? 'border-primary glow-primary' : ''}`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted mt-1">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span key={yearly ? 'y' : 'm'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-4xl font-bold tabular-nums">
                      ${yearly ? plan.yearly : plan.monthly}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-sm text-muted">/month</span>
                </div>
                {yearly && plan.monthly > 0 && (
                  <p className="text-xs text-success mt-1">Billed annually (${plan.yearly * 12}/year)</p>
                )}

                {plan.id === 'anonymous' ? (
                  <Link to="/app/analyze" className="mt-6 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium border border-default text-content hover:bg-surface-2 transition-colors">
                    {isCurrent ? 'Current plan' : plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    onClick={() => choose(plan.id)}
                    disabled={isCurrent || busy === plan.id}
                    className={`mt-6 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
                      plan.highlight ? 'bg-primary text-white hover:bg-primary-hover' : 'border border-default text-content hover:bg-surface-2'
                    }`}
                  >
                    {isCurrent ? 'Current plan' : busy === plan.id ? 'Upgrading…' : plan.cta}
                    {!isCurrent && <ArrowRight className="h-4 w-4" />}
                  </button>
                )}

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Sparkles className="h-6 w-6 text-primary mx-auto mb-3" />
          <p className="text-sm text-muted max-w-lg mx-auto">
            Content is always analysed in your browser — plans differ in depth, quota and storage.
            An absence of signal does not constitute proof of human origin.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
