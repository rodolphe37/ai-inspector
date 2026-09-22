import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Search, BarChart3, FileText, Lock, ArrowRight,
  CheckCircle2,
  Type, FileCheck, Fingerprint, Sparkles, Cpu, Eye,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PrivacyBadge } from '@/components/ui/PrivacyBadge';
import { analyzeUnicode } from '@/engine/unicode';
import { analyzeStatistics } from '@/engine/statistics';
import { analyzeTextAi } from '@/engine/aiText';
import type { DetectionStatus } from '@/types/analysis';
import { t } from '@/i18n';

interface DemoRow {
  label: string;
  status: DetectionStatus;
  detail: string;
}

/** Lower-case only the first letter, so acronyms such as "LLM" survive. */
function lowerFirst(label: string): string {
  return label.charAt(0).toLowerCase() + label.slice(1);
}

function runDemo(text: string): DemoRow[] {
  const u = analyzeUnicode(text);
  const s = analyzeStatistics(text);
  const ai = analyzeTextAi(text);
  return [
    {
      label: t('landing.demo.rows.ai'),
      status: ai.probability >= 62 ? 'possible' : ai.probability >= 40 ? 'inconclusive' : 'clean',
      detail:
        ai.signals.length === 0
          ? t('landing.demo.rows.aiTooShort')
          : `${ai.probability}% · ${lowerFirst(ai.signals[0].label)}${ai.reliable ? '' : t('landing.demo.rows.lowReliability')}`,
    },
    {
      label: t('landing.demo.rows.invisible'),
      status: u.invisibleCharacters > 0 ? 'found' : 'clean',
      detail: u.invisibleCharacters > 0
        ? t('landing.demo.rows.invisibleFound', { count: u.invisibleCharacters })
        : t('landing.demo.rows.none'),
    },
    {
      label: t('landing.demo.rows.homoglyphs'),
      status: u.homoglyphs > 0 ? 'found' : 'clean',
      detail: u.homoglyphs > 0
        ? t('landing.demo.rows.homoglyphsFound', { count: u.homoglyphs })
        : t('landing.demo.rows.none'),
    },
    {
      label: t('landing.demo.rows.letters'),
      status: s.status,
      detail: t('landing.demo.rows.lettersDetail', { chi2: s.observedScore, entropy: s.entropy }),
    },
  ];
}

const whyCards = [
  { icon: Search, key: 'inspect' },
  { icon: BarChart3, key: 'measure' },
  { icon: FileText, key: 'explain' },
] as const;

const pipelineSteps = [
  { icon: FileText, key: 'content' },
  { icon: Cpu, key: 'normalization' },
  { icon: Search, key: 'engine' },
  { icon: Type, key: 'unicode' },
  { icon: FileCheck, key: 'metadata' },
  { icon: Shield, key: 'c2pa' },
  { icon: BarChart3, key: 'statistics' },
  { icon: Fingerprint, key: 'fingerprints' },
  { icon: FileText, key: 'report' },
] as const;

