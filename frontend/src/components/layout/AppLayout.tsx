import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, History, Fingerprint, Sparkles, Settings,
  Menu, X, ChevronRight, User, LogOut, ShieldCheck, LogIn,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQuotaStore } from '@/stores/useQuotaStore';
import { PLAN_LABELS } from '@/lib/plans';
import Logo from '../../assets/app-logo.png';

const navItems = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/analyze', label: 'Analyze', icon: Search, end: false },
  { to: '/app/history', label: 'History', icon: History, end: false },
  { to: '/app/fingerprints', label: 'Fingerprints', icon: Fingerprint, end: false },
  { to: '/app/clean', label: 'Clean', icon: Sparkles, end: false },
  { to: '/app/settings', label: 'Settings', icon: Settings, end: false },
];

const breadcrumbMap: Record<string, string> = {
  '/app': 'Overview',
  '/app/analyze': 'Analyze',
  '/app/history': 'History',
  '/app/fingerprints': 'Fingerprints',
  '/app/clean': 'Clean',
  '/app/settings': 'Settings',
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, plan, status, logout } = useAuthStore();
  const { quota, openModal } = useQuotaStore();

  const displayName = user?.name ?? 'Guest';
  const currentCrumb = breadcrumbMap[location.pathname] || 'Overview';
  const anon = status !== 'authenticated';
  const remaining = quota && !quota.unlimited ? quota.remaining : null;

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="hidden lg:flex w-64 flex-col border-r border-default bg-surface/50">
        <SidebarContent plan={plan} anon={anon} />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 z-50 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'tween', duration: 0.25 }} className="lg:hidden fixed left-0 top-0 z-50 w-64 h-full border-r border-default bg-surface flex flex-col">
              <SidebarContent plan={plan} anon={anon} onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-default bg-bg/80 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <button className="lg:hidden p-2 rounded-lg hover:bg-surface-2 text-muted" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <nav className="flex items-center gap-1.5 text-sm">
                <Link to="/app" className="text-muted hover:text-content transition-colors">Dashboard</Link>
                <ChevronRight className="h-3.5 w-3.5 text-subtle" />
                <span className="text-content font-medium">{currentCrumb}</span>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {PLAN_LABELS[plan]}
              </span>
              {anon ? (
                <Link to="/login" className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-content transition-colors">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
              ) : (
                <>
                  <Link to="/app/settings" className="flex items-center gap-2 p-1 pr-3 rounded-lg hover:bg-surface-2 transition-colors">
                    <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center overflow-hidden">
                      {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : <User className="h-4 w-4" />}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-content">{displayName}</span>
                  </Link>
                  <button onClick={() => { void logout(); navigate('/'); }} className="p-2 rounded-lg hover:bg-surface-2 text-muted hover:text-content transition-colors" title="Sign out">
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {anon && remaining != null && (
            <button
              onClick={openModal}
              className="w-full flex items-center justify-center gap-2 bg-primary/5 border-t border-primary/10 px-4 py-1.5 text-xs text-muted hover:bg-primary/10 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Free plan — <span className="text-content font-medium">{remaining} scan{remaining === 1 ? '' : 's'} left</span>. Create an account for the full pipeline.
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-default bg-surface/90 backdrop-blur-md">
          <div className="flex justify-around items-center h-16 px-2">
            {navItems.slice(0, 5).map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${isActive ? 'text-primary' : 'text-muted'}`}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

function SidebarContent({ plan, anon, onNavigate }: { plan: 'anonymous' | 'pro' | 'premium'; anon: boolean; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-default">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <img src={Logo} className="w-10 h-10" alt="" />
          </div>
          <span className="font-semibold text-content text-sm tracking-tight">Provenance Inspector</span>
        </Link>
        {onNavigate && (
          <button onClick={onNavigate} className="p-1.5 rounded-lg hover:bg-surface-2 text-muted"><X className="h-4 w-4" /></button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-surface-2 text-content' : 'text-muted hover:text-content hover:bg-surface-2/50'}`}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-default space-y-2">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-2">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-muted">{PLAN_LABELS[plan]} plan</span>
        </div>
        {anon && (
          <Link to="/pricing" onClick={onNavigate} className="block text-center text-xs text-primary hover:text-primary-hover py-1">
            Compare plans →
          </Link>
        )}
      </div>
    </>
  );
}
