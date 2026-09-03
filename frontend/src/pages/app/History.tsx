import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Eye, Trash2, History as HistoryIcon } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useHistoryStore } from '@/stores/useHistoryStore';
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

const filters = [
  { key: 'all', label: 'All' },
  { key: 'clean', label: 'Clean' },
  { key: 'signals', label: 'Signals' },
  { key: 'inconclusive', label: 'Inconclusive' },
] as const;

const PAGE_SIZE = 8;

export default function History() {
  const { items, filter, search, loading, loaded, setFilter, setSearch, load, remove } = useHistoryStore();
  const authStatus = useAuthStore((s) => s.status);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (authStatus !== 'loading') void load();
  }, [authStatus, load]);

  const filtered = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'clean' && item.status === 'clean') ||
      (filter === 'signals' && ['possible_signal', 'signal_detected', 'c2pa_found'].includes(item.status)) ||
      (filter === 'inconclusive' && item.status === 'inconclusive');
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="mt-1 text-muted">
            {authStatus === 'authenticated'
              ? 'Your saved analyses, synced to your account.'
              : 'Analyses saved in this browser. They stay on this device.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-1 p-1 bg-surface-2 rounded-lg w-fit">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => { setFilter(f.key); setPage(1); }}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filter === f.key ? 'text-content' : 'text-muted hover:text-content'
                }`}
              >
                {f.label}
                {filter === f.key && <motion.div layoutId="filter-indicator" className="absolute inset-0 bg-surface rounded-md -z-10" />}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search analyses..."
              className="w-full pl-10 pr-4 py-2 bg-surface-2 border border-default rounded-lg text-sm text-content focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {loading && !loaded ? (
          <div className="surface p-8 text-center text-sm text-muted">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<HistoryIcon className="h-8 w-8" />}
            title={items.length === 0 ? 'No analyses yet' : 'No analyses found'}
            description={items.length === 0 ? 'Run your first analysis to build your history.' : 'Try adjusting your filters or search query.'}
            action={<Link to="/app/analyze" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">New analysis</Link>}
          />
        ) : (
          <>
            <div className="surface overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-default">
                    <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">Analysis</th>
                    <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Type</th>
                    <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">Result</th>
                    <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3 hidden md:table-cell">Score</th>
                    <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Date</th>
                    <th className="text-right text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((analysis, i) => {
                    const s = statusMap[analysis.status] ?? statusMap.clean;
                    return (
                      <motion.tr key={analysis.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-default last:border-0 hover:bg-surface-2/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <Link to={`/app/results/${analysis.id}`} className="text-sm font-medium hover:text-primary">{analysis.name}</Link>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell"><span className="text-xs text-muted uppercase">{analysis.type}</span></td>
                        <td className="px-5 py-3.5"><StatusBadge status={s.status} label={s.label} /></td>
                        <td className="px-5 py-3.5 hidden md:table-cell"><span className="text-sm tabular-nums">{analysis.score}%</span></td>
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <span className="text-sm text-muted">{new Date(analysis.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/app/results/${analysis.id}`} className="p-1.5 rounded-lg hover:bg-surface-2 text-muted hover:text-content transition-colors">
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => void remove(analysis.id)}
                              className="p-1.5 rounded-lg hover:bg-surface-2 text-muted hover:text-error transition-colors"
                              aria-label={`Delete ${analysis.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-default text-sm hover:bg-surface-2 disabled:opacity-50 transition-colors">
                    <ChevronLeft className="h-4 w-4" />Previous
                  </button>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-default text-sm hover:bg-surface-2 disabled:opacity-50 transition-colors">
                    Next<ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