export default function Landing() {
  const { t, i18n } = useTranslation();
  const [analyzing, setAnalyzing] = useState(false);
  // `null` = untouched → follow the UI language's sample text.
  const [edited, setEdited] = useState<string | null>(null);
  const [results, setResults] = useState<DemoRow[] | null>(null);
  const text = edited ?? t('landing.demo.sample', { lng: i18n.language });

  const handleAnalyze = () => {
    setAnalyzing(true);
    setResults(null);
    setTimeout(() => {
      setResults(runDemo(text));
      setAnalyzing(false);
    }, 900);
  };
  const showResults = results != null;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-bg/50 to-bg" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-surface-2 border border-default text-muted">
              <Shield className="h-3.5 w-3.5 text-primary" />
              {t('landing.hero.badge')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto"
          >
            {t('landing.hero.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-center text-base sm:text-lg text-muted max-w-2xl mx-auto"
          >
            {t('landing.hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4"
          >
            <Link
              to="/app/analyze"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors glow-primary"
            >
              {t('landing.hero.cta')}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-default text-content font-medium hover:bg-surface-2 transition-colors"
            >
              {t('landing.hero.secondary')}
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 text-center text-sm text-subtle"
          >
            {t('landing.hero.tags')}
          </motion.p>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="relative py-16 border-t border-default">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('landing.demo.title')}</h2>
            <p className="mt-2 text-muted">{t('landing.demo.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <div className="surface p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-muted">{t('landing.demo.input')}</span>
                <span className="text-xs text-subtle">{t('landing.demo.plaintext')}</span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setEdited(e.target.value)}
                className="w-full h-48 bg-surface-2 rounded-lg p-4 text-sm font-mono text-content resize-none border border-default focus:outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    {t('landing.demo.analyzing')}
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    {t('landing.demo.run')}
                  </>
                )}
              </button>
            </div>

            {/* Output */}
            <div className="surface p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-muted">{t('landing.demo.output')}</span>
                {showResults && (
                  <span className="hidden sm:inline text-xs text-subtle">{t('landing.demo.preview')}</span>
                )}
              </div>

              {!showResults && !analyzing && (
                <div className="h-48 flex items-center justify-center text-sm text-subtle">
                  {t('landing.demo.empty')}
                </div>
              )}

              {analyzing && (
                <div className="h-48 flex items-center justify-center">
                  <div className="space-y-3 w-full">
                    {(t('landing.demo.steps', { returnObjects: true }) as string[]).map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.3 }}
                        className="flex items-center gap-3"
                      >
                        <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <span className="text-sm text-muted">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {showResults && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    {results!.map((result, i) => (
                      <motion.div
                        key={result.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-2 border border-default"
                      >
                        <div className="min-w-0">
                          <span className="text-sm font-medium">{result.label}</span>
                          <p className="text-xs text-subtle truncate">{result.detail}</p>
                        </div>
                        <StatusBadge status={result.status} />
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="pt-2"
                    >
                      <PrivacyBadge label={t('common.analysedLocally')} />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why section */}
      <section className="py-20 border-t border-default">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              {t('landing.why.badge')}
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
              {t('landing.why.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyCards.map((card, i) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="surface p-6"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{t(`landing.why.cards.${card.key}.title`)}</h3>
                <p className="mt-2 text-sm text-muted">{t(`landing.why.cards.${card.key}.description`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-20 border-t border-default">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('landing.pipeline.title')}</h2>
            <p className="mt-2 text-muted">{t('landing.pipeline.subtitle')}</p>
          </div>

          <div className="surface p-8">
            <div className="flex flex-col items-center gap-3">
              {pipelineSteps.map((step, i) => (
                <div key={step.key} className="flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-surface-2 border border-default"
                  >
                    <step.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{t(`landing.pipeline.steps.${step.key}`)}</span>
                  </motion.div>
                  {i < pipelineSteps.length - 1 && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 + 0.04 }}
                      className="w-px h-6 bg-border-hover origin-top"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="py-20 border-t border-default">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
                <Lock className="h-3.5 w-3.5" />
                {t('landing.privacy.badge')}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {t('landing.privacy.title')}
              </h2>
              <p className="mt-4 text-muted">{t('landing.privacy.body')}</p>
              <ul className="mt-6 space-y-3">
                {(t('landing.privacy.items', { returnObjects: true }) as string[]).map((item, i) => (
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

            <div className="surface p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-surface-2 border border-default">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{t('landing.privacy.diagram.browser')}</span>
                </div>
                <div className="w-px h-8 bg-border-hover" />
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20">
                  <Cpu className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{t('landing.privacy.diagram.local')}</span>
                </div>
                <div className="w-px h-8 bg-border-hover" />
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-surface-2 border border-default">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{t('landing.privacy.diagram.report')}</span>
                </div>
                <div className="mt-4 text-xs text-subtle text-center">
                  {t('landing.privacy.diagram.backend')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-default">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('landing.cta.title')}
          </h2>
          <p className="mt-3 text-muted max-w-xl mx-auto">{t('landing.cta.body')}</p>
          <Link
            to="/app/analyze"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            {t('landing.cta.button')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-6 text-xs text-subtle">
            {t('common.absenceNotProof')}
          </p>
        </div>
      </section>
    </div>
  );
}
