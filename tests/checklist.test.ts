// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import {
  assertChecklist,
  runAccessibilityChecklist,
} from "../verify/checklist";

function makeContainer(html: string): HTMLElement {
  const el = document.createElement("div");
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
}

const COMPLIANT = `
  <a href="#main-content">Skip to main content</a>
  <main id="main-content">
    <img src="/logo.png" alt="Logo" />
    <button aria-label="Menu"></button>
  </main>
  <button data-accessibility-widget aria-label="Accessibility settings"></button>
`;

describe("runAccessibilityChecklist", () => {
  it("passes a compliant tree", () => {
    document.documentElement.lang = "en";
    const container = makeContainer(COMPLIANT);
    const results = runAccessibilityChecklist({ container });
    const failed = results.filter((r) => !r.passed);
    expect(failed).toEqual([]);
    expect(() => assertChecklist(results)).not.toThrow();
  });

  it("flags a missing skip link, alt text, and unnamed control", () => {
    document.documentElement.lang = "en";
    const container = makeContainer(`
      <main><img src="/x.png" /><button></button></main>
      <div data-accessibility-widget></div>
    `);
    const byId = Object.fromEntries(
      runAccessibilityChecklist({ container }).map((r) => [r.id, r.passed]),
    );
    expect(byId["skip-link"]).toBe(false);
    expect(byId["img-alt"]).toBe(false);
    expect(byId["control-names"]).toBe(false);
    expect(byId["landmark-main"]).toBe(true);
  });

  it("flags a missing document language", () => {
    document.documentElement.removeAttribute("lang");
    const container = makeContainer(COMPLIANT);
    const langCheck = runAccessibilityChecklist({
      container,
      only: ["html-lang"],
    })[0];
    expect(langCheck.passed).toBe(false);
  });
});
