/**
 * eslint.ts — Shareable accessibility lint preset
 * (`@devezindigital/accessibility/eslint`).
 *
 * Wraps eslint-plugin-jsx-a11y's recommended flat config and tightens a few
 * rules that catch the most common legally-relevant defects at author time:
 * missing alt text, mislabelled controls, ARIA typos, positive tabindex, etc.
 *
 * Usage (consuming site, eslint.config.js — flat config):
 *
 *     import a11y from "@devezindigital/accessibility/eslint";
 *     export default [
 *       // ...your config
 *       ...a11y,
 *     ];
 *
 * Requires `eslint-plugin-jsx-a11y` to be installed in the consuming project
 * (it's a peer dependency).
 */
type FlatConfig = Record<string, unknown>;
/**
 * Rules layered on top of the recommended set. Promoted to "error" so they fail
 * CI rather than producing easily-ignored warnings.
 */
export declare const strictRules: Record<string, unknown>;
/**
 * The default export: an array of flat-config objects to spread into a
 * consuming project's eslint.config.js. Scoped to JSX/TSX files.
 */
declare const config: FlatConfig[];
export default config;
