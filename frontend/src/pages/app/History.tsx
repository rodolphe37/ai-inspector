import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Eye, Trash2, History as HistoryIcon, Eraser } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { useTranslation } from 'react-i18next';
import { badgeFor } from '@/lib/analysisStatus';
import { currentLocale } from '@/i18n';
import type { CleaningRecord } from '@/types/analysis';

const filters = ['all', 'clean', 'signals', 'inconclusive'] as const;

const PAGE_SIZE = 8;

export default function History() {
  const { items, cleanings, tab, filter, search, loading, loaded, setTab, setFilter, setSearch, load, remove, removeCleaning } = useHistoryStore();
  const [page, setPage] = useState(1);
  const { t } = useTranslation();

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'clean' && item.status === 'clean') ||
      (filter === 'signals' && ['possible_signal', 'signal_detected', 'c2pa_found'].includes(item.status)) ||
      (filter === 'inconclusive' && item.status === 'inconclusive');
    return matchesSearch && matchesFilter;
  });

  const filteredCleanings = cleanings.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil((tab === 'analyses' ? filtered.length : filteredCleanings.length) / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const paginatedCleanings = filteredCleanings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const tabs = [
    { key: 'analyses', count: items.length },
    { key: 'cleanings', count: cleanings.length },
  ] as const;

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{t('history.title')}</h1>
          <p className="mt-1 text-muted">{t('history.subtitle')}</p>
        </div>

        <div role="tablist" aria-label={t('history.title')} className="mb-4 flex gap-6 border-b border-default">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              role="tab"
              aria-selected={tab === tb.key}
              onClick={() => { setTab(tb.key); setPage(1); }}
              className={`relative -mb-px flex items-center gap-2 pb-3 text-sm font-medium transition-colors ${
                tab === tb.key ? 'text-content' : 'text-muted hover:text-content'
              }`}
            >
              {tb.key === 'cleanings' ? <Eraser className="h-4 w-4" /> : <HistoryIcon className="h-4 w-4" />}
              {t(`history.tabs.${tb.key}`)}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums leading-none ${tab === tb.key ? 'bg-primary/15 text-primary' : 'bg-surface-2 text-subtle'}`}>
                {tb.count}
              </span>
              {tab === tb.key && <motion.span layoutId="history-tab" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {tab === 'analyses' && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-surface-2 rounded-lg sm:flex sm:w-fit">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`relative whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filter === f ? 'text-content' : 'text-muted hover:text-content'
                }`}
              >
                {t(`history.filters.${f}`)}
                {filter === f && <motion.div layoutId="filter-indicator" className="absolute inset-0 bg-surface rounded-md -z-10" />}
              </button>
            ))}
          </div>
          )}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={tab === 'analyses' ? t('history.search') : t('history.cleaning.search')}
              className="w-full pl-10 pr-4 py-2 bg-surface-2 border border-default rounded-lg text-sm text-content focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {loading && !loaded ? (
          <div className="surface p-8 text-center text-sm text-muted">{t('common.loading')}</div>
        ) : tab === 'cleanings' ? (
          filteredCleanings.length === 0 ? (
            <EmptyState
              icon={<Eraser className="h-8 w-8" />}
              title={cleanings.length === 0 ? t('history.cleaning.emptyTitle') : t('history.noResults')}
              description={cleanings.length === 0 ? t('history.cleaning.emptyDesc') : t('history.noResultsDesc')}
              action={<Link to="/app/clean" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">{t('history.cleaning.action')}</Link>}
            />
          ) : (
            <CleaningList items={paginatedCleanings} onDelete={(id) => void removeCleaning(id)} />
          )
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<HistoryIcon className="h-8 w-8" />}
            title={items.length === 0 ? t('common.noAnalyses') : t('history.noResults')}
            description={items.length === 0 ? t('history.emptyDesc') : t('history.noResultsDesc')}
            action={<Link to="/app/analyze" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">{t('common.newAnalysis')}</Link>}
          />
        ) : (
          <>
            {/* Mobile: one card per analysis (no horizontal scrolling). */}
            <ul className="sm:hidden space-y-2">
              {paginated.map((analysis) => {
                const s = badgeFor(analysis.status);
                return (
                  <li key={analysis.id} className="surface flex items-center gap-3 p-3">
                    <Link to={`/app/results/${analysis.id}`} className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium" title={analysis.name}>{analysis.name}</span>
                      <span className="mt-0.5 block text-xs text-subtle">
                        {t(`status.type.${analysis.type}`)} · {new Date(analysis.date).toLocaleDateString(currentLocale(), { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="mt-2 inline-block"><StatusBadge status={s.badge} label={t(`status.analysis.${s.status}`)} /></span>
                    </Link>
                    <button
                      onClick={() => void remove(analysis.id)}
                      className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-error"
                      aria-label={t('history.delete', { name: analysis.name })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="surface hidden overflow-x-auto sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-default">
                    <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">{t('common.table.analysis')}</th>
                    <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3 hidden sm:table-cell">{t('common.table.type')}</th>
                    <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">{t('common.table.result')}</th>
                    <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3 hidden md:table-cell">{t('common.table.score')}</th>
                    <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3 hidden lg:table-cell">{t('common.table.date')}</th>
                    <th className="text-right text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">{t('common.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((analysis, i) => {
                    const s = badgeFor(analysis.status);
                    return (
                      <motion.tr key={analysis.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-default last:border-0 hover:bg-surface-2/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <Link to={`/app/results/${analysis.id}`} className="block max-w-[10rem] truncate text-sm font-medium hover:text-primary sm:max-w-xs" title={analysis.name}>{analysis.name}</Link>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell"><span className="text-xs text-muted uppercase">{t(`status.type.${analysis.type}`)}</span></td>
                        <td className="px-5 py-3.5"><StatusBadge status={s.badge} label={t(`status.analysis.${s.status}`)} /></td>
                        <td className="px-5 py-3.5 hidden md:table-cell"><span className="text-sm tabular-nums">{analysis.score}%</span></td>
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <span className="text-sm text-muted">{new Date(analysis.date).toLocaleDateString(currentLocale(), { month: 'short', day: 'numeric' })}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/app/results/${analysis.id}`} className="p-1.5 rounded-lg hover:bg-surface-2 text-muted hover:text-content transition-colors" aria-label={t('common.view')}>
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => void remove(analysis.id)}
                              className="p-1.5 rounded-lg hover:bg-surface-2 text-muted hover:text-error transition-colors"
                              aria-label={t('history.delete', { name: analysis.name })}
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

          </>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted">{t('history.page', { page, total: totalPages })}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-default text-sm hover:bg-surface-2 disabled:opacity-50 transition-colors">
                <ChevronLeft className="h-4 w-4" />{t('common.previous')}
              </button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-default text-sm hover:bg-surface-2 disabled:opacity-50 transition-colors">
                {t('common.next')}<ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function CleanedBadge() {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      <Eraser className="h-3 w-3" />
      {t('history.cleaning.badge')}
    </span>
  );
}

