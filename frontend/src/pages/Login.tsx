import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAuthStore } from '@/stores/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = login(email, password);
    if (result.success) {
      navigate('/app');
    } else {
      setError(result.error ?? 'Login failed.');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <Shield className="h-6 w-6" />
              </div>
            </Link>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-muted">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="surface p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 border border-error/20">
                <AlertCircle className="h-4 w-4 text-error flex-shrink-0" />
                <span className="text-sm text-error">{error}</span>
              </div>
            )}

            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-default rounded-lg text-sm text-content focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-surface-2 border border-default rounded-lg text-sm text-content focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-content"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-4 p-3 rounded-lg bg-surface-2 border border-default">
            <p className="text-xs text-subtle mb-1">Test account:</p>
            <p className="text-xs font-mono text-muted">demo@provenance-inspector.app / demo1234</p>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary-hover font-medium">
              Sign up
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-subtle">
            Demo mode — credentials are checked against a local JSON file.
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
