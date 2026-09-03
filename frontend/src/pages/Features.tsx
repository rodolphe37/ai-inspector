import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, Type, FileText, Shield, Fingerprint, BarChart3,
  Sparkles, Eye, Lock, FileCheck, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';

const features = [
  {
    icon: Type,
    title: 'Unicode inspection',
    description: 'Detect invisible characters, zero-width spaces, homoglyphs, and control characters that may encode hidden information or serve as tracking watermarks.',
  },
  {
    icon: FileText,
    title: 'Metadata analysis',
    description: 'Extract and examine embedded metadata fields — creator, creation date, software, encoding — to understand a file\'s provenance trail.',
  },
  {
    icon: Shield,
    title: 'C2PA manifest verification',
    description: 'Detect and validate C2PA content authenticity manifests with cryptographic signature verification for supported media formats.',
  },
  {
    icon: Fingerprint,
    title: 'Known fingerprint matching',
    description: 'Match content against a curated database of known watermarking schemes and provenance signals with transparent confidence scores.',
  },
  {
    icon: BarChart3,
    title: 'Statistical signal detection',
    description: 'Analyze token distributions, entropy, and frequency deviations against known watermark parameters with p-value reporting.',
  },
  {
    icon: Sparkles,
    title: 'Content cleaning',
    description: 'Remove detectable metadata, invisible characters, and safe-to-remove artifacts while preserving content integrity.',
  },
  {
    icon: Eye,
    title: 'Transparent reporting',
    description: 'Every result includes a technical explanation. No black-box scores — understand exactly what was found and why.',
  },
  {
    icon: Lock,
    title: 'Privacy-first architecture',
    description: 'Designed for local processing. No content leaves your browser in demo mode. No LLM involved. No training on your data.',
  },
];

const pipeline = [
  { icon: FileText, label: 'Normalize', description: 'Content is normalized and prepared for inspection.' },
  { icon: Search, label: 'Inspect', description: 'Unicode, metadata, and C2PA are examined layer by layer.' },
  { icon: Fingerprint, label: 'Detect', description: 'Known fingerprints are matched against the content.' },
  { icon: BarChart3, label: 'Measure', description: 'Statistical tests quantify observed signals with p-values.' },
  { icon: FileCheck, label: 'Report', description: 'A transparent, auditable report is generated.' },
  { icon: Sparkles, label: 'Clean', description: 'Optional removal of safe-to-remove artifacts.' },
];

export default function Features() {
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
            Features
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Everything you need to inspect provenance
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted max-w-2xl mx-auto"
          >
            A complete toolkit for examining the technical layers of digital content —
            from invisible characters to cryptographic signatures.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
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
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-3">The inspection pipeline</h2>
          <p className="text-muted text-center max-w-xl mx-auto mb-10">
            Every analysis follows a deterministic, auditable pipeline.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {pipeline.map((step, i) => (
            <motion.div
              key={step.label}
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
              <h3 className="font-semibold">{step.label}</h3>
              <p className="mt-2 text-sm text-muted">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="surface p-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-4" />
          <h2 className="text-xl font-bold">Ready to inspect?</h2>
          <p className="mt-2 text-muted">Start analyzing content in demo mode — no registration required.</p>
          <Link
            to="/app/analyze"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            Start analyzing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
