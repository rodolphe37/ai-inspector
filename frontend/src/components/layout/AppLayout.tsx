import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Search, History, Fingerprint, Sparkles, Settings,
  Menu, X, ChevronRight, ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { APP_VERSION, RELEASES_URL, REPO_URL } from '@/lib/constants';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import Logo from '../../assets/app-logo.png';

const navItems = [
  { to: '/app', key: 'overview', icon: LayoutDashboard, end: true },
  { to: '/app/analyze', key: 'analyze', icon: Search, end: false },
  { to: '/app/history', key: 'history', icon: History, end: false },
  { to: '/app/fingerprints', key: 'fingerprints', icon: Fingerprint, end: false },
  { to: '/app/clean', key: 'clean', icon: Sparkles, end: false },
  { to: '/app/settings', key: 'settings', icon: Settings, end: false },
] as const;

type NavKey = (typeof navItems)[number]['key'];

const breadcrumbMap: Record<string, NavKey> = {
  '/app': 'overview',
  '/app/analyze': 'analyze',
  '/app/history': 'history',
  '/app/fingerprints': 'fingerprints',
  '/app/clean': 'clean',
  '/app/settings': 'settings',
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const currentCrumb = t(`nav.app.${breadcrumbMap[location.pathname] ?? 'overview'}`);

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="hidden lg:flex w-64 flex-col border-r border-default bg-surface/50">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 z-50 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'tween', duration: 0.25 }} className="lg:hidden fixed left-0 top-0 z-50 w-64 h-full border-r border-default bg-surface flex flex-col">
              <SidebarContent onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-default bg-bg/80 backdrop-blur-md pt-[env(safe-area-inset-top)]">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <button className="lg:hidden shrink-0 p-2 -ml-2 rounded-lg hover:bg-surface-2 text-muted" onClick={() => setSidebarOpen(true)} aria-label={t('nav.openMenu')}>
                <Menu className="h-5 w-5" />
              </button>
              <nav className="flex min-w-0 items-center gap-1.5 text-sm whitespace-nowrap">
                <Link to="/app" className="hidden sm:inline text-muted hover:text-content transition-colors">{t('nav.app.dashboard')}</Link>
                <ChevronRight className="hidden sm:block h-3.5 w-3.5 shrink-0 text-subtle" />
                <span className="truncate text-content font-medium">{currentCrumb}</span>
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                {t('nav.localPrivate')}
              </span>
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-default bg-surface/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
          <div className="grid grid-cols-5 h-16 px-1">
            {navItems.slice(0, 5).map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} aria-label={t(`nav.app.${item.key}`)} className={({ isActive }) => `flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-0.5 transition-colors ${isActive ? 'text-primary' : 'text-muted'}`}>
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="w-full truncate text-center text-[11px] leading-tight">{t(`nav.short.${item.key}`)}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-default">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <img src={Logo} className="w-10 h-10" alt="" />
          </div>
          <span className="font-semibold text-content text-sm tracking-tight">AI Inspector</span>
        </Link>
        {onNavigate && (
          <button onClick={onNavigate} className="p-1.5 rounded-lg hover:bg-surface-2 text-muted" aria-label={t('nav.closeMenu')}><X className="h-4 w-4" /></button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-surface-2 text-content' : 'text-muted hover:text-content hover:bg-surface-2/50'}`}>
            <item.icon className="h-4 w-4" />
            {t(`nav.app.${item.key}`)}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-default space-y-2">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-2">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-muted">{t('nav.freeOpenSource')}</span>
        </div>
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="block text-center text-xs text-primary hover:text-primary-hover py-1">
          {t('nav.viewOnGithub')} →
        </a>
        <a href={RELEASES_URL} target="_blank" rel="noreferrer" className="block text-center text-[11px] font-mono text-subtle hover:text-muted" title={t('footer.version')}>
          v{APP_VERSION}
        </a>
      </div>
    </>
  );
}