const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;

function CleaningList({ items, onDelete }: { items: CleaningRecord[]; onDelete: (id: string) => void }) {
  const { t } = useTranslation();
  const summary = (c: CleaningRecord) => {
    const parts = c.removed.filter((r) => r.count > 0).map((r) => (r.count > 1 ? `${r.count} × ${r.type}` : r.type));
    return parts.length ? parts.join(' · ') : t('history.cleaning.nothing');
  };
  const date = (c: CleaningRecord) => new Date(c.date).toLocaleDateString(currentLocale(), { month: 'short', day: 'numeric' });
  const deleteButton = (c: CleaningRecord, cls: string) => (
    <button onClick={() => onDelete(c.id)} className={cls} aria-label={t('history.delete', { name: c.name })}>
      <Trash2 className="h-4 w-4" />
    </button>
  );

  return (
    <>
      {/* Mobile: one card per cleaning. */}
      <ul className="sm:hidden space-y-2">
        {items.map((c) => (
          <li key={c.id} className="surface flex items-start gap-3 p-3">
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium" title={c.name}>{c.name}</span>
              <span className="mt-0.5 block text-xs text-subtle">
                {t(`status.type.${c.type}`)} · {date(c)} · {kb(c.beforeSize)} → {kb(c.afterSize)}
              </span>
              <span className="mt-2 flex flex-wrap items-center gap-2">
                <CleanedBadge />
                <span className="text-xs text-muted">{summary(c)}</span>
              </span>
            </div>
            {deleteButton(c, 'shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-error')}
          </li>
        ))}
      </ul>

      <div className="surface hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-default">
              <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">{t('history.tabs.cleanings')}</th>
              <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">{t('common.table.type')}</th>
              <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">{t('history.cleaning.removed')}</th>
              <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3 hidden md:table-cell">{t('history.cleaning.size')}</th>
              <th className="text-left text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3 hidden lg:table-cell">{t('common.table.date')}</th>
              <th className="text-right text-xs font-medium text-subtle uppercase tracking-wider px-5 py-3">{t('common.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c, i) => (
              <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-default last:border-0 hover:bg-surface-2/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <CleanedBadge />
                    <span className="block max-w-[10rem] truncate text-sm font-medium sm:max-w-xs" title={c.name}>{c.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5"><span className="text-xs text-muted uppercase">{t(`status.type.${c.type}`)}</span></td>
                <td className="px-5 py-3.5">
                  <span className="block max-w-xs text-sm text-muted" title={summary(c)}>{summary(c)}</span>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <span className="whitespace-nowrap text-sm tabular-nums text-muted">
                    {kb(c.beforeSize)} → {kb(c.afterSize)}
                    {!c.lossless && <span className="ml-1 text-xs text-warning">({t('history.cleaning.reencoded')})</span>}
                  </span>
                </td>
                <td className="px-5 py-3.5 hidden lg:table-cell"><span className="text-sm text-muted">{date(c)}</span></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end">
                    {deleteButton(c, 'p-1.5 rounded-lg hover:bg-surface-2 text-muted hover:text-error transition-colors')}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
