import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Palette, Lock, Search, Bell, Check, LogOut, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/layout/PageTransition';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/apiClient';
import { PLAN_LABELS } from '@/lib/plans';
import type { ThemeMode } from '@/types/settings';
import type { AuthTokens } from '@/types/user';

const sections = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'analysis', label: 'Analysis', icon: Search },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const;

const themes: { key: ThemeMode; label: string }[] = [
  { key: 'dark', label: 'Dark' },
  { key: 'light', label: 'Light' },
  { key: 'system', label: 'System' },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-border-hover'}`}>
      <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-0.5 h-5 w-5 rounded-full bg-white" style={{ left: on ? '1.375rem' : '0.125rem' }} />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-default last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { settings, setTheme, togglePrivacy, toggleAnalysis, toggleNotifications } = useSettingsStore();
  const { user, plan, logout, applyTokens, refreshUser } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const saveName = async () => {
    if (!user || !name.trim() || name === user.name) return;
    setSavingName(true);
    try {
      await api.patch('/users/me', { name: name.trim() });
      await refreshUser();
    } finally {
      setSavingName(false);
    }
  };

  const upgrade = async (target: 'pro' | 'premium') => {
    setUpgrading(true);
    try {
      const tokens = await api.post<AuthTokens>('/billing/upgrade', { plan: target });
      applyTokens(tokens);
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-muted">Manage your account, privacy and analysis preferences.</p>
        </div>

        <div className="grid lg:grid-cols-[200px_1fr] gap-6">
          <nav className="hidden lg:block">
            <div className="space-y-1 sticky top-20">
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-content hover:bg-surface-2 transition-colors">
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="space-y-6">
            <section id="account" className="surface p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">Account</h2>
              </div>

              {user ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted block mb-1.5">Name</label>
                    <div className="flex gap-2">
                      <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 px-3 py-2 bg-surface-2 border border-default rounded-lg text-sm text-content focus:outline-none focus:border-primary" />
                      <button onClick={saveName} disabled={savingName || !name.trim() || name === user.name} className="px-3 py-2 rounded-lg border border-default text-sm hover:bg-surface-2 disabled:opacity-40">
                        {savingName ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted block mb-1.5">Email</label>
                    <input value={user.email} readOnly className="w-full px-3 py-2 bg-surface-2 border border-default rounded-lg text-sm text-muted" />
                  </div>
                  <div>
                    <label className="text-sm text-muted block mb-1.5">Plan</label>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                        {PLAN_LABELS[plan]}
                      </span>
                      {plan === 'pro' && (
                        <button onClick={() => upgrade('premium')} disabled={upgrading} className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover">
                          <Sparkles className="h-3.5 w-3.5" /> Upgrade to Premium
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="pt-2">
                    <button onClick={() => { void logout(); navigate('/'); }} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-error/20 text-sm font-medium text-error hover:bg-error/10 transition-colors">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted">
                    You're using Provenance Inspector anonymously (Free). Settings are stored in this browser.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => upgrade('pro')} disabled={upgrading} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover">
                      Create a Pro account
                    </button>
                    <button onClick={() => navigate('/pricing')} className="px-4 py-2 rounded-lg border border-default text-sm hover:bg-surface-2">
                      Compare plans
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section id="appearance" className="surface p-5">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">Appearance</h2>
              </div>
              <p className="text-sm font-medium mb-3">Theme</p>
              <div className="flex gap-2">
                {themes.map((theme) => (
                  <button key={theme.key} onClick={() => setTheme(theme.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    settings.appearance.theme === theme.key ? 'border-primary bg-primary/10 text-primary' : 'border-default text-muted hover:bg-surface-2'
                  }`}>
                    {settings.appearance.theme === theme.key && <Check className="h-3.5 w-3.5" />}
                    {theme.label}
                  </button>
                ))}
              </div>
            </section>

            <section id="privacy" className="surface p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">Privacy</h2>
              </div>
              <SettingRow label="Local processing" description="Content is always analysed in your browser">
                <Toggle on={settings.privacy.localProcessing} onClick={() => togglePrivacy('localProcessing')} />
              </SettingRow>
              <SettingRow label="Store analysis history" description={user ? 'Keep a synced record of past analyses' : 'Keep a record in this browser'}>
                <Toggle on={settings.privacy.storeHistory} onClick={() => togglePrivacy('storeHistory')} />
              </SettingRow>
              <SettingRow label="Telemetry" description="Send anonymous usage data">
                <Toggle on={settings.privacy.telemetry} onClick={() => togglePrivacy('telemetry')} />
              </SettingRow>
            </section>

            <section id="analysis" className="surface p-5">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">Analysis</h2>
              </div>
              <SettingRow label="Detailed results" description="Show expanded result information">
                <Toggle on={settings.analysis.detailedResults} onClick={() => toggleAnalysis('detailedResults')} />
              </SettingRow>
              <SettingRow label="Show statistical data" description="Display statistical charts and metrics">
                <Toggle on={settings.analysis.showStatisticalData} onClick={() => toggleAnalysis('showStatisticalData')} />
              </SettingRow>
              <SettingRow label="Show technical information" description="Display technical details in reports">
                <Toggle on={settings.analysis.showTechnicalInfo} onClick={() => toggleAnalysis('showTechnicalInfo')} />
              </SettingRow>
            </section>

            <section id="notifications" className="surface p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">Notifications</h2>
              </div>
              <SettingRow label="Email alerts" description="Receive email notifications">
                <Toggle on={settings.notifications.emailAlerts} onClick={() => toggleNotifications('emailAlerts')} />
              </SettingRow>
              <SettingRow label="Analysis complete" description="Notify when an analysis finishes">
                <Toggle on={settings.notifications.analysisComplete} onClick={() => toggleNotifications('analysisComplete')} />
              </SettingRow>
              <SettingRow label="Security alerts" description="Get notified about security events">
                <Toggle on={settings.notifications.securityAlerts} onClick={() => toggleNotifications('securityAlerts')} />
              </SettingRow>
            </section>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
