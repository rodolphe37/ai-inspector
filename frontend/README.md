# Provenance Inspector

Independent provenance analysis tool for inspecting digital content — metadata, Unicode artifacts, C2PA manifests, and known watermark patterns. **Not an AI detector.**

## Important

This is a **frontend-only demo application**. All analysis results are **mocked**. No real content analysis is performed. The interface clearly displays "Demo mode" indicators.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Architecture

```
src/
├── components/
│   ├── ui/          # Reusable UI primitives (StatusBadge, ScoreRing, Modal, etc.)
│   ├── layout/      # Layout wrappers (PublicLayout, AppLayout, PageTransition)
│   ├── dashboard/   # Dashboard-specific components
│   ├── analysis/    # Analysis-specific components
│   ├── results/     # Results page components
│   ├── fingerprints/
│   ├── charts/
│   ├── landing/
│   └── cleaning/
├── data/            # Mock JSON data
│   ├── mockAnalyses.json
│   ├── mockFingerprints.json
│   ├── mockDashboard.json
│   ├── mockResults.json
│   └── mockSettings.json
├── engine/          # Future local analysis engine (stubs)
│   ├── unicode/
│   ├── metadata/
│   ├── statistics/
│   └── fingerprints/
├── lib/             # API client
│   └── apiClient.ts
├── pages/           # Route pages
│   ├── app/         # Dashboard pages
│   └── *.tsx        # Public pages
├── services/        # Service layer (mock implementations)
│   ├── mockAnalysisApi.ts
│   ├── mockFingerprintApi.ts
│   ├── mockHistoryApi.ts
│   ├── mockSettingsApi.ts
│   └── index.ts
├── stores/          # Zustand stores
│   ├── useAnalysisStore.ts
│   ├── useSettingsStore.ts
│   └── useHistoryStore.ts
├── types/           # TypeScript type definitions
│   ├── analysis.ts
│   ├── api.ts
│   ├── c2pa.ts
│   ├── fingerprint.ts
│   ├── metadata.ts
│   ├── settings.ts
│   └── unicode.ts
├── App.tsx          # Router
├── main.tsx         # Entry point
└── index.css        # Global styles + design tokens
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Browser (SPA)                     │
│                                                       │
│  ┌──────────┐   ┌───────────┐   ┌──────────────────┐ │
│  │  Pages   │──►│  Services │──►│  Mock API Layer  │ │
│  │ (React)  │   │ (Interfaces)│   │  (TS mock data) │ │
│  └──────────┘   └───────────┘   └──────────────────┘ │
│       │              │                               │
│       ▼              ▼                               │
│  ┌──────────┐   ┌───────────┐                        │
│  │  Stores  │   │   Engine  │                        │
│  │ (Zustand)│   │  (stubs)  │                        │
│  └──────────┘   └───────────┘                        │
│                                                       │
└─────────────────────────────────────────────────────┘
                         │
                    ┌─────┴─────┐
                    │ VITE_API_URL │
                    │  present?    │
                    └─────┬─────┘
                    ┌─────┴─────┐
                    ▼           ▼
              MOCK MODE    API MODE
              (current)   (future: FastAPI)
```

## Routes

### Public
- `/` — Landing page with interactive demo
- `/features` — Feature overview
- `/how-it-works` — Pipeline explanation
- `/security` — Privacy & security principles
- `/pricing` — Pricing plans
- `/about` — About the project
- `/login` — Login page (mock)
- `/signup` — Signup page (mock)

### Application
- `/app` — Dashboard overview
- `/app/analyze` — Text/file analysis
- `/app/results/:id` — Analysis results report
- `/app/history` — Analysis history
- `/app/fingerprints` — Known fingerprints list
- `/app/fingerprints/:id` — Fingerprint detail
- `/app/clean` — Content cleaning
- `/app/settings` — Settings

### System
- `/*` — 404 page

## Mock API Layer

The service layer implements typed interfaces (`AnalysisApi`, `FingerprintApi`, `HistoryApi`, `SettingsApi`) that currently use mock implementations. The rest of the app is unaware whether it's talking to mocks or a real backend.

## Future Backend Architecture

To connect a real FastAPI backend:

1. Set `VITE_API_URL` in `.env` (e.g., `VITE_API_URL=https://api.example.com`)
2. Create `src/services/httpAnalysisApi.ts` implementing the same `AnalysisApi` interface using `apiClient`
3. Update `src/services/index.ts` to switch based on `isMockMode`:

```typescript
import { isMockMode } from '@/lib/apiClient';
import { mockAnalysisApi } from './mockAnalysisApi';
import { httpAnalysisApi } from './httpAnalysisApi';

export const analysisApi = isMockMode ? mockAnalysisApi : httpAnalysisApi;
```

No component changes required — the interface is identical.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL. If absent, app runs in **mock mode**. |

## Privacy Principles

- **Local-first**: Content analysis is designed to run in the browser
- **No LLM**: No large language model is used anywhere
- **No training**: User content is never used for training
- **No tracking**: No content tracking
- **Opt-in storage**: Server-side history storage is optional

## Limitations

- All results are simulated demo data
- No real watermark detection is performed
- No real C2PA verification is performed
- An absence of signal does not constitute proof of human origin
- A detected signal does not constitute proof of machine generation

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Recharts
- Zustand
- Zod
- Lucide React
