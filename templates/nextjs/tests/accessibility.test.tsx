// @vitest-environment jsdom
//
// Sample accessibility regression test, scaffolded by @devezindigital/accessibility.
// Combines two of the package's verification layers:
//   1. axe-core smoke tests over the widget, skip link, and statement page.
//   2. the structural checklist (skip link, <main>, widget, alt text, names…).
//
// Requires devDependencies: vitest, jsdom, axe-core, @testing-library/react.
// Color contrast is excluded (jsdom can't paint) — enforce it via your design
// tokens or a live audit.

import { afterEach, beforeAll, describe, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import {
  expectNoA11yViolations,
  installMatchMediaMock,
} from "@devezindigital/accessibility/test";
import {
  assertChecklist,
  runAccessibilityChecklist,
} from "@devezindigital/accessibility/verify";

import { AccessibilityProviderWrapper } from "@/components/a11y/AccessibilityProviderWrapper";
import { AccessibilityWidget } from "@/components/a11y/AccessibilityWidget";
import { SkipLink } from "@/components/a11y/SkipLink";
import AccessibilityPage from "@/app/accessibility/page";

beforeAll(installMatchMediaMock);
afterEach(cleanup);

describe("accessibility — axe smoke tests", () => {
  it("widget has no violations", async () => {
    await expectNoA11yViolations(
      <AccessibilityProviderWrapper>
        <AccessibilityWidget />
      </AccessibilityProviderWrapper>,
    );
  });

  it("skip link has no violations", async () => {
    await expectNoA11yViolations(<SkipLink />);
  });

  it("statement page has no violations", async () => {
    await expectNoA11yViolations(<AccessibilityPage />);
  });
});

describe("accessibility — structural checklist", () => {
  it("the shared chrome ships the required features", () => {
    document.documentElement.lang = "en";
    const { container } = render(
      <AccessibilityProviderWrapper>
        <SkipLink />
        <main id="main-content">
          <h1>Home</h1>
        </main>
        <AccessibilityWidget />
      </AccessibilityProviderWrapper>,
    );
    assertChecklist(runAccessibilityChecklist({ container }));
  });
});
