import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Share, X } from 'lucide-react';
import { usePwaInstall } from '@/hooks/usePwaInstall';

/**
 * Install banner (bottom of the screen).
 * - Chromium (Android / desktop): native "Install" button.
 * - iOS Safari: "Share > Add to Home Screen" instructions.
 * Hides itself once the app is installed or the banner is closed.
 * In the workspace it sits above the mobile bottom bar.
 */
export function PwaInstallPrompt() {
  const { canInstall, showIosHint, promptInstall, dismiss } = usePwaInstall();
  const { t } = useTranslation();
  const { pathname } = useLocation();

  if (!canInstall && !showIosHint) return null;

  const inApp = pathname.startsWith('/app');
  const position = inApp
    ? 'bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-[calc(1rem+env(safe-area-inset-bottom))]'
    : 'bottom-[calc(1rem+env(safe-area-inset-bottom))]';

  const icon = (
    <img src="/web-app-manifest-192x192.png" alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-xl object-cover" />
  );
  const closeButton = (extra: string) => (
    <button
      type="button"
      onClick={dismiss}
      aria-label={t('pwa.close')}
      className={`shrink-0 self-start rounded-full p-1.5 text-subtle transition-colors hover:bg-surface-2 hover:text-content ${extra}`}
    >
      <X className="h-4 w-4" />
    </button>
  );

  return (
    <motion.div
      role="region"
      aria-label={t('pwa.region')}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-4 z-40 mx-auto max-w-md ${position}`}
    >
      {showIosHint ? (
        <div className="surface flex items-center gap-3 p-3 shadow-2xl">
          {icon}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t('pwa.title')}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              {t('pwa.iosBefore')}{' '}
              <Share className="inline h-3.5 w-3.5 align-[-3px] text-primary" role="img" aria-label={t('pwa.share')} />{' '}
              {t('pwa.iosAfter')} <span className="whitespace-nowrap">{t('pwa.iosAction')}</span>
            </p>
          </div>
          {closeButton('')}
        </div>
      ) : (
        <div className="surface flex flex-col items-stretch gap-2.5 p-3 shadow-2xl sm:flex-row sm:items-center sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {icon}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t('pwa.title')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{t('pwa.text')}</p>
            </div>
            {closeButton('sm:hidden')}
          </div>
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover sm:py-2"
          >
            <Download className="h-4 w-4" />
            {t('pwa.install')}
          </button>
          {closeButton('hidden sm:inline-flex')}
        </div>
      )}
    </motion.div>
  );
}
