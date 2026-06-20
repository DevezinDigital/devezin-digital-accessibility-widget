# Integration guide

How a consuming Next.js site wires up `@devezindigital/accessibility`. For the API surface and rationale, see the README.

## 1. Install

```bash
npm install github:DevezinDigital/devezin-digital-accessibility-widget
npm install -D eslint-plugin-jsx-a11y axe-core @testing-library/react jsdom vitest
```

## 2. Scaffold

```bash
npx accessibility-init
```

## 3. Mount

In `app/layout.tsx` (see README for the full snippet):

- import `styles/accessibility.css`,
- wrap the tree in `<AccessibilityProviderWrapper>`,
- render `<SkipLink />` first, `<AccessibilityWidget />` last,
- set `<html lang="...">` and `id="main-content"` on each page's `<main>`.

## 4. Configure (`lib/accessibility-config.ts`)

| Field                                      | Purpose                                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `SITE.name` / `legalName` / `contactEmail` | Identity + statement-page copy.                                                           |
| `A11Y_CONFIG.storageKey`                   | Per-site `localStorage` key.                                                              |
| `A11Y_CONFIG.features`                     | Which widget controls to expose. `false` removes a control and its statement description. |
| `A11Y_CONFIG.statementUrl`                 | Route of the statement page (default `/accessibility`).                                   |
| `STATEMENT_CONFIG.lastUpdated`             | **Required before launch** — ISO date. Renders a `[set …]` warning until set.             |
| `STATEMENT_CONFIG.sections`                | Free-form statement sections.                                                             |
| `STATEMENT_CONFIG.assistiveTech`           | Supported AT list.                                                                        |

## 5. Theme (`styles/accessibility.css`)

Override the `--a11y-*` custom properties to match the site. For deep high-contrast support, override `html.high-contrast` with your design tokens (the file shows how).

### Readable font (optional but recommended)

Point `--a11y-readable-font` at a loaded high-legibility face. With `next/font`:

```tsx
// app/layout.tsx
import { Atkinson_Hyperlegible } from "next/font/google";

const readable = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-readable",
});
```

```css
/* accessibility.css */
:root {
  --a11y-readable-font: var(--font-readable), Verdana, system-ui, sans-serif;
}
```

## 6. Add the checks

**ESLint** — spread the preset into `eslint.config.js`:

```js
import a11y from "@devezindigital/accessibility/eslint";

export default [
  // ...your config
  ...a11y,
];
```

**Tests** — the scaffolded `tests/accessibility.test.tsx` already wires axe + the checklist. Add a `vitest` setup with the `jsdom` environment if you don't have one. Extend it to cover your real pages:

```tsx
import { expectNoA11yViolations } from "@devezindigital/accessibility/test";

it("about page", async () => {
  await expectNoA11yViolations(<AboutPage />);
});
```

**CI** — add the composite action (README §4) or call your `lint`/`test` scripts directly.

## Opening the widget from elsewhere

The widget registers a module-level opener, so a footer "Accessibility" link can open it:

```tsx
"use client";
import { openAccessibilityMenu } from "@devezindigital/accessibility";

<button onClick={openAccessibilityMenu}>Accessibility settings</button>;
// or, outside React: window.openAccessibilityMenu?.()
```

## Re-consent / resetting preferences

Bumping `A11Y_VERSION` in the package invalidates everyone's stored preferences on their next visit (the provider ignores prefs saved under an older version). Useful if the meaning of a stored field changes.
