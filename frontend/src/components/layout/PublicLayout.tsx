import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import Logo from '../../assets/app-logo.png';

const navLinks = [
  { to: '/features', label: 'Features' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/security', label: 'Security' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
];

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const authed = useAuthStore((s) => s.status === 'authenticated');

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="sticky top-0 z-40 border-b border-default bg-bg/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                 <img src={Logo} className='w-10 h-10'/>
              </div>
              <span className="font-semibold text-content tracking-tight">Provenance Inspector</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-content bg-surface-2'
                        : 'text-muted hover:text-content hover:bg-surface-2'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {!authed && (
                <Link to="/login" className="text-sm font-medium text-muted hover:text-content transition-colors">
                  Sign in
                </Link>
              )}
              <Link to="/app" className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors">
                {authed ? 'Open app' : 'Launch app'}
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-surface-2 text-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-default"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-muted hover:text-content hover:bg-surface-2"
                  >
                    {link.label}
                  </NavLink>
                ))}
                <div className="pt-2 flex gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center text-sm font-medium px-4 py-2 rounded-lg border border-default text-content"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/app"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center text-sm font-medium px-4 py-2 rounded-lg bg-primary text-white"
                  >
                    Launch app
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-default">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <img src={Logo} className='w-10 h-10'/>
                </div>
                <span className="font-semibold">Provenance Inspector</span>
              </div>
              <p className="text-sm text-muted max-w-md">
                Independent provenance analysis. Inspect digital content for known signals,
                metadata, watermarks and forensic signals — with a clear confidence level, not a black-box guess.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-sm text-muted hover:text-content">Features</Link></li>
                <li><Link to="/pricing" className="text-sm text-muted hover:text-content">Pricing</Link></li>
                <li><Link to="/how-it-works" className="text-sm text-muted hover:text-content">How it works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-muted hover:text-content">About</Link></li>
                <li><Link to="/security" className="text-sm text-muted hover:text-content">Security</Link></li>
                <li><Link to="/login" className="text-sm text-muted hover:text-content">Sign in</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-default flex flex-col sm:flex-row justify-between gap-4">
            <p className="text-xs text-subtle">
              © 2026 Provenance Inspector. An absence of signal does not constitute proof of human origin.
            </p>
            <p className="text-xs text-subtle">
              Content is analysed locally in your browser. Evidence-based — every verdict shows its basis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
