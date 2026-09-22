# Architecture

## Principle: everything runs in the browser

AI Inspector is a **static, local-first PWA**. There is no application server.
Every check (Unicode, metadata, C2PA, image forensics, stylometry, statistics,
fingerprint matching) runs in the browser in `frontend/src/engine`, and the
catalogue of known detection methods ships with the app (`frontend/src/data`).
Nothing about the user or their content ever leaves the device.

```mermaid
flowchart TB
    subgraph Browser["Browser (PWA)"]
        UI[Pages + i18n EN/FR] --> S[services]
        S --> E[engine]
        S --> K[data/catalog<br/>embedded, EN + FR]
        S --> DB[(IndexedDB<br/>history + settings)]
    end
    Host[nginx container<br/>behind Traefik] -. serves HTML/JS/WASM .-> Browser
```

## Source layout

```
frontend/src/
├── engine/        pure analysis modules (no React)
│   ├── index.ts        orchestrator: runs every module, builds the AnalysisResult
│   ├── c2pa.ts         official c2pa WASM: manifest + signature validation (lazy-loaded)
│   ├── metadata.ts     text metadata, EXIF / XMP / IPTC / PNG chunks (exifr)
│   ├── aiImage.ts      FFT up-sampling artifacts, noise residual, generator dimensions
│   ├── aiText.ts       prose stylometry, English and French profiles
│   ├── aiCode.ts       code stylometry
│   ├── language.ts     EN / FR detection of the analysed text, diacritic folding
│   ├── statistics.ts   χ² letter test against the detected language's reference
│   ├── unicode.ts      invisible chars, bidi controls, homoglyphs (Trojan Source)
│   ├── fingerprints.ts matches engine signals against the catalogue
│   ├── assess.ts       combines everything into one AI-origin verdict
│   ├── score.ts        provenance signal level + summary
│   └── clean.ts        Unicode / metadata stripping
├── data/catalog.ts    known detection methods, English + French text
├── i18n/              i18next setup + dictionaries (locales/en/*, locales/fr/*)
├── services/          runAnalysis, history / settings (IndexedDB), catalogue access
├── stores/            Zustand: settings, history
├── lib/               localDb (idb), analysisStatus, constants
└── pages/             public pages + /app workspace
```

## Running an analysis

1. `Analyze.tsx` calls `runAnalysis(input)` (`src/services/index.ts`).
2. `analyzeContent` runs every engine module. There are no tiers or quotas.
3. The engine signals are matched against the embedded catalogue.
4. `assess.ts` produces the verdict (`verdict`, `probability`, `confidence`
   basis, `signals[]`, `caveat`). Confidence ladder: **cryptographic** (valid
   C2PA) > **metadata** (generator tags, IPTC, watermark) > **statistical**
   (forensic estimate).
5. The result is saved in IndexedDB and `/app/results/:id` reads it back.

## Catalogue

`src/data/catalog.ts` holds each method's metadata (type, status, confidence,
target content) and its text in English, with an optional `fr` block.
`localizedCatalog(lang)` returns the entries in the requested language, falling
back to English for untranslated fields. Updating the catalogue is a normal pull
request; the next deploy ships it.

## Internationalisation

- `src/i18n/locales/en/*` is the source of truth; `fr/*` is typed against it, so
  a missing French key fails `npm run typecheck`.
- Language: saved choice (`localStorage` key `ai.lang`), else the browser
  language. `document.title`, `<html lang>` and the meta description follow it.
- The engine writes its explanatory text (basis, signal details, timeline) in
  the language active **at analysis time**; that text is stored with the result.
  Verdict labels, caveats, status badges and the catalogue are re-translated on
  display.
- The analysed text's own language is detected separately (`engine/language.ts`)
  to pick the right stylometric profile and letter-frequency reference.

## PWA and hosting

`vite-plugin-pwa` precaches the build, so the app works offline once loaded. The
site is fully static. The Docker image serves it with nginx
([`frontend/nginx.conf`](../frontend/nginx.conf)): SPA fallback, cache headers
(immutable hashed assets, no-cache service worker) and security headers. See
[`deploy/README.md`](../deploy/README.md) for the Traefik setup and the
GitHub Actions deployment.

## Checks and CI

- `npm run typecheck` (including translation completeness), `npm run lint`,
  `npm run build`.
- `.github/workflows/ci.yml` runs them on every push and pull request, and
  rejects the em dash character anywhere in the repository.
