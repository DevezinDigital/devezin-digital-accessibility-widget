'use strict';

/**
 * verify/checklist.ts — Legally-required-features checklist
 * (`@devezindigital/accessibility/verify`).
 *
 * Where the ESLint preset catches authoring defects and the axe harness catches
 * rule violations, this asserts that the *structural* accessibility features a
 * site is expected to ship are actually present in the rendered output: a skip
 * link, a document language, a `<main>` landmark, the accessibility widget,
 * image alt text, accessible control names, and no positive tabindex.
 *
 * It runs against a rendered DOM (jsdom in a test, or the live document), so it
 * complements — rather than duplicates — the static lint pass.
 *
 * Usage (in a test, after rendering your layout/page):
 *
 *     import { runAccessibilityChecklist, assertChecklist } from
 *       "@devezindigital/accessibility/verify";
 *
 *     const { container } = render(<RootLayout><Home /></RootLayout>);
 *     assertChecklist(runAccessibilityChecklist({ container }));
 */
/** Every check the runner knows about, with the criterion it enforces. */
const REQUIRED_CHECKS = [
    {
        id: "html-lang",
        label: "Document has a language",
        wcag: "3.1.1 Language of Page",
    },
    {
        id: "skip-link",
        label: "Skip-to-content link present",
        wcag: "2.4.1 Bypass Blocks",
    },
    {
        id: "landmark-main",
        label: "<main> landmark present",
        wcag: "1.3.1 Info and Relationships",
    },
    {
        id: "widget-mounted",
        label: "Accessibility widget mounted",
        wcag: "Good practice",
    },
    {
        id: "img-alt",
        label: "All <img> have an alt attribute",
        wcag: "1.1.1 Non-text Content",
    },
    {
        id: "control-names",
        label: "Buttons/links have accessible names",
        wcag: "4.1.2 Name, Role, Value",
    },
    {
        id: "no-positive-tabindex",
        label: "No positive tabindex",
        wcag: "2.4.3 Focus Order",
    },
];
function accessibleName(el) {
    const aria = el.getAttribute("aria-label");
    if (aria && aria.trim())
        return aria.trim();
    if (el.getAttribute("aria-labelledby"))
        return "labelledby";
    if (el.getAttribute("title"))
        return "title";
    const text = (el.textContent ?? "").trim();
    if (text)
        return text;
    // An <img> with alt inside the control supplies the name.
    const img = el.querySelector("img[alt]");
    if (img && (img.getAttribute("alt") ?? "").trim())
        return "img-alt";
    return "";
}
const CHECKS = {
    "html-lang": ({ documentElement }) => {
        const lang = documentElement?.getAttribute("lang")?.trim() ?? "";
        return {
            passed: lang.length > 0,
            detail: lang ? `lang="${lang}"` : "no lang attribute on <html>",
        };
    },
    "skip-link": ({ container }) => {
        const anchors = Array.from(container.querySelectorAll('a[href^="#"]'));
        const skip = anchors.find((a) => /skip/i.test(a.textContent ?? ""));
        return {
            passed: Boolean(skip),
            detail: skip
                ? `found "${(skip.textContent ?? "").trim()}"`
                : "no in-page anchor whose text mentions 'skip'",
        };
    },
    "landmark-main": ({ container }) => {
        const main = container.querySelector('main, [role="main"]');
        return {
            passed: Boolean(main),
            detail: main ? "ok" : "no <main> or role=main",
        };
    },
    "widget-mounted": ({ container }) => {
        const widget = container.querySelector('[data-accessibility-widget], [aria-label*="ccessibility" i]');
        return {
            passed: Boolean(widget),
            detail: widget
                ? "ok"
                : "no [data-accessibility-widget] or accessibility-labelled control",
        };
    },
    "img-alt": ({ container }) => {
        const imgs = Array.from(container.querySelectorAll("img"));
        const missing = imgs.filter((img) => !img.hasAttribute("alt"));
        return {
            passed: missing.length === 0,
            detail: missing.length === 0
                ? `${imgs.length} img(s) ok`
                : `${missing.length} img(s) missing alt`,
        };
    },
    "control-names": ({ container }) => {
        const controls = Array.from(container.querySelectorAll('button, a[href], [role="button"]'));
        const unnamed = controls.filter((c) => accessibleName(c) === "");
        return {
            passed: unnamed.length === 0,
            detail: unnamed.length === 0
                ? `${controls.length} control(s) ok`
                : `${unnamed.length} control(s) without an accessible name`,
        };
    },
    "no-positive-tabindex": ({ container }) => {
        const positive = Array.from(container.querySelectorAll("[tabindex]")).filter((el) => Number(el.getAttribute("tabindex")) > 0);
        return {
            passed: positive.length === 0,
            detail: positive.length === 0
                ? "ok"
                : `${positive.length} element(s) with positive tabindex`,
        };
    },
};
/** Runs the checklist and returns a result row per check. */
function runAccessibilityChecklist(input) {
    const documentElement = input.documentElement ??
        input.container.ownerDocument?.documentElement ??
        null;
    const ids = input.only ?? REQUIRED_CHECKS.map((c) => c.id);
    return REQUIRED_CHECKS.filter((c) => ids.includes(c.id)).map((meta) => {
        const { passed, detail } = CHECKS[meta.id]({
            container: input.container,
            documentElement,
        });
        return { ...meta, passed, detail };
    });
}
/** Formats a result set as a readable report (✓/✗ per row). */
function formatChecklist(results) {
    return results
        .map((r) => `${r.passed ? "✓" : "✗"} ${r.label} [${r.wcag}] — ${r.detail}`)
        .join("\n");
}
/** Throws with a formatted report if any required check failed. */
function assertChecklist(results) {
    const failed = results.filter((r) => !r.passed);
    if (failed.length > 0) {
        throw new Error(`Accessibility checklist failed (${failed.length}/${results.length}):\n` +
            formatChecklist(results));
    }
}

exports.REQUIRED_CHECKS = REQUIRED_CHECKS;
exports.assertChecklist = assertChecklist;
exports.formatChecklist = formatChecklist;
exports.runAccessibilityChecklist = runAccessibilityChecklist;
