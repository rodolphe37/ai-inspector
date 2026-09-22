import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionGlobalConfig } from 'framer-motion';
import './i18n';
import App from './App.tsx';
import './index.css';

// Dev-only: `?noanim` finishes every animation instantly (visual review, tests).
if (import.meta.env.DEV && new URLSearchParams(location.search).has('noanim')) {
  MotionGlobalConfig.skipAnimations = true;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
