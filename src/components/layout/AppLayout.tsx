import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Search, FileSearch, History,
  Fingerprint, Sparkles, Settings, Bell, Menu, X, Eye, EyeOff,
  ChevronRight, User, LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import Logo from "../../assets/app-logo.png"

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
  const { settings, togglePrivacy } = useSettingsStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const demoMode = settings.privacy.showDemoLabels;
  const privacyMode = settings.privacy.localProcessing;

  const displayName = user?.name ?? settings.account.name;

  const currentCrumb = breadcrumbMap[location.pathname] || 'Overview';

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-default bg-surface/50">
        <SidebarContent
          privacyMode={privacyMode}
          demoMode={demoMode}
          togglePrivacy={() => togglePrivacy('localProcessing')}
        />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed left-0 top-0 z-50 w-64 h-full border-r border-default bg-surface flex flex-col"
            >
              <SidebarContent
                privacyMode={privacyMode}
                demoMode={demoMode}
                togglePrivacy={() => togglePrivacy('localProcessing')}
                onNavigate={() => setSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-default bg-bg/80 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-surface-2 text-muted"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <nav className="flex items-center gap-1.5 text-sm">
                <Link to="/app" className="text-muted hover:text-content transition-colors">
                  Dashboard
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-subtle" />
                <span className="text-content font-medium">{currentCrumb}</span>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {demoMode && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                  <Eye className="h-3 w-3" />
                  Demo mode
                </span>
              )}
              <button className="p-2 rounded-lg hover:bg-surface-2 text-muted hover:text-content transition-colors">
                <Bell className="h-4 w-4" />
              </button>
              <Link
                to="/app/settings"
                className="flex items-center gap-2 p-1 pr-3 rounded-lg hover:bg-surface-2 transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline text-sm font-medium text-content">
                  {displayName}
                </span>
              </Link>
              {user && (
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="p-2 rounded-lg hover:bg-surface-2 text-muted hover:text-content transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-default bg-surface/90 backdrop-blur-md">
          <div className="flex justify-around items-center h-16 px-2">
            {navItems.slice(0, 5).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${isActive ? 'text-primary' : 'text-muted'
                  }`
                }
              >
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

function SidebarContent({
  privacyMode,
  demoMode,
  togglePrivacy,
  onNavigate,
}: {
  privacyMode: boolean;
  demoMode: boolean;
  togglePrivacy: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-default">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <img src={Logo} className='w-10 h-10' />
          </div>
          <span className="font-semibold text-content text-sm tracking-tight">
            Provenance Inspector
          </span>
        </Link>
        {onNavigate && (
          <button onClick={onNavigate} className="p-1.5 rounded-lg hover:bg-surface-2 text-muted">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                ? 'bg-surface-2 text-content'
                : 'text-muted hover:text-content hover:bg-surface-2/50'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-default space-y-3">
        <button
          onClick={togglePrivacy}
          className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-2 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm text-muted">
            {privacyMode ? <EyeOff className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4" />}
            Privacy mode
          </span>
          <span
            className={`relative h-5 w-9 rounded-full transition-colors ${privacyMode ? 'bg-primary' : 'bg-border-hover'
              }`}
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white ${privacyMode ? 'left-4.5' : 'left-0.5'
                }`}
              style={{ left: privacyMode ? '1.125rem' : '0.125rem' }}
            />
          </span>
        </button>

        {demoMode && (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-warning/10 border border-warning/20">
            <Eye className="h-3.5 w-3.5 text-warning" />
            <span className="text-xs font-medium text-warning">Demo mode active</span>
          </div>
        )}
      </div>
    </>
  );
}
