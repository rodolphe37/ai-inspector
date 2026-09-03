import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AppLayout } from '@/components/layout/AppLayout';
import { SignUpModal } from '@/components/auth/SignUpModal';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQuotaStore } from '@/stores/useQuotaStore';

const Landing = lazy(() => import('@/pages/Landing'));
const Features = lazy(() => import('@/pages/Features'));
const HowItWorks = lazy(() => import('@/pages/HowItWorks'));
const Security = lazy(() => import('@/pages/Security'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const About = lazy(() => import('@/pages/About'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const Dashboard = lazy(() => import('@/pages/app/Dashboard'));
const Analyze = lazy(() => import('@/pages/app/Analyze'));
const Results = lazy(() => import('@/pages/app/Results'));
const History = lazy(() => import('@/pages/app/History'));
const Fingerprints = lazy(() => import('@/pages/app/Fingerprints'));
const FingerprintDetail = lazy(() => import('@/pages/app/FingerprintDetail'));
const Clean = lazy(() => import('@/pages/app/Clean'));
const Settings = lazy(() => import('@/pages/app/Settings'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function useBootstrap() {
  const initAuth = useAuthStore((s) => s.init);
  const bootstrapQuota = useQuotaStore((s) => s.bootstrap);
  const loadSettings = useSettingsStore((s) => s.load);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    void initAuth().then(() => {
      void bootstrapQuota();
      void loadSettings();
    });
  }, [initAuth, bootstrapQuota, loadSettings]);

  // reload user-scoped data whenever auth state flips
  useEffect(() => {
    if (status !== 'loading') {
      void loadSettings();
      void useQuotaStore.getState().refresh();
    }
  }, [status, loadSettings]);
}

function useTheme() {
  const theme = useSettingsStore((s) => s.settings.appearance.theme);
  useEffect(() => {
    const root = document.documentElement;
    const apply = (mode: 'dark' | 'light') => {
      if (mode === 'light') root.classList.add('light');
      else root.classList.remove('light');
    };
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      apply(mq.matches ? 'light' : 'dark');
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'light' : 'dark');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    apply(theme);
  }, [theme]);
}

function App() {
  useBootstrap();
  useTheme();

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/security" element={<Security />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/magic" element={<AuthCallback />} />

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="analyze" element={<Analyze />} />
            <Route path="results/:id" element={<Results />} />
            <Route path="history" element={<History />} />
            <Route path="fingerprints" element={<Fingerprints />} />
            <Route path="fingerprints/:id" element={<FingerprintDetail />} />
            <Route path="clean" element={<Clean />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <SignUpModal />
    </BrowserRouter>
  );
}

export default App;
