import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { AuthPanel } from '@/components/auth/AuthPanel';
import { useAuthStore } from '@/stores/useAuthStore';

export default function Signup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const status = useAuthStore((s) => s.status);
  const plan = params.get('plan') === 'premium' ? 'premium' : 'pro';

  useEffect(() => {
    if (status === 'authenticated') navigate('/app', { replace: true });
  }, [status, navigate]);

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <Shield className="h-6 w-6" />
              </div>
            </Link>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-1 text-sm text-muted">Pro and Premium unlock the full analysis pipeline</p>
          </div>

          <div className="surface p-6">
            <AuthPanel mode="register" plan={plan} showPlanPicker onSuccess={() => navigate('/app', { replace: true })} />
          </div>

          <p className="mt-6 text-center text-xs text-subtle">
            Just want to try it? Anonymous use is free —{' '}
            <Link to="/app/analyze" className="text-primary hover:text-primary-hover">start analysing</Link>.
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
