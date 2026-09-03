import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Download, Sparkles, Search, FileText, Type,
  Info, Shield, Fingerprint, BarChart3, AlertTriangle,
  CheckCircle2, ArrowLeft,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  ReferenceLine, CartesianGrid,
} from 'recharts';
import { PageTransition } from '@/components/layout/PageTransition';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ScoreSkeleton, CardsSkeleton } from '@/components/ui/Skeleton';
import { analysisApi } from '@/services';
import type { AnalysisResult, TimelineEvent } from '@/types/analysis';

const timelineIcons: Record<string, typeof FileText> = {
  file: FileText,
  type: Type,
  info: Info,
  shield: Shield,
  fingerprint: Fingerprint,
  'bar-chart': BarChart3,
};

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    analysisApi
      .getAnalysis(id)
      .then((r) => alive && setResult(r))
      .catch(() => alive && setResult(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  const handleExport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.name}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="p-4 sm:p-6 lg:p-8">
          <ScoreSkeleton />
          <div className="mt-8"><CardsSkeleton count={4} /></div>
        </div>
      </PageTransition>
    );
  }

  if (!result) {
    return (
      <PageTransition>
        <div className="p-8 text-center">
          <p className="text-muted">Result not available.</p>
          <Link to="/app/history" className="mt-4 inline-block text-primary hover:text-primary-hover">
            Back to history
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link to="/app/history" className="inline-flex items-center gap-1 text-sm text-muted hover:text-content mb-2">
              <ArrowLeft className="h-3.5 w-3.5" />
              History
            </Link>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <h1 className="text-2xl font-bold tracking-tight">Analysis complete</h1>
            </div>
            <p className="text-sm text-muted">
              {result.name} · {new Date(result.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-default text-sm font-medium hover:bg-surface-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export report
            </button>
            <Link
              to="/app/clean"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-default text-sm font-medium hover:bg-surface-2 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Clean
            </Link>
            <Link
              to="/app/analyze"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Search className="h-4 w-4" />
              Analyze again
            </Link>
          </div>
        </div>

        {/* Score */}
        <div className="surface p-8 mb-6">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <ScoreRing score={result.score} label={`${result.signalLevel.toUpperCase()} SIGNAL`} size={200} />
            <div className="flex-1 text-center lg:text-left">
              <p className="text-lg text-muted">
                This score represents a <span className="text-content font-medium">signal level</span>,
                not a probability of human or AI authorship.
              </p>
              <p className="mt-3 text-sm text-subtle">
                No definitive origin can be established from content analysis alone.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-default">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-xs text-muted">
                  An absence of signal does not constitute proof of human origin.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Result cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {/* Unicode */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Unicode</h3>
              </div>
              <StatusBadge status={result.unicode.status === 'clean' ? 'clean' : 'found'} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Invisible characters</span>
                <span className="font-medium tabular-nums">{result.unicode.invisibleCharacters}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Control characters</span>
                <span className="font-medium tabular-nums">{result.unicode.controlCharacters}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Suspicious homoglyphs</span>
                <span className="font-medium tabular-nums">{result.unicode.homoglyphs}</span>
              </div>
            </div>
          </motion.div>

          {/* Metadata */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="surface p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-info" />
                <h3 className="font-semibold">Metadata</h3>
              </div>
              <StatusBadge status={result.metadata.status === 'found' ? 'found' : 'not_found'} />
            </div>
            <div className="space-y-2">
              {result.metadata.entries.slice(0, 4).map((entry) => (
                <div key={entry.key} className="flex justify-between text-sm">
                  <span className="text-muted">{entry.key}</span>
                  <span className="font-medium text-right">{entry.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* C2PA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="surface p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">C2PA</h3>
              </div>
              <StatusBadge status={result.c2pa.status === 'not_found' ? 'not_found' : 'found'} />
            </div>
            <p className="text-sm text-muted">
              {result.c2pa.manifest
                ? `C2PA manifest detected. Signer: ${result.c2pa.signer}. Signature not verified client-side.`
                : result.type === 'text' || result.type === 'code'
                  ? 'C2PA manifests apply to media files, not plain text.'
                  : 'No embedded C2PA / Content Credentials manifest was found.'}
            </p>
          </motion.div>

          {/* Fingerprints */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="surface p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Known fingerprints</h3>
              </div>
            </div>
            <div className="space-y-2.5">
              {result.fingerprints.length === 0 ? (
                <p className="text-sm text-muted">
                  Known-fingerprint matching is available on the Pro and Premium plans.
                </p>
              ) : (
                result.fingerprints.map((fp) => (
                  <div key={fp.id} className="flex items-center justify-between" title={fp.method}>
                    <div>
                      <span className="text-sm font-medium">{fp.name}</span>
                      <span className="text-xs text-subtle ml-2">{fp.provider}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs tabular-nums text-muted">{fp.confidence}%</span>
                      <StatusBadge status={fp.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Statistical analysis */}
        {result.statistical.distribution.length > 0 ? (
        <div className="surface p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Statistical analysis</h3>
          </div>

          <div className="grid sm:grid-cols-4 gap-4 mb-6">
            <div className="surface-2 p-4 rounded-lg">
              <p className="text-xs text-muted mb-1">χ² (letter dist.)</p>
              <p className="text-2xl font-bold tabular-nums">{result.statistical.observedScore}</p>
            </div>
            <div className="surface-2 p-4 rounded-lg">
              <p className="text-xs text-muted mb-1">Threshold</p>
              <p className="text-2xl font-bold tabular-nums">{result.statistical.threshold}</p>
            </div>
            <div className="surface-2 p-4 rounded-lg">
              <p className="text-xs text-muted mb-1">p-value</p>
              <p className="text-2xl font-bold tabular-nums">{result.statistical.pValue}</p>
            </div>
            <div className="surface-2 p-4 rounded-lg">
              <p className="text-xs text-muted mb-1">Entropy (bits/char)</p>
              <p className="text-2xl font-bold tabular-nums">{result.statistical.entropy}</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={result.statistical.distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'rgb(var(--color-text-subtle))', fontSize: 11 }} axisLine={{ stroke: 'rgb(var(--color-border))' }} tickLine={false} />
              <YAxis tick={{ fill: 'rgb(var(--color-text-subtle))', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--color-surface))',
                  border: '1px solid rgb(var(--color-border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine y={result.statistical.threshold} stroke="rgb(var(--color-warning))" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'Threshold', fill: 'rgb(var(--color-warning))', fontSize: 11, position: 'right' }} />
              <Bar dataKey="observed" fill="rgb(var(--color-primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expected" fill="rgb(var(--color-text-subtle))" opacity={0.3} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 p-4 rounded-lg bg-info/10 border border-info/20">
            <p className="text-sm text-content">
              <span className="font-semibold text-info">Conclusion: </span>
              {result.statistical.conclusion}
            </p>
          </div>
        </div>
        ) : (
          <div className="surface p-6 mb-6 border-info/20">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-info" />
              <h3 className="text-lg font-semibold">Statistical analysis</h3>
            </div>
            <p className="text-sm text-muted">{result.statistical.conclusion}</p>
          </div>
        )}

        {/* What we found timeline */}
        <div className="surface p-6 mb-6">
          <h3 className="text-lg font-semibold mb-6">What we found</h3>
          <div className="space-y-0">
            {result.timeline.map((event: TimelineEvent, i) => {
              const Icon = timelineIcons[event.icon] || FileText;
              return (
                <motion.div
                  key={event.step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 pb-6 last:pb-0 relative"
                >
                  {i < result.timeline.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-px bg-border-hover" />
                  )}
                  <div className={`p-2.5 rounded-full flex-shrink-0 z-10 ${
                    event.status === 'warning' ? 'bg-warning/20 text-warning' :
                    event.status === 'info' ? 'bg-info/20 text-info' :
                    'bg-success/20 text-success'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{event.title}</h4>
                    <p className="text-sm text-muted mt-0.5">{event.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="surface p-5 border-warning/20">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">Important</p>
              <p className="text-sm text-muted mt-1">{result.disclaimer}</p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
