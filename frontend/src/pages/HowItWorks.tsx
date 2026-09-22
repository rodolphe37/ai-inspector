import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, Search, Fingerprint, BarChart3,
  FileCheck, Sparkles, ArrowRight, CheckCircle2, XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';

const steps = [
  { num: '01', icon: FileText, key: 'normalize' },
  { num: '02', icon: Search, key: 'inspect' },
  { num: '03', icon: Fingerprint, key: 'detect' },
  { num: '04', icon: BarChart3, key: 'measure' },
  { num: '05', icon: FileCheck, key: 'verdict' },
  { num: '06', icon: Sparkles, key: 'clean' },
] as const;

export default function HowItWorks() {
  const { t } = useTranslation();
  const canDetect = t('howItWorks.can.items', { returnObjects: true }) as string[];
  const cannotGuarantee = t('howItWorks.cannot.items', { returnObjects: true }) as string[];
  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            {t('howItWorks.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted max-w-2xl mx-auto"
          >
            {t('howItWorks.subtitle')}
          </motion.p>
        </div>

        {/* Pipeline */}
        <div className="mb-20">
          <div className="space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 pb-8 last:pb-0 relative"
              >
                {i < steps.length - 1 && (
                  <div className="absolute left-7 top-16 bottom-0 w-px bg-border-hover" />
                )}
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                    <step.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl font-bold text-primary/40 tabular-nums">{step.num}</span>
                    <h3 className="text-xl font-semibold">{t(`howItWorks.steps.${step.key}.title`)}</h3>
                  </div>
                  <p className="text-muted max-w-2xl">{t(`howItWorks.steps.${step.key}.description`)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Can / Cannot */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-3">
            {t('howItWorks.limits.title')}
          </h2>
          <p className="text-muted text-center max-w-xl mx-auto mb-10">{t('howItWorks.limits.subtitle')}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="surface p-6 border-success/20">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-success mb-4">
                <CheckCircle2 className="h-5 w-5" />
                {t('howItWorks.can.title')}
              </h3>
              <ul className="space-y-3">
                {canDetect.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="surface p-6 border-warning/20">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-warning mb-4">
                <XCircle className="h-5 w-5" />
                {t('howItWorks.cannot.title')}
              </h3>
              <ul className="space-y-3">
                {cannotGuarantee.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <XCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="surface p-6 border-warning/20 mb-12">
          <p className="text-sm text-muted text-center">
            {t('howItWorks.disclaimer')}
          </p>
        </div>

        <div className="text-center">
          <Link
            to="/app/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            {t('howItWorks.cta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
