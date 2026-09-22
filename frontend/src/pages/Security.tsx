import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Lock, Eye, Cpu, FileText, Shield, ArrowRight,
  CheckCircle2, Server, Database,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';

const principles = [
  { icon: Lock, key: 'privacy' },
  { icon: Eye, key: 'noLlm' },
  { icon: Shield, key: 'noTraining' },
  { icon: Cpu, key: 'localFirst' },
  { icon: Database, key: 'noServerData' },
  { icon: FileText, key: 'transparent' },
] as const;

export default function Security() {
  const { t } = useTranslation();
  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary mb-6"
          >
            <Lock className="h-8 w-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            {t('security.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted max-w-2xl mx-auto"
          >
            {t('security.subtitle')}
          </motion.p>
        </div>

        {/* Principles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {principles.map((principle, i) => (
            <motion.div
              key={principle.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="surface p-6"
            >
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                <principle.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{t(`security.principles.${principle.key}.title`)}</h3>
              <p className="mt-2 text-sm text-muted">{t(`security.principles.${principle.key}.description`)}</p>
            </motion.div>
          ))}
        </div>

        {/* Architecture diagram */}
        <div className="surface p-8 mb-16">
          <h2 className="text-xl font-semibold mb-8 text-center">{t('security.architecture.title')}</h2>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-surface-2 border border-default">
              <Eye className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{t('security.architecture.browser')}</span>
            </div>
            <div className="w-px h-8 bg-border-hover" />
            <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-primary/10 border border-primary/20">
              <Cpu className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">{t('security.architecture.engine')}</span>
            </div>
            <div className="w-px h-8 bg-border-hover" />
            <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-surface-2 border border-default">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{t('security.architecture.report')}</span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-default">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Server className="h-4 w-4" />
                {t('security.architecture.backend')}
              </div>
              <div className="w-px h-6 bg-border-hover" />
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-surface-2 border border-default border-dashed">
                <Database className="h-4 w-4 text-subtle" />
                <span className="text-xs text-muted">{t('security.architecture.storage')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Commitments */}
        <div className="surface p-6 mb-12">
          <h2 className="text-lg font-semibold mb-4">{t('security.commitments.title')}</h2>
          <ul className="space-y-3">
            {(t('security.commitments.items', { returnObjects: true }) as string[]).map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="text-center">
          <Link
            to="/app/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            {t('security.cta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
