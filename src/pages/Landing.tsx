import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Search, BarChart3, FileText, Lock, ArrowRight,
  CheckCircle2, AlertTriangle, MinusCircle, HelpCircle,
  Type, FileCheck, Fingerprint, Sparkles, Cpu, Eye,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PrivacyBadge } from '@/components/ui/PrivacyBadge';

const demoText = `The rapid advancement of machine learning models has transformed how we interact with digital content. Understanding the provenance of information is essential for maintaining trust in media ecosystems. Provenance signals, metadata, and watermark detection provide a technical foundation for content attribution that does not rely on fallible AI classifiers.`;

const demoResults = [
  { label: 'Unicode', status: 'clean' as const },
  { label: 'Metadata', status: 'found' as const },
  { label: 'C2PA', status: 'not_found' as const },
  { label: 'Known watermark', status: 'possible' as const },
  { label: 'Statistical signal', status: 'inconclusive' as const },
];

const whyCards = [
  {
    icon: Search,
    title: 'Inspect',
    description: 'Metadata, Unicode, provenance, signatures. Examine the technical layers of digital content.',
  },
  {
    icon: BarChart3,
    title: 'Measure',
    description: 'Statistics, probabilities and known signals. Quantify what you observe with transparent metrics.',
  },
  {
    icon: FileText,
    title: 'Explain',
    description: 'Every result is accompanied by a technical explanation. No black boxes, no opaque scores.',
  },
];

const pipelineSteps = [
  { icon: FileText, label: 'Content' },
  { icon: Cpu, label: 'Normalization' },
  { icon: Search, label: 'Analysis Engine' },
  { icon: Type, label: 'Unicode' },
  { icon: FileCheck, label: 'Metadata' },
  { icon: Shield, label: 'C2PA' },
  { icon: BarChart3, label: 'Statistical tests' },
  { icon: Fingerprint, label: 'Known fingerprints' },
  { icon: FileText, label: 'Report' },
];

export default function Landing() {
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setShowResults(false);
    setTimeout(() => {
      setAnalyzing(false);
      setShowResults(true);
    }, 1800);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/50 to-bg" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-surface-2 border border-default text-muted">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Independent provenance analysis
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto"
          >
            Understand what's inside your content.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-center text-lg text-muted max-w-2xl mx-auto"
          >
            Inspect digital content for known provenance signals, metadata, invisible characters
            and statistical watermark patterns — without relying on an AI classifier.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/app/analyze"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors glow-primary"
            >
              Analyze content
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-default text-content font-medium hover:bg-surface-2 transition-colors"
            >
              How it works
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 text-center text-sm text-subtle"
          >
            Privacy-first · Algorithmic analysis · No LLM required
          </motion.p>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="relative py-16 border-t border-default">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Live demo</h2>
            <p className="mt-2 text-muted">
              See how provenance inspection works. This is a simulated analysis — no real processing occurs.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input */}
            <div className="surface p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-muted">INPUT</span>
                <span className="text-xs text-subtle">plaintext</span>
              </div>
              <textarea
                defaultValue={demoText}
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
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Analyze demo
                  </>
                )}
              </button>
            </div>

            {/* Output */}
            <div className="surface p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-muted">OUTPUT</span>
                {showResults && (
                  <span className="text-xs text-warning">Demo result — no real analysis performed</span>
                )}
              </div>

              {!showResults && !analyzing && (
                <div className="h-48 flex items-center justify-center text-sm text-subtle">
                  Results will appear here after analysis
                </div>
              )}

              {analyzing && (
                <div className="h-48 flex items-center justify-center">
                  <div className="space-y-3 w-full">
                    {['Normalizing', 'Inspecting Unicode', 'Matching fingerprints'].map((step, i) => (
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
                    {demoResults.map((result, i) => (
                      <motion.div
                        key={result.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-default"
                      >
                        <span className="text-sm font-medium">{result.label}</span>
                        <StatusBadge status={result.status} />
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="pt-2"
                    >
                      <PrivacyBadge label="Processed locally in demo mode" />
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
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-error/10 text-error border border-error/20">
              Not an AI detector
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
              A different approach to content analysis
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {whyCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="surface p-6"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm text-muted">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-20 border-t border-default">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Analysis pipeline</h2>
            <p className="mt-2 text-muted">How content flows through the inspection engine</p>
          </div>

          <div className="surface p-8">
            <div className="flex flex-col items-center gap-3">
              {pipelineSteps.map((step, i) => (
                <div key={step.label} className="flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-surface-2 border border-default"
                  >
                    <step.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{step.label}</span>
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
                <Lock className="h-3.5 w-3.5" />
                Privacy first
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Your content should remain yours.
              </h2>
              <p className="mt-4 text-muted">
                Provenance Inspector is designed for local-first analysis. No content is sent to
                external servers in demo mode. No LLM is involved. No training on your data.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Local analysis possible',
                  'No LLM involved',
                  'No training on user data',
                  'No content tracking',
                  'Optional server-side storage',
                  'Architecture built for local processing',
                ].map((item, i) => (
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
                  <span className="text-sm font-medium">Browser</span>
                </div>
                <div className="w-px h-8 bg-border-hover" />
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20">
                  <Cpu className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Local analysis</span>
                </div>
                <div className="w-px h-8 bg-border-hover" />
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-surface-2 border border-default">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Report</span>
                </div>
                <div className="mt-4 text-xs text-subtle text-center">
                  Backend (optional) — only when required
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
            Start inspecting your content
          </h2>
          <p className="mt-3 text-muted max-w-xl mx-auto">
            No registration required for demo mode. Explore the full analysis pipeline with simulated data.
          </p>
          <Link
            to="/app/analyze"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            Launch application
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-6 text-xs text-subtle">
            An absence of signal does not constitute proof of human origin.
          </p>
        </div>
      </section>
    </div>
  );
}
