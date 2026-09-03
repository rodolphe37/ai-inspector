import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, Search, Fingerprint, BarChart3,
  FileCheck, Sparkles, ArrowRight, CheckCircle2, XCircle,
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';

const steps = [
  { num: '01', icon: FileText, title: 'Normalize', description: 'Content is parsed, encoding is detected, and the input is normalized into a standard representation for analysis.' },
  { num: '02', icon: Search, title: 'Inspect', description: 'The normalized content is examined layer by layer — Unicode characters, metadata fields, and C2PA manifests are extracted and validated.' },
  { num: '03', icon: Fingerprint, title: 'Detect', description: 'Known fingerprints and watermarking schemes are matched against the content using their respective detection methods.' },
  { num: '04', icon: BarChart3, title: 'Measure', description: 'Statistical tests quantify observed signals. Token distributions, entropy, and frequency deviations are compared against known parameters with p-values.' },
  { num: '05', icon: FileCheck, title: 'Report', description: 'A transparent, auditable report is generated. Every finding includes a technical explanation and confidence indicator.' },
  { num: '06', icon: Sparkles, title: 'Clean', description: 'Optionally, safe-to-remove artifacts such as invisible characters and metadata can be stripped from the content.' },
];

const canDetect = [
  'Known watermark signatures',
  'Invisible Unicode characters',
  'Embedded metadata fields',
  'C2PA provenance manifests',
  'Known statistical fingerprints',
  'Control characters and homoglyphs',
];

const cannotGuarantee = [
  'All unknown watermarking schemes',
  'AI authorship of content',
  'Absence of all possible signatures',
  'Perfect watermark removal',
  'Origin attribution with certainty',
  'Detection of future watermark methods',
];

export default function HowItWorks() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            How it works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted max-w-2xl mx-auto"
          >
            A deterministic, transparent pipeline for provenance inspection.
            No black boxes, no opaque scores.
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
                    <span className="text-2xl font-bold text-surface-2 tabular-nums">{step.num}</span>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-muted max-w-2xl">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Can / Cannot */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-3">
            What we can and cannot detect
          </h2>
          <p className="text-muted text-center max-w-xl mx-auto mb-10">
            Transparency about capabilities is essential. Here's an honest assessment.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="surface p-6 border-success/20">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-success mb-4">
                <CheckCircle2 className="h-5 w-5" />
                Can detect
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
                Cannot guarantee
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
            An absence of signal does not constitute proof of human origin.
            A detected signal does not constitute proof of machine generation.
            All results are observational and statistical.
          </p>
        </div>

        <div className="text-center">
          <Link
            to="/app/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            Try it now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
