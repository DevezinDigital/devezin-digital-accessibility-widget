# Contributing

Thanks for your interest in improving `@devezindigital/accessibility`. This
guide covers the local workflow and the conventions CI enforces.

## Prerequisites

- Node.js **>= 19** (CI runs on Node 20)
- npm

## Setup

```bash
git clone https://github.com/DevezinDigital/devezin-digital-accessibility-widget.git
cd devezin-digital-accessibility-widget
npm install
```

## Workflow

```bash
npm run build       # rollup → dist/ (5 entries)
npm run dev         # rollup watch
npm run typecheck   # tsc --noEmit
npm test            # vitest run
npm run lint        # eslint .
npm run format      # prettier --write .
npm run format:check
```

Run a single test file: `npx vitest run tests/checklist.test.ts`
(or `npx vitest -t "<name>"` to filter by test name).

## Important: `dist/` is committed

This package installs directly from GitHub, so the built `dist/` is checked into
git (it is **not** gitignored). **After any source change you must run
`npm run build` and commit the regenerated `dist/`.** CI rebuilds from source and
fails if the committed `dist/` differs from a fresh build — a stale `dist/` is the
most common way to break the repo.

## Where to make changes

Feature definitions are the source of truth in
`types/accessibility-constants.ts` (`FeatureId`, `FEATURE_META`,
`FEATURE_ORDER`, font-size bounds). To add or change a feature, edit that file
first; the provider, widget template, and statement page all derive from it.

The editable per-site scaffold lives in `templates/nextjs/` and is copied into
consuming sites by `accessibility-init` (existing files are never overwritten).

## Pull requests

Before opening a PR, make sure the full local pipeline is green:

```bash
npm run format:check && npm run lint && npm run typecheck && npm test && npm run build
```

Then confirm `git status` shows no unexpected `dist/` drift. Keep PRs focused,
describe the change and its rationale, and include tests for behavioral changes.

## Reporting security issues

Do not open public issues for vulnerabilities — see [SECURITY.md](./SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the
[Apache License 2.0](./LICENSE).
