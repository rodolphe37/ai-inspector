import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * iOS Safari never fires `beforeinstallprompt`: installing goes through
 * Share > Add to Home Screen, so instructions are shown instead of a button.
 */
function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIos =
    /iphone|ipad|ipod/i.test(ua) ||
    // iPadOS 13+ presents itself as a Mac
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // Chrome / Firefox / Edge / Opera on iOS have a different share menu.
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios|opios/i.test(ua);
  return isIos && isSafari;
}

/**
 * PWA installation on every platform:
 * - Chromium (Android / desktop): native prompt via `beforeinstallprompt`;
 * - iOS Safari: manual instructions.
 * Hidden once the app is installed or the banner was dismissed (remembered).
 */
export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandalone());
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }, [deferred]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* storage unavailable */
    }
  }, []);

  const iosSafari = isIosSafari();

  return {
    /** Android / desktop Chromium: the native install prompt is available. */
    canInstall: Boolean(deferred) && !installed && !dismissed,
    /** iOS Safari: show the Share > Add to Home Screen instructions. */
    showIosHint: iosSafari && !installed && !dismissed,
    promptInstall,
    dismiss,
  };
}
