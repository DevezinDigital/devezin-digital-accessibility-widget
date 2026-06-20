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

import jsxA11y from "eslint-plugin-jsx-a11y";

type FlatConfig = Record<string, unknown>;

const plugin = jsxA11y as {
  flatConfigs: { recommended: FlatConfig; strict: FlatConfig };
};

/**
 * Rules layered on top of the recommended set. Promoted to "error" so they fail
 * CI rather than producing easily-ignored warnings.
 */
export const strictRules: Record<string, unknown> = {
  "jsx-a11y/alt-text": "error",
  "jsx-a11y/anchor-has-content": "error",
  "jsx-a11y/anchor-is-valid": "error",
  "jsx-a11y/aria-props": "error",
  "jsx-a11y/aria-proptypes": "error",
  "jsx-a11y/aria-role": "error",
  "jsx-a11y/aria-unsupported-elements": "error",
  "jsx-a11y/label-has-associated-control": "error",
  "jsx-a11y/no-redundant-roles": "error",
  "jsx-a11y/role-has-required-aria-props": "error",
  "jsx-a11y/role-supports-aria-props": "error",
  "jsx-a11y/tabindex-no-positive": "error",
  // Interactive elements must be keyboard-reachable, not mouse-only.
  "jsx-a11y/click-events-have-key-events": "error",
  "jsx-a11y/no-static-element-interactions": "error",
  "jsx-a11y/no-noninteractive-element-interactions": "error",
};

/**
 * The default export: an array of flat-config objects to spread into a
 * consuming project's eslint.config.js. Scoped to JSX/TSX files.
 */
const config: FlatConfig[] = [
  {
    ...plugin.flatConfigs.recommended,
    files: ["**/*.{jsx,tsx}"],
  },
  {
    files: ["**/*.{jsx,tsx}"],
    rules: strictRules,
  },
];

export default config;
