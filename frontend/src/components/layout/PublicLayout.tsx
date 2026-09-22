import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { APP_VERSION, RELEASES_URL, REPO_URL } from '@/lib/constants';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import Logo from '../../assets/app-logo.png';

const navLinks = [
  { to: '/features', key: 'features' },
  { to: '/how-it-works', key: 'howItWorks' },
  { to: '/security', key: 'security' },
  { to: '/about', key: 'about' },
] as const;

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="sticky top-0 z-40 border-b border-default bg-bg/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                 <img src={Logo} className='w-10 h-10' alt="" />
              </div>
              <span className="font-semibold text-content tracking-tight">AI Inspector</span>
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
                  {t(`nav.public.${link.key}`)}
                </NavLink>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-sm font-medium text-muted hover:text-content transition-colors">
                GitHub
              </a>
              <Link to="/app" className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors">
                {t('nav.launchApp')}
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-surface-2 text-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={t(mobileOpen ? 'nav.closeMenu' : 'nav.openMenu')}
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
                    {t(`nav.public.${link.key}`)}
                  </NavLink>
                ))}
                <LanguageSwitcher className="mt-2" />
                <div className="pt-2 flex gap-3">
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center text-sm font-medium px-4 py-2 rounded-lg border border-default text-content"
                  >
                    GitHub
                  </a>
                  <Link
                    to="/app"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center text-sm font-medium px-4 py-2 rounded-lg bg-primary text-white"
                  >
                    {t('nav.launchApp')}
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <img src={Logo} className='w-10 h-10' alt="" />
                </div>
                <span className="font-semibold">AI Inspector</span>
              </div>
              <p className="text-sm text-muted max-w-md">{t('footer.tagline')}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">{t('footer.product')}</h4>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-sm text-muted hover:text-content">{t('nav.public.features')}</Link></li>
                <li><Link to="/how-it-works" className="text-sm text-muted hover:text-content">{t('nav.public.howItWorks')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">{t('footer.project')}</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-muted hover:text-content">{t('nav.public.about')}</Link></li>
                <li><Link to="/security" className="text-sm text-muted hover:text-content">{t('nav.public.security')}</Link></li>
                <li><a href={REPO_URL} target="_blank" rel="noreferrer" className="text-sm text-muted hover:text-content">{t('footer.sourceCode')}</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-default flex flex-col sm:flex-row justify-between gap-4">
            <p className="text-xs text-subtle">
              {t('footer.copyright')}{' '}
              <a href={RELEASES_URL} target="_blank" rel="noreferrer" className="font-mono hover:text-content" title={t('footer.version')}>
                v{APP_VERSION}
              </a>
            </p>
            <p className="text-xs text-subtle">{t('footer.local')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
