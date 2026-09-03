import { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { api, ApiError } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/useAuthStore';
import { OAuthButtons } from './OAuthButtons';

type Mode = 'login' | 'register';

export function AuthPanel({
  mode: initialMode,
  plan = 'pro',
  onSuccess,
  showPlanPicker = false,
}: {
  mode: Mode;
  plan?: 'pro' | 'premium';
  onSuccess?: () => void;
  showPlanPicker?: boolean;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const { login, register } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium'>(plan);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'register') {
        await register({ email, name, password, plan: selectedPlan });
      } else {
        await login(email, password);
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const sendMagicLink = async () => {
    if (!email) {
      setError('Enter your email first.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await api.post<{ sent: boolean; debugUrl?: string }>(
        '/auth/magic/request',
        { email, name: name || undefined, plan: selectedPlan },
        { auth: false },
      );
      setMagicSent(true);
      if (res.debugUrl) console.info('Magic link (dev):', res.debugUrl);
    } catch {
      setError('Could not send the link. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (magicSent) {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="mx-auto w-fit p-3 rounded-2xl bg-primary/10 text-primary">
          <Mail className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium">Check your inbox</p>
        <p className="text-sm text-muted">
          We sent a sign-in link to <span className="text-content">{email}</span>.
        </p>
        <button onClick={() => setMagicSent(false)} className="text-sm text-primary hover:text-primary-hover">
          Use a password instead
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 border border-error/20">
          <AlertCircle className="h-4 w-4 text-error shrink-0" />
          <span className="text-sm text-error">{error}</span>
        </div>
      )}

      {showPlanPicker && mode === 'register' && (
        <div className="grid grid-cols-2 gap-2">
          {(['pro', 'premium'] as const).map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setSelectedPlan(p)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                selectedPlan === p
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-default text-muted hover:bg-surface-2'
              }`}
            >
              {p === 'premium' && <Sparkles className="inline h-3.5 w-3.5 mr-1" />}
              {p}
            </button>
          ))}
        </div>
      )}

      {mode === 'register' && (
        <Field icon={<UserIcon className="h-4 w-4" />} label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
            className="input"
          />
        </Field>
      )}

      <Field icon={<Mail className="h-4 w-4" />} label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="input"
        />
      </Field>

      <Field icon={<Lock className="h-4 w-4" />} label="Password">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="input pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-content"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </Field>

      <button
        type="submit"
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
      >
        {mode === 'register' ? 'Create account' : 'Sign in'}
        <ArrowRight className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={sendMagicLink}
        disabled={busy}
        className="w-full text-center text-sm text-muted hover:text-content"
      >
        Email me a sign-in link instead
      </button>

      <OAuthButtons plan={selectedPlan} />

      <p className="text-center text-sm text-muted">
        {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'register' ? 'login' : 'register');
            setError(null);
          }}
          className="text-primary hover:text-primary-hover font-medium"
        >
          {mode === 'register' ? 'Sign in' : 'Sign up'}
        </button>
      </p>
    </form>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle">{icon}</span>
        {children}
      </div>
    </div>
  );
}
