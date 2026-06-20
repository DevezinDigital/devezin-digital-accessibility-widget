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
export type ChecklistId = "html-lang" | "skip-link" | "landmark-main" | "widget-mounted" | "img-alt" | "control-names" | "no-positive-tabindex";
export interface ChecklistItem {
    id: ChecklistId;
    label: string;
    /** WCAG success criterion this maps to, for the report. */
    wcag: string;
    passed: boolean;
    detail: string;
}
export interface ChecklistInput {
    /** The rendered subtree to inspect (e.g. Testing Library's `container`). */
    container: ParentNode & Element;
    /**
     * The document/root element used for document-level checks (lang). Defaults
     * to the container's owner document element when available.
     */
    documentElement?: Element | null;
    /** Restrict the run to a subset of checks. Defaults to all required ones. */
    only?: ChecklistId[];
}
/** Every check the runner knows about, with the criterion it enforces. */
export declare const REQUIRED_CHECKS: {
    id: ChecklistId;
    label: string;
    wcag: string;
}[];
/** Runs the checklist and returns a result row per check. */
export declare function runAccessibilityChecklist(input: ChecklistInput): ChecklistItem[];
/** Formats a result set as a readable report (✓/✗ per row). */
export declare function formatChecklist(results: ChecklistItem[]): string;
/** Throws with a formatted report if any required check failed. */
export declare function assertChecklist(results: ChecklistItem[]): void;
