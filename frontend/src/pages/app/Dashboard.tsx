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
import { useTranslation } from 'react-i18next';
import { badgeFor } from '@/lib/analysisStatus';
import { currentLocale, t as translate } from '@/i18n';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return translate('common.today');
  if (date.toDateString() === yest.toDateString()) return translate('common.yesterday');
  return date.toLocaleDateString(currentLocale(), { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const stats = data?.stats;
  const activity = data?.activity ?? [];
  const recent = data?.recent ?? [];

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="mt-1 text-muted">{t('dashboard.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard icon={<FileSearch className="h-5 w-5" />} label={t('dashboard.metrics.analyses')} value={loading ? '…' : (stats?.analyses ?? 0)} />
          <MetricCard icon={<Fingerprint className="h-5 w-5" />} label={t('dashboard.metrics.signals')} value={loading ? '…' : (stats?.signalsDetected ?? 0)} color="text-warning" />
          <MetricCard icon={<CheckCircle2 className="h-5 w-5" />} label={t('dashboard.metrics.clean')} value={loading ? '…' : (stats?.cleanFiles ?? 0)} color="text-success" />
          <MetricCard icon={<Sparkles className="h-5 w-5" />} label={t('dashboard.metrics.fingerprints')} value={loading ? '…' : (stats?.knownFingerprints ?? 0)} color="text-info" />
        </div>

        <div className="surface p-6 mb-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">{t('dashboard.activity.title')}</h2>
              <p className="text-sm text-muted">{t('dashboard.activity.period')}</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary" />{t('dashboard.activity.analyses')}</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-warning" />{t('dashboard.activity.signals')}</span>
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
              <Area type="monotone" dataKey="analyses" name={t('dashboard.activity.analyses')} stroke="rgb(var(--color-primary))" strokeWidth={2} fill="url(#analysesGrad)" />
              <Area type="monotone" dataKey="signals" name={t('dashboard.activity.signals')} stroke="rgb(var(--color-warning))" strokeWidth={2} fill="url(#signalsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="surface">
          <div className="flex items-center justify-between p-5 border-b border-default">
            <h2 className="text-lg font-semibold">{t('dashboard.recent.title')}</h2>
            <Link to="/app/history" className="text-sm text-primary hover:text-primary-hover flex items-center gap-1">
              {t('dashboard.recent.viewAll')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recent.length === 0 && !loading ? (
            <div className="p-8">
              <EmptyState
                icon={<Search className="h-8 w-8" />}
                title={t('common.noAnalyses')}
                description={t('dashboard.recent.emptyDesc')}
                action={<Link to="/app/analyze" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">{t('common.newAnalysis')}</Link>}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-default">
                    <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">{t('common.table.name')}</th>
                    <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3 hidden sm:table-cell">{t('common.table.type')}</th>
                    <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3 hidden md:table-cell">{t('common.table.date')}</th>
                    <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">{t('common.table.result')}</th>
                    <th className="text-right text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">{t('common.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((analysis, i) => {
                    const s = badgeFor(analysis.status);
                    return (
                      <motion.tr key={analysis.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-default last:border-0 hover:bg-surface-2/50 transition-colors">
                        <td className="px-5 py-3.5"><span className="text-sm font-medium">{analysis.name}</span></td>
                        <td className="px-5 py-3.5 hidden sm:table-cell"><span className="text-xs text-muted uppercase">{t(`status.type.${analysis.type}`)}</span></td>
                        <td className="px-5 py-3.5 hidden md:table-cell"><span className="text-sm text-muted">{formatDate(analysis.date)}</span></td>
                        <td className="px-5 py-3.5"><StatusBadge status={s.badge} label={t(`status.analysis.${s.status}`)} /></td>
                        <td className="px-5 py-3.5 text-right">
                          <Link to={`/app/results/${analysis.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover">
                            <Search className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t('common.view')}</span>
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
