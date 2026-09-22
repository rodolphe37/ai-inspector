import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Target, Eye, ArrowRight, Code2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { REPO_URL } from '@/lib/constants';

const values = [
  { icon: Eye, key: 'transparency' },
  { icon: Shield, key: 'privacy' },
  { icon: Target, key: 'precision' },
] as const;

export default function About() {
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
            <Shield className="h-8 w-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            {t('about.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted max-w-2xl mx-auto"
          >
            {t('about.subtitle')}
          </motion.p>
        </div>

        {/* Mission */}
        <div className="surface p-8 mb-16 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">{t('about.mission.title')}</h2>
          <p className="text-muted leading-relaxed">{t('about.mission.p1')}</p>
          <p className="text-muted leading-relaxed mt-4">{t('about.mission.p2')}</p>
        </div>

        {/* Values */}
        <div className="grid sm:grid-cols-3 gap-4 mb-16">
          {values.map((value, i) => (
            <motion.div
              key={value.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="surface p-6"
            >
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                <value.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{t(`about.values.${value.key}.title`)}</h3>
              <p className="mt-2 text-sm text-muted">{t(`about.values.${value.key}.description`)}</p>
            </motion.div>
          ))}
        </div>

        {/* Positioning */}
        <div className="surface p-8 mb-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">{t('about.positioning.title')}</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-success mb-1">{t('about.positioning.areTitle')}</p>
              <p className="text-sm text-muted">{t('about.positioning.are')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-warning mb-1">{t('about.positioning.areNotTitle')}</p>
              <p className="text-sm text-muted">{t('about.positioning.areNot')}</p>
            </div>
          </div>
        </div>

        {/* Open source */}
        <div className="surface p-8 mb-12 max-w-3xl mx-auto">
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
            <Code2 className="h-5 w-5 text-primary" />
            {t('about.openSource.title')}
          </h2>
          <p className="text-sm text-muted leading-relaxed">{t('about.openSource.body')}</p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
          >
            {t('about.openSource.link')}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="text-center">
          <Link
            to="/app/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            {t('about.cta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
