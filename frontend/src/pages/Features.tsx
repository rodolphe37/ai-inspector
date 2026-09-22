import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, Type, FileText, Shield, Fingerprint, BarChart3,
  Sparkles, Eye, Lock, FileCheck, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';

const features = [
  { icon: Type, key: 'unicode' },
  { icon: FileText, key: 'metadata' },
  { icon: Shield, key: 'c2pa' },
  { icon: Fingerprint, key: 'fingerprints' },
  { icon: BarChart3, key: 'statistics' },
  { icon: Sparkles, key: 'clean' },
  { icon: Eye, key: 'reporting' },
  { icon: Lock, key: 'privacy' },
] as const;

const pipeline = [
  { icon: FileText, key: 'normalize' },
  { icon: Search, key: 'inspect' },
  { icon: Fingerprint, key: 'detect' },
  { icon: BarChart3, key: 'measure' },
  { icon: FileCheck, key: 'report' },
  { icon: Sparkles, key: 'clean' },
] as const;

export default function Features() {
  const { t } = useTranslation();
  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
          >
            <Search className="h-3.5 w-3.5" />
            {t('features.badge')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight"
          >
            {t('features.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted max-w-2xl mx-auto"
          >
            {t('features.subtitle')}
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {features.map((feature, i) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="surface p-5"
            >
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{t(`features.items.${feature.key}.title`)}</h3>
              <p className="mt-2 text-sm text-muted">{t(`features.items.${feature.key}.description`)}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-3">{t('features.pipeline.title')}</h2>
          <p className="text-muted text-center max-w-xl mx-auto mb-10">{t('features.pipeline.subtitle')}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {pipeline.map((step, i) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="surface p-5 relative"
            >
              <span className="absolute top-4 right-4 text-3xl font-bold text-surface-2 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="p-2.5 rounded-xl bg-surface-2 text-primary w-fit mb-4">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{t(`features.pipeline.steps.${step.key}.title`)}</h3>
              <p className="mt-2 text-sm text-muted">{t(`features.pipeline.steps.${step.key}.description`)}</p>
            </motion.div>
          ))}
        </div>

        <div className="surface p-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-4" />
          <h2 className="text-xl font-bold">{t('features.cta.title')}</h2>
          <p className="mt-2 text-muted">{t('features.cta.body')}</p>
          <Link
            to="/app/analyze"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            {t('features.cta.button')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
