import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { LANGUAGES, setLanguage, type Language } from '@/i18n';

/** Compact EN / FR toggle. */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const current = (i18n.language === 'fr' ? 'fr' : 'en') as Language;

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={`inline-flex items-center gap-0.5 rounded-lg border border-default p-0.5 ${className}`}
    >
      <Languages className="h-3.5 w-3.5 text-subtle mx-1" aria-hidden />
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLanguage(l.code)}
          aria-pressed={current === l.code}
          title={l.label}
          className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
            current === l.code ? 'bg-primary/10 text-primary' : 'text-muted hover:text-content'
          }`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
