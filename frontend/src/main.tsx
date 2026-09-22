import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionGlobalConfig } from 'framer-motion';
import './i18n';
import App from './App.tsx';
import { registerSW } from 'virtual:pwa-register';
import './index.css';

// Dev-only: `?noanim` finishes every animation instantly (visual review, tests).
if (import.meta.env.DEV && new URLSearchParams(location.search).has('noanim')) {
  MotionGlobalConfig.skipAnimations = true;
}

// A new deploy is installed by the service worker in the background; the page
// then reloads once so nobody keeps running an outdated version.
if (import.meta.env.PROD) registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
