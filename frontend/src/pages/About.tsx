import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Target, Eye, ArrowRight } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';

const values = [
  {
    icon: Eye,
    title: 'Transparency',
    description: 'Every result is explainable. Detection methods, thresholds, and p-values are visible. No black boxes.',
  },
  {
    icon: Shield,
    title: 'Privacy',
    description: 'Local-first by design. Your content stays yours. No LLM, no training, no tracking.',
  },
  {
    icon: Target,
    title: 'Precision',
    description: 'Deterministic, reproducible analysis. The same input always produces the same output.',
  },
];

export default function About() {
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
            About Provenance Inspector
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted max-w-2xl mx-auto"
          >
            An independent AI-origin analyser for text and images — evidence-based,
            not a black box.
          </motion.p>
        </div>

        {/* Mission */}
        <div className="surface p-8 mb-16 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Our mission</h2>
          <p className="text-muted leading-relaxed">
            Provenance Inspector answers &ldquo;was this made by AI?&rdquo; the way it should be
            answered: by showing its work. Cryptographic Content Credentials, generator
            metadata, watermark markers and forensic analysis — each verdict lists the evidence
            behind it and states how confident it is.
          </p>
          <p className="text-muted leading-relaxed mt-4">
            When there is hard evidence (a signed C2PA manifest), we say so with near-certainty.
            When there is only a statistical estimate, we say that too — and we are honest that
            it has a real false-positive rate on edited, translated or non-native content. We
            never dress up a guess as proof.
          </p>
        </div>

        {/* Values */}
        <div className="grid sm:grid-cols-3 gap-4 mb-16">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="surface p-6"
            >
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                <value.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm text-muted">{value.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Positioning */}
        <div className="surface p-8 mb-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">What we are — and aren't</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-success mb-1">We are:</p>
              <p className="text-sm text-muted">
                An inspection tool for known provenance signals, metadata, Unicode artifacts,
                C2PA manifests, and statistical watermark patterns.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-warning mb-1">We are not:</p>
              <p className="text-sm text-muted">
                An AI detector. We do not classify content as "human" or "AI." We do not make
                definitive claims about authorship. An absence of signal does not prove human
                origin, and a detected signal does not prove machine generation.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/app/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            Start inspecting
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
