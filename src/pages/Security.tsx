import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Lock, Eye, Cpu, FileText, Shield, ArrowRight,
  CheckCircle2, Server, Database,
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';

const principles = [
  {
    icon: Lock,
    title: 'Privacy first',
    description: 'Your content should remain yours. In demo mode, no content ever leaves your browser. The architecture is designed for local-first processing.',
  },
  {
    icon: Eye,
    title: 'No LLM',
    description: 'Provenance Inspector does not use any large language model. All analysis is algorithmic and statistical — deterministic and reproducible.',
  },
  {
    icon: Shield,
    title: 'No training on your content',
    description: 'Your data is never used for training, fine-tuning, or any machine learning purpose. There is no model improvement loop involving user content.',
  },
  {
    icon: Cpu,
    title: 'Local-first architecture',
    description: 'The analysis engine is designed to run in the browser via Web Workers. Server-side processing is optional and only for advanced features.',
  },
  {
    icon: Database,
    title: 'Minimal data retention',
    description: 'When server-side storage is enabled, only metadata about analyses is stored — not the content itself. History is opt-in.',
  },
  {
    icon: FileText,
    title: 'Transparent analysis',
    description: 'Every result is accompanied by a technical explanation. Detection methods, thresholds, and p-values are visible in every report.',
  },
];

export default function Security() {
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
            Security & privacy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted max-w-2xl mx-auto"
          >
            Built from the ground up with privacy as the default, not an afterthought.
          </motion.p>
        </div>

        {/* Principles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {principles.map((principle, i) => (
            <motion.div
              key={principle.title}
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
              <h3 className="font-semibold">{principle.title}</h3>
              <p className="mt-2 text-sm text-muted">{principle.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Architecture diagram */}
        <div className="surface p-8 mb-16">
          <h2 className="text-xl font-semibold mb-8 text-center">Local-first architecture</h2>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-surface-2 border border-default">
              <Eye className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Browser</span>
            </div>
            <div className="w-px h-8 bg-border-hover" />
            <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-primary/10 border border-primary/20">
              <Cpu className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Local analysis engine</span>
            </div>
            <div className="w-px h-8 bg-border-hover" />
            <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-surface-2 border border-default">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Report</span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-default">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Server className="h-4 w-4" />
                Backend — optional, only when required
              </div>
              <div className="w-px h-6 bg-border-hover" />
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-surface-2 border border-default border-dashed">
                <Database className="h-4 w-4 text-subtle" />
                <span className="text-xs text-muted">Optional storage (opt-in)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Commitments */}
        <div className="surface p-6 mb-12">
          <h2 className="text-lg font-semibold mb-4">Our commitments</h2>
          <ul className="space-y-3">
            {[
              'No content is sent to external servers in demo mode',
              'No LLM or AI classifier is used in the analysis pipeline',
              'No content is used for training or model improvement',
              'No tracking of content or analysis results',
              'All detection methods are documented and transparent',
              'Server-side storage is opt-in and stores metadata only',
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
