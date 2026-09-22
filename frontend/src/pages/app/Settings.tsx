import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Palette, Lock, Search, Bell, Check, Trash2 } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { clearLocalAnalyses } from '@/lib/localDb';
import { useTranslation } from 'react-i18next';
import type { ThemeMode } from '@/types/settings';
import { LANGUAGES, setLanguage } from '@/i18n';

const sections = [
  { id: 'data', icon: Database },
  { id: 'appearance', icon: Palette },
  { id: 'privacy', icon: Lock },
  { id: 'analysis', icon: Search },
  { id: 'notifications', icon: Bell },
] as const;

const themes: ThemeMode[] = ['dark', 'light', 'system'];

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
  const [cleared, setCleared] = useState(false);
  const { t, i18n } = useTranslation();

  const clearHistory = async () => {
    if (!window.confirm(t('settings.data.confirm'))) return;
    await clearLocalAnalyses();
    await useHistoryStore.getState().load();
    setCleared(true);
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="mt-1 text-muted">{t('settings.subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-[200px_1fr] gap-6">
          <nav className="hidden lg:block">
            <div className="space-y-1 sticky top-20">
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-content hover:bg-surface-2 transition-colors">
                  <section.icon className="h-4 w-4" />
                  {t(`settings.sections.${section.id}`)}
                </a>
              ))}
            </div>
          </nav>

          <div className="space-y-6">
            <section id="data" className="surface p-5">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">{t('settings.sections.data')}</h2>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted">{t('settings.data.body')}</p>
                <button onClick={clearHistory} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-error/20 text-sm font-medium text-error hover:bg-error/10 transition-colors">
                  <Trash2 className="h-4 w-4" />
                  {cleared ? t('settings.data.cleared') : t('settings.data.clear')}
                </button>
              </div>
            </section>

            <section id="appearance" className="surface p-5">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">{t('settings.sections.appearance')}</h2>
              </div>
              <p className="text-sm font-medium mb-3">{t('settings.appearance.theme')}</p>
              <div className="flex gap-2">
                {themes.map((theme) => (
                  <button key={theme} onClick={() => setTheme(theme)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    settings.appearance.theme === theme ? 'border-primary bg-primary/10 text-primary' : 'border-default text-muted hover:bg-surface-2'
                  }`}>
                    {settings.appearance.theme === theme && <Check className="h-3.5 w-3.5" />}
                    {t(`settings.appearance.themes.${theme}`)}
                  </button>
                ))}
              </div>
              <p className="text-sm font-medium mt-5 mb-3">{t('common.language')}</p>
              <div className="flex gap-2">
                {LANGUAGES.map((lang) => (
                  <button key={lang.code} onClick={() => setLanguage(lang.code)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    i18n.language === lang.code ? 'border-primary bg-primary/10 text-primary' : 'border-default text-muted hover:bg-surface-2'
                  }`}>
                    {i18n.language === lang.code && <Check className="h-3.5 w-3.5" />}
                    {lang.label}
                  </button>
                ))}
              </div>
            </section>

            <section id="privacy" className="surface p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">{t('settings.sections.privacy')}</h2>
              </div>
              <SettingRow label={t('settings.privacy.local')} description={t('settings.privacy.localDesc')}>
                <Toggle on={settings.privacy.localProcessing} onClick={() => togglePrivacy('localProcessing')} />
              </SettingRow>
              <SettingRow label={t('settings.privacy.history')} description={t('settings.privacy.historyDesc')}>
                <Toggle on={settings.privacy.storeHistory} onClick={() => togglePrivacy('storeHistory')} />
              </SettingRow>
              <SettingRow label={t('settings.privacy.telemetry')} description={t('settings.privacy.telemetryDesc')}>
                <Toggle on={settings.privacy.telemetry} onClick={() => togglePrivacy('telemetry')} />
              </SettingRow>
            </section>

            <section id="analysis" className="surface p-5">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">{t('settings.sections.analysis')}</h2>
              </div>
              <SettingRow label={t('settings.analysis.detailed')} description={t('settings.analysis.detailedDesc')}>
                <Toggle on={settings.analysis.detailedResults} onClick={() => toggleAnalysis('detailedResults')} />
              </SettingRow>
              <SettingRow label={t('settings.analysis.stats')} description={t('settings.analysis.statsDesc')}>
                <Toggle on={settings.analysis.showStatisticalData} onClick={() => toggleAnalysis('showStatisticalData')} />
              </SettingRow>
              <SettingRow label={t('settings.analysis.technical')} description={t('settings.analysis.technicalDesc')}>
                <Toggle on={settings.analysis.showTechnicalInfo} onClick={() => toggleAnalysis('showTechnicalInfo')} />
              </SettingRow>
            </section>

            <section id="notifications" className="surface p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">{t('settings.sections.notifications')}</h2>
              </div>
              <SettingRow label={t('settings.notifications.complete')} description={t('settings.notifications.completeDesc')}>
                <Toggle on={settings.notifications.analysisComplete} onClick={() => toggleNotifications('analysisComplete')} />
              </SettingRow>
              <SettingRow label={t('settings.notifications.security')} description={t('settings.notifications.securityDesc')}>
                <Toggle on={settings.notifications.securityAlerts} onClick={() => toggleNotifications('securityAlerts')} />
              </SettingRow>
            </section>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
