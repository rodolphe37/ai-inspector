# AI Inspector web app

The installable, bilingual (English / French) PWA that answers **"was this made
by AI?"** for text, code and images. All analysis runs **in the browser**:
C2PA signature validation (WASM), image forensics (FFT, noise residual),
metadata extraction and text / code stylometry.

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · React Router 7 · i18next ·
Zustand · Framer Motion · Recharts · `idb` · `exifr` · `c2pa` · vite-plugin-pwa

## Develop

```bash
npm install
cp .env.example .env     # VITE_API_URL (default http://localhost:8000/api)
npm run dev              # http://localhost:5173
```

Run the [API](../backend) alongside it for the fingerprint catalogue
(`cd ../backend && make dev`). Without it, analysis still works; only the
"Known fingerprints" section stays empty.

```bash
npm run typecheck        # tsc, also checks that every French key exists
npm run lint             # eslint
npm run build            # production build + service worker
```

## Structure

```
src/
├── engine/      analysis modules, pure functions (see docs/ARCHITECTURE.md)
├── i18n/        i18next setup, locales/en/* and locales/fr/*
├── services/    runAnalysis, history and settings (IndexedDB), catalogue client
├── stores/      Zustand stores (settings, history)
├── lib/         apiClient, localDb, constants (repo URL, app version)
├── components/  layout, UI kit, language switcher
└── pages/       public pages and the /app workspace
```

## Routes

- Public: `/`, `/features`, `/how-it-works`, `/security`, `/about`
- App (no account needed): `/app`, `/app/analyze`, `/app/results/:id`,
  `/app/history`, `/app/fingerprints`, `/app/fingerprints/:id`, `/app/clean`,
  `/app/settings`

## Translations

- English (`src/i18n/locales/en/*`) is the source of truth. French files are
  typed with `typeof en`, so a missing or misspelled key is a type error.
- Components use `useTranslation()`; non-React code (engine, services) imports
  `t` from `@/i18n`.
- The language comes from the saved choice (`localStorage` key `ai.lang`), else
  from the browser. Users switch it from the header or **Settings**.
- Text analysis detects the language of the analysed content independently
  (English or French) and uses the matching stylometric profile and
  letter-frequency reference.

See [`../CONTRIBUTING.md`](../CONTRIBUTING.md#adding-a-language) to add a language.

## Storage

Everything user-related stays in the browser (IndexedDB database `ai-inspector`):
analysis results, history, settings. There is no account and no limit;
**Settings > Your data** clears the history.

## Version

The version shown in the footer and sidebar is `package.json`'s `version`,
injected at build time (`__APP_VERSION__`).

## Deploy

Static build on Netlify, configured by [`../netlify.toml`](../netlify.toml).
Set `VITE_API_URL` in the Netlify environment (it is read at build time).
