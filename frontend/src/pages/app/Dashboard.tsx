import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileSearch, Fingerprint, CheckCircle2, Sparkles, ArrowRight, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageTransition } from '@/components/layout/PageTransition';
import { getDashboard, type DashboardData } from '@/services/dashboard';
import { useAuthStore } from '@/stores/useAuthStore';
import type { AnalysisStatus } from '@/types/analysis';

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
  const today = new Date();
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yest.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    let alive = true;
    getDashboard()
      .then((d) => {
        if (alive) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [status]);

  const stats = data?.stats;
  const activity = data?.activity ?? [];
  const recent = data?.recent ?? [];

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            {user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome'}
          </h1>
          <p className="mt-1 text-muted">
            {data?.scope === 'local'
              ? 'Your analyses are stored in this browser only. Create an account to sync and unlock the full pipeline.'
              : 'Deterministic provenance analysis, run in your browser.'}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard icon={<FileSearch className="h-5 w-5" />} label="Analyses" value={loading ? '—' : (stats?.analyses ?? 0)} />
          <MetricCard icon={<Fingerprint className="h-5 w-5" />} label="Signals detected" value={loading ? '—' : (stats?.signalsDetected ?? 0)} color="text-warning" />
          <MetricCard icon={<CheckCircle2 className="h-5 w-5" />} label="Clean results" value={loading ? '—' : (stats?.cleanFiles ?? 0)} color="text-success" />
          <MetricCard icon={<Sparkles className="h-5 w-5" />} label="Known fingerprints" value={loading ? '—' : (stats?.knownFingerprints ?? 0)} color="text-info" />
        </div>

        <div className="surface p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Analysis activity</h2>
              <p className="text-sm text-muted">Last 30 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary" />Analyses</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-warning" />Signals</span>
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
              <XAxis dataKey="date" tick={{ fill: 'rgb(var(--color-text-subtle))', fontSize: 11 }} tickFormatter={(v) => v.slice(5).replace('-', '/')} axisLine={{ stroke: 'rgb(var(--color-border))' }} tickLine={false} />
              <YAxis tick={{ fill: 'rgb(var(--color-text-subtle))', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', borderRadius: '8px', fontSize: '12px' }} labelStyle={{ color: 'rgb(var(--color-text-muted))' }} />
              <Area type="monotone" dataKey="analyses" stroke="rgb(var(--color-primary))" strokeWidth={2} fill="url(#analysesGrad)" />
              <Area type="monotone" dataKey="signals" stroke="rgb(var(--color-warning))" strokeWidth={2} fill="url(#signalsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="surface">
          <div className="flex items-center justify-between p-5 border-b border-default">
            <h2 className="text-lg font-semibold">Recent analyses</h2>
            <Link to="/app/history" className="text-sm text-primary hover:text-primary-hover flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recent.length === 0 && !loading ? (
            <div className="p-8">
              <EmptyState
                icon={<Search className="h-8 w-8" />}
                title="No analyses yet"
                description="Run your first analysis to see it here."
                action={<Link to="/app/analyze" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">New analysis</Link>}
              />
            </div>
          ) : (
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
                  {recent.map((analysis, i) => {
                    const s = statusMap[analysis.status] ?? statusMap.clean;
                    return (
                      <motion.tr key={analysis.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-default last:border-0 hover:bg-surface-2/50 transition-colors">
                        <td className="px-5 py-3.5"><span className="text-sm font-medium">{analysis.name}</span></td>
                        <td className="px-5 py-3.5 hidden sm:table-cell"><span className="text-xs text-muted uppercase">{analysis.type}</span></td>
                        <td className="px-5 py-3.5 hidden md:table-cell"><span className="text-sm text-muted">{formatDate(analysis.date)}</span></td>
                        <td className="px-5 py-3.5"><StatusBadge status={s.status} label={s.label} /></td>
                        <td className="px-5 py-3.5 text-right">
                          <Link to={`/app/results/${analysis.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover">
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
          )}
        </div>
      </div>
    </PageTransition>
  );
}
