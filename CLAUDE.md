# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@devezindigital/accessibility` — a dependency-free accessibility toolkit published as a GitHub-installed npm package (`github:DevezinDigital/devezin-digital-accessibility-widget`). It ships three things to consuming Next.js sites:

1. A compiled **core** (provider + hooks + constants) imported from the package.
2. Editable **templates** scaffolded into each site via `npx accessibility-init` (full per-site control of styling/copy).
3. A **verification stack** (ESLint preset + axe harness + checklist runner + GitHub Action) so a11y features can't silently regress.

There is no backend or database — preferences live in `localStorage`. The package is purely client + build-time tooling.

## Commands

```bash
npm run build      # rollup → dist/ (5 entries, see below)
npm run dev        # rollup watch
npm run typecheck  # tsc --noEmit
npm test           # vitest run
npm run lint       # eslint .
npm run format     # prettier --write .
```

Run a single test: `npx vitest run tests/checklist.test.ts` (or `npx vitest -t "<name>"` to filter by test name).

## Critical: `dist/` is committed

The package installs directly from GitHub, so the built `dist/` is checked into git, not gitignored. **After any source change you must run `npm run build` and commit the regenerated `dist/`.** CI (`.github/workflows/ci.yml`) runs lint → typecheck → test → build and then fails if `git diff` shows `dist/` differs from a fresh build. A stale `dist/` is the most common way to break this repo.

## Multi-entry build architecture

`rollup.config.js` emits **five separate entry points**, each with its own client/server boundary. This separation is the central design constraint — respect which entry a given source file feeds:

| Source                                              | Entry        | Boundary                | Notes                                                                     |
| --------------------------------------------------- | ------------ | ----------------------- | ------------------------------------------------------------------------- |
| `index.ts`                                          | `.`          | `"use client"` banner   | Provider, hooks, opener. Only this entry gets the banner.                 |
| `constants.ts` → `types/accessibility-constants.ts` | `/constants` | server-safe (no banner) | Imported by Server Components — must never import React or touch the DOM. |
| `eslint.ts`                                         | `/eslint`    | Node tooling            | Ships both a default export (config array) and a named `strictRules`.     |
| `test.ts`                                           | `/test`      | test tooling            | axe-core harness.                                                         |
| `verify.ts` → `verify/checklist.ts`                 | `/verify`    | test tooling            | DOM checklist runner.                                                     |

`eslint-plugin-jsx-a11y`, `axe-core`, and `@testing-library/react` are **optional peer dependencies**, marked `external` in rollup so they're never bundled. Only `/eslint`, `/test`, `/verify` need them.

## Source of truth: `types/accessibility-constants.ts`

All feature definitions live here — `FeatureId` union, `FEATURE_META` (label, description, `htmlClass`, optional `followsOS`), `FEATURE_ORDER`, font-size bounds. Both the client provider and the server-safe `/constants` entry read from it. **To add or change a feature, edit this file first**; the provider, widget template, and statement page all derive from `FEATURE_META`/`FEATURE_ORDER`.

Key mechanics:

- The provider reflects preferences onto `<html>` as classes (`high-contrast`, `reduce-motion`, etc., from each feature's `htmlClass`) plus a root `font-size`; `accessibility.css` in the templates picks them up.
- `highContrast` and `reducedMotion` follow OS media queries (`prefers-contrast: more`, `prefers-reduced-motion: reduce`) until the user makes an explicit choice. Stored as `boolean | null` where `null` = "follow OS" and is deliberately **not** persisted, so the OS setting keeps applying.
- A site disables a feature by setting its flag `false` in `A11Y_CONFIG.features`; an omitted/`true` flag stays on (back-compat friendly). A disabled feature drops from the widget, persistence, and statement page with no component edits.
- `A11Y_VERSION` ("1.0") gates stored prefs — bump it when a stored field's meaning changes and every visitor's saved prefs are ignored on next visit.

## Templates (`templates/nextjs/`)

`bin/index.js` (`accessibility-init`) recursively copies these into a consuming project, **skipping any file that already exists** (never overwrites, so re-runs preserve customizations). `lib/accessibility-config.ts` is the per-site hub (site identity, `storageKey`, feature flags, statement copy). The widget markup is plain HTML meant to be restyled via CSS variables in `accessibility.css` or edited directly.

## Verification layers (what each catches)

- **`/eslint`** — author-time static defects (missing alt, mislabelled controls, ARIA typos, positive tabindex, mouse-only handlers). `strictRules` promotes these to `error`.
- **`/test`** — axe-core WCAG 2.0/2.1/2.2 A+AA rule violations on rendered components. Color-contrast is **off by default** (jsdom can't paint); enable only in a real browser. `installMatchMediaMock` is required before rendering the provider under jsdom.
- **`/verify`** — structural/legally-relevant presence checks against rendered DOM (document lang, skip link, `<main>`, widget mounted, img alt, control names, no positive tabindex). Complements the static lint pass.

The `github-action/` composite action runs a consuming repo's `lint` + `test` scripts in CI.
