import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileSearch, Fingerprint, CheckCircle2, Sparkles,
  ArrowRight, Search, Eye,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageTransition } from '@/components/layout/PageTransition';
import mockDashboard from '@/data/mockDashboard.json';
import mockAnalyses from '@/data/mockAnalyses.json';
import type { Analysis, AnalysisStatus } from '@/types/analysis';

const stats = mockDashboard.stats;
const activity = mockDashboard.activity;
const recentAnalyses = (mockAnalyses as unknown as Analysis[]).slice(0, 5);

const statusMap: Record<AnalysisStatus, { status: 'clean' | 'found' | 'not_found' | 'possible' | 'inconclusive'; label: string }> = {
  clean: { status: 'clean', label: 'Clean' },
  possible_signal: { status: 'possible', label: 'Signal detected' },
  signal_detected: { status: 'possible', label: 'Signal detected' },
  inconclusive: { status: 'inconclusive', label: 'Inconclusive' },
  c2pa_found: { status: 'found', label: 'C2PA found' },
  failed: { status: 'not_found', label: 'Failed' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date('2026-08-17');
  const yesterday = new Date('2026-08-16');
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-muted">Inspect your content with deterministic analysis.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard icon={<FileSearch className="h-5 w-5" />} label="Analyses" value={stats.analyses} />
          <MetricCard icon={<Fingerprint className="h-5 w-5" />} label="Signals detected" value={stats.signalsDetected} color="text-warning" />
          <MetricCard icon={<CheckCircle2 className="h-5 w-5" />} label="Clean files" value={stats.cleanFiles} color="text-success" />
          <MetricCard icon={<Sparkles className="h-5 w-5" />} label="Known fingerprints" value={stats.knownFingerprints} color="text-info" />
        </div>

        {/* Activity chart */}
        <div className="surface p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Analysis activity</h2>
              <p className="text-sm text-muted">Last 30 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                Analyses
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                Signals
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={activity}>
              <defs>
                <linearGradient id="analysesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="signalsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--color-warning))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="rgb(var(--color-warning))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: 'rgb(var(--color-text-subtle))', fontSize: 11 }}
                tickFormatter={(v) => v.split('-').slice(1).join('/')}
                axisLine={{ stroke: 'rgb(var(--color-border))' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgb(var(--color-text-subtle))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--color-surface))',
                  border: '1px solid rgb(var(--color-border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'rgb(var(--color-text-muted))' }}
              />
              <Area type="monotone" dataKey="analyses" stroke="rgb(var(--color-primary))" strokeWidth={2} fill="url(#analysesGrad)" />
              <Area type="monotone" dataKey="signals" stroke="rgb(var(--color-warning))" strokeWidth={2} fill="url(#signalsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent analyses */}
        <div className="surface">
          <div className="flex items-center justify-between p-5 border-b border-default">
            <h2 className="text-lg font-semibold">Recent analyses</h2>
            <Link to="/app/history" className="text-sm text-primary hover:text-primary-hover flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-default">
                  <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Type</th>
                  <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3 hidden md:table-cell">Date</th>
                  <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">Result</th>
                  <th className="text-right text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentAnalyses.map((analysis, i) => {
                  const s = statusMap[analysis.status];
                  return (
                    <motion.tr
                      key={analysis.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-default last:border-0 hover:bg-surface-2/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium">{analysis.name}</span>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-muted uppercase">{analysis.type}</span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-muted">{formatDate(analysis.date)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={s.status} label={s.label} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/app/results/${analysis.id}`}
                          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover"
                        >
                          <Search className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">View</span>
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-subtle">
          <Eye className="h-3.5 w-3.5" />
          Demo mode — Data shown is simulated for demonstration purposes.
        </div>
      </div>
    </PageTransition>
  );
}
