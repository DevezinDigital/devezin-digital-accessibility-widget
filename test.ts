/**
 * test.ts — Axe-core test harness (`@devezindigital/accessibility/test`).
 *
 * A thin, runner-agnostic wrapper over axe-core + @testing-library/react for
 * asserting WCAG 2.x conformance on rendered components/pages. Modeled on the
 * smoke tests shipped on WIPit.
 *
 * Color contrast is excluded by default: jsdom doesn't paint, so axe can't
 * measure it. Enforce contrast via your design tokens / a live audit instead.
 *
 * Requires `axe-core` and `@testing-library/react` in the consuming project
 * (peer dependencies), run under a jsdom-like environment.
 *
 * Usage:
 *
 *     import { expectNoA11yViolations, installMatchMediaMock } from
 *       "@devezindigital/accessibility/test";
 *
 *     beforeAll(installMatchMediaMock);
 *
 *     it("home page has no a11y violations", async () => {
 *       await expectNoA11yViolations(<Home />);
 *     });
 */

import axe from "axe-core";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";

/** WCAG tag sets axe runs against by default (A + AA across 2.0/2.1/2.2). */
export const DEFAULT_WCAG_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
];

export interface A11yRunOptions {
  /** Override the WCAG tag set. */
  tags?: string[];
  /** Enable the color-contrast rule (off by default — jsdom can't paint). */
  contrast?: boolean;
  /** Extra axe rule overrides, merged last. */
  rules?: Record<string, { enabled: boolean }>;
}

function buildRunConfig(options: A11yRunOptions = {}): axe.RunOptions {
  return {
    runOnly: { type: "tag", values: options.tags ?? DEFAULT_WCAG_TAGS },
    rules: {
      "color-contrast": { enabled: options.contrast ?? false },
      ...options.rules,
    },
  };
}

/**
 * Renders `ui` and returns axe violations as readable strings (empty array =
 * clean). Useful when you want to assert with your own matcher.
 */
export async function getA11yViolations(
  ui: ReactElement,
  options?: A11yRunOptions,
): Promise<string[]> {
  const { container } = render(ui);
  const results = await axe.run(container, buildRunConfig(options));
  return results.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.length} node(s))`,
  );
}

/**
 * Renders `ui` and throws if axe finds any violations. Framework-agnostic — the
 * thrown Error lists every violation, so it reads well in any test runner.
 */
export async function expectNoA11yViolations(
  ui: ReactElement,
  options?: A11yRunOptions,
): Promise<void> {
  const violations = await getA11yViolations(ui, options);
  if (violations.length > 0) {
    throw new Error(
      `Expected no accessibility violations but found ${violations.length}:\n` +
        violations.map((v) => `  • ${v}`).join("\n"),
    );
  }
}

/**
 * Installs a no-op `window.matchMedia` for jsdom, which doesn't implement it.
 * The AccessibilityProvider queries matchMedia on mount, so tests that render
 * it must call this first (e.g. in `beforeAll`).
 */
export function installMatchMediaMock(matches = false): void {
  if (typeof window === "undefined") return;
  window.matchMedia = (query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
