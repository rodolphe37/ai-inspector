/**
 * Internationalisation (English / French).
 *
 * - UI strings live in `locales/en.ts` (source of truth, typed) and
 *   `locales/fr.ts` (must provide every key; enforced by the type checker).
 * - The initial language comes from the saved choice, else the browser
 *   language (`fr*` → French, anything else → English).
 * - Engine output (verdict basis, signal details, summaries…) is generated in
 *   the language active at analysis time and stored with the result.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { fr } from './locales/fr';

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'fr', label: 'Français', short: 'FR' },
] as const;

export type Language = (typeof LANGUAGES)[number]['code'];

const STORAGE_KEY = 'ai.lang';

function detect(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'fr') return saved;
  } catch {
    /* storage unavailable */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.languages?.[0] ?? navigator.language : 'en';
  return nav?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr } },
  lng: detect(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'fr'],
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
});

function syncDocument(lng: string) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lng;
  document.title = i18n.t('common.meta.title');
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', i18n.t('common.meta.description'));
}
syncDocument(i18n.language);
i18n.on('languageChanged', syncDocument);

export function setLanguage(lng: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* storage unavailable */
  }
  void i18n.changeLanguage(lng);
}

export function currentLanguage(): Language {
  return i18n.language === 'fr' ? 'fr' : 'en';
}

/** Locale for `toLocaleDateString` / `Intl` formatting. */
export function currentLocale(): string {
  return currentLanguage() === 'fr' ? 'fr-FR' : 'en-US';
}

/** Non-React translate function (engine, services). */
export const t = i18n.t.bind(i18n);

export default i18n;
