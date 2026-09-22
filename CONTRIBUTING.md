# Contributing to AI Inspector

Thanks for your interest in improving AI Inspector! This guide explains how to
set up the project, the rules the codebase follows, and how to get a change merged.

By participating you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

- **Report a bug** or **suggest a feature** through the issue templates.
- **Improve detection**: new signals, better calibration, new catalogue entries
  (`frontend/src/data/catalog.ts`, English text plus a `fr` block).
- **Translate**: the interface ships in English and French; more languages are welcome.
- **Improve the docs**, examples and tests.

For security issues, do **not** open a public issue: see [`SECURITY.md`](SECURITY.md).

## Development setup

Requirement: Node.js 22+.

```bash
cd frontend
npm install
npm run dev           # http://localhost:5173
```

## Before opening a pull request

Every check below must pass (CI runs the same ones):

```bash
cd frontend && npm run typecheck && npm run lint && npm run build
```

## Ground rules

1. **Everything stays in the browser.** There is no server. Do not add code that
   sends content, results or usage data anywhere; this is the core privacy promise.
2. **Never present an estimate as proof.** Only a valid C2PA manifest is
   authoritative. Statistical verdicts must keep their caveats
   (`frontend/src/engine/assess.ts` and the UI copy).
3. **No accounts, no plans, no quotas.** The app is free and static.
4. **Every user-facing string is translated.** Add the key to
   `frontend/src/i18n/locales/en/*` and its French counterpart in
   `frontend/src/i18n/locales/fr/*`. The French files are typed against the
   English ones, so `npm run typecheck` fails if a key is missing.
5. **Typography:** do not use the em dash character (U+2014) anywhere
   (code, UI copy, docs). CI rejects it. Use a comma, a colon or parentheses.
6. Keep changes focused. Match the style of the surrounding code.

## Adding a language

1. Copy `frontend/src/i18n/locales/fr/` to a new folder (for example `de/`) and
   translate every file. Keep the `typeof en` annotations.
2. Create `frontend/src/i18n/locales/de.ts` mirroring `fr.ts`.
3. Register it in `frontend/src/i18n/index.ts` (`LANGUAGES`, `resources`,
   `supportedLngs`, detection).
4. Add the catalogue wording for the new language in
   `frontend/src/data/catalog.ts` and handle it in `localizedCatalog`.

Stylometric heuristics are language-specific (`frontend/src/engine/aiText.ts`,
`statistics.ts`, `language.ts`). A new UI language does not automatically get
calibrated text detection; say so in your PR if you do not add it.

## Commit messages

- Imperative mood, short subject line (`Add German catalogue translations`).
- Explain the *why* in the body when it is not obvious.

## Pull request process

1. Fork, create a branch from `main`, commit, push.
2. Open a PR using the template; link the related issue.
3. A maintainer reviews it. Please keep the PR up to date with `main`.

Thank you!
