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
npm run dev              # http://localhost:5173
```

No server or environment variable is needed: the app is fully static.

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
├── data/        embedded catalogue of detection methods (EN + FR)
├── services/    runAnalysis, history and settings (IndexedDB), catalogue access
├── stores/      Zustand stores (settings, history)
├── lib/         localDb, analysisStatus, constants (repo URL, app version)
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

## Catalogue

The known detection methods live in [`src/data/catalog.ts`](src/data/catalog.ts):
metadata plus English text, and an optional `fr` block with the French wording.
`localizedCatalog(lang)` returns them in the active language (English fallback).
To add or update a method, edit that file and open a pull request.

## Storage

Everything user-related stays in the browser (IndexedDB database `ai-inspector`):
analysis results, history, settings. There is no account and no limit;
**Settings > Your data** clears the history.

## Version

The version shown in the footer and sidebar is `package.json`'s `version`,
injected at build time (`__APP_VERSION__`).

## Deploy

The [`Dockerfile`](Dockerfile) builds the site and serves it with an
unprivileged nginx ([`nginx.conf`](nginx.conf)). Deployment behind Traefik and
the GitHub Actions workflow are described in
[`../deploy/README.md`](../deploy/README.md). No environment variable is needed.
