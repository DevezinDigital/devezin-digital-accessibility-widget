# @devezindigital/accessibility

[![CI](https://github.com/DevezinDigital/devezin-digital-accessibility-widget/actions/workflows/ci.yml/badge.svg)](https://github.com/DevezinDigital/devezin-digital-accessibility-widget/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG-2.2%20AA-success.svg)](https://www.w3.org/WAI/WCAG22/quickref/)

A reusable, **dependency-free** accessibility toolkit for Next.js sites:

1. A floating **accessibility widget** (high contrast, grayscale, readable font, text spacing, underline links, reduce motion, text size) backed by a localStorage provider that also respects OS `prefers-reduced-motion` / `prefers-contrast`.
2. A scaffolded **accessibility statement page** that stays in sync with the widget features you enable.
3. An **accessibility verification stack** so legally-required and good-practice features can't silently regress:
   - a shareable **ESLint preset** (`eslint-plugin-jsx-a11y`, tightened),
   - an **axe-core test harness**, and
   - a structural **checklist runner** (skip link, `<main>`, document language, alt text, accessible names, no positive tabindex…),
   - plus a composite **GitHub Action** to run them in CI.

It follows the same shape as `@devezindigital/cookie-consent`: a compiled core (provider + hooks) installed from the package, and editable **templates** scaffolded into each site for full per-site styling and copy control.

## Why no database

Accessibility preferences are user-local — they live in `localStorage`. There is no backend, no API, and nothing to log. The package is purely client + build-time tooling.

## Install

```bash
npm install github:DevezinDigital/devezin-digital-accessibility-widget
# peer deps you'll want for the verification stack:
npm install -D eslint-plugin-jsx-a11y axe-core @testing-library/react jsdom vitest
```

`react` / `react-dom` are peer dependencies. The tooling deps above are **optional** peers — only needed for the `/eslint`, `/test`, and `/verify` entries.

## Scaffold a site

```bash
npx accessibility-init
```

Copies these into your project (existing files are skipped, never overwritten):

```
lib/accessibility-config.ts              # the per-site customization hub
components/a11y/AccessibilityProviderWrapper.tsx
components/a11y/AccessibilityWidget.tsx  # native HTML, yours to restyle
components/a11y/SkipLink.tsx
styles/accessibility.css                 # preference classes + themeable widget
app/accessibility/page.tsx               # statement page
tests/accessibility.test.tsx             # sample axe + checklist test
```

Then wire it up in `app/layout.tsx`:

```tsx
import "@/styles/accessibility.css";
import { AccessibilityProviderWrapper } from "@/components/a11y/AccessibilityProviderWrapper";
import { AccessibilityWidget } from "@/components/a11y/AccessibilityWidget";
import { SkipLink } from "@/components/a11y/SkipLink";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AccessibilityProviderWrapper>
          <SkipLink />
          {children}
          <AccessibilityWidget />
        </AccessibilityProviderWrapper>
      </body>
    </html>
  );
}
```

Give each page's `<main>` an `id="main-content"` so the skip link lands. That's it — the widget appears bottom-left on every page.

## Customize per site

Everything site-specific lives in **`lib/accessibility-config.ts`**:

- `SITE` — name, legal entity, contact email.
- `A11Y_CONFIG.storageKey` — a site-specific localStorage key.
- `A11Y_CONFIG.features` — flip any feature to `false` to drop its control **and** its statement-page description.
- `STATEMENT_CONFIG` — `lastUpdated`, target standard, free-form sections, assistive-tech list.

**Styling** is via CSS variables in `styles/accessibility.css` (`--a11y-accent`, `--a11y-panel-bg`, `--a11y-radius`, …). Override them in your global CSS or scope them to the widget; no component edits needed. The widget markup is plain HTML, so you can also edit the copied `.tsx` directly for structural changes.

> **High contrast:** the default is a generic `contrast()` boost so it works on any site. For true WCAG AAA, override `html.high-contrast` with your design system's high-contrast token values (see the comments in `accessibility.css`).

## Verification stack

### 1. ESLint preset (`/eslint`)

```js
// eslint.config.js (flat config)
import a11y from "@devezindigital/accessibility/eslint";

export default [
  // ...your config
  ...a11y,
];
```

Catches missing alt text, mislabelled controls, ARIA typos, positive tabindex, mouse-only interactions, and more — at author time.

### 2. Axe test harness (`/test`)

```tsx
import {
  expectNoA11yViolations,
  installMatchMediaMock,
} from "@devezindigital/accessibility/test";

beforeAll(installMatchMediaMock);

it("home page has no a11y violations", async () => {
  await expectNoA11yViolations(<Home />);
});
```

Runs WCAG 2.0/2.1/2.2 A + AA rules. Color contrast is off by default (jsdom can't paint); pass `{ contrast: true }` only in a real-browser environment.

### 3. Checklist runner (`/verify`)

```tsx
import {
  runAccessibilityChecklist,
  assertChecklist,
} from "@devezindigital/accessibility/verify";

const { container } = render(
  <RootLayout>
    <Home />
  </RootLayout>,
);
assertChecklist(runAccessibilityChecklist({ container }));
```

Asserts the structural, legally-relevant features are present: document language, skip link, `<main>` landmark, the widget itself, image alt text, accessible control names, and no positive tabindex.

`npx accessibility-init` scaffolds `tests/accessibility.test.tsx` wiring layers 2 and 3 together.

### 4. GitHub Action

A composite action lives in `github-action/`. From a consuming repo:

```yaml
# .github/workflows/a11y.yml
jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: DevezinDigital/devezin-digital-accessibility-widget/github-action@main
```

It runs your `lint` (with the jsx-a11y preset) and `test` (axe + checklist) scripts. Inputs let you override the working directory, Node version, and commands.

## Server vs client imports

The main entry is a client component (`"use client"`). Server Components should import inert data from the server-safe entry:

```tsx
import {
  FEATURE_META,
  enabledFeatures,
} from "@devezindigital/accessibility/constants";
```

## Package entries

| Entry        | Use                                    | Client boundary |
| ------------ | -------------------------------------- | --------------- |
| `.`          | `AccessibilityProvider`, hooks, opener | `"use client"`  |
| `/constants` | types, constants, feature metadata     | server-safe     |
| `/eslint`    | shareable jsx-a11y flat config         | build tooling   |
| `/test`      | axe-core harness                       | test tooling    |
| `/verify`    | structural checklist runner            | test tooling    |

## Development

```bash
npm run build      # rollup → dist/ (5 entries)
npm run typecheck  # tsc --noEmit
npm test           # vitest
npm run lint       # eslint .
npm run format     # prettier --write .
```

CI runs lint + typecheck + test + build and fails if the committed `dist/` is stale (the package installs from GitHub, so `dist/` is committed). Run `npm run build` and commit `dist/` with any source change.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the build/test workflow and PR
conventions. Security issues: please follow [SECURITY.md](./SECURITY.md) rather
than opening a public issue.

## License

[Apache-2.0](./LICENSE) © Devezin Digital
