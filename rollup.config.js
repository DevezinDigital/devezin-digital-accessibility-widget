import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

// "use client" is added ONLY to the main (React) entry so Next.js consumers
// treat the provider/hooks as a client component. The other entries stay
// server-/node-safe (no banner): /constants is imported by Server Components,
// and /eslint, /test, /verify are dev-time tooling run in Node.
const USE_CLIENT_BANNER = `"use client";`;

// Fresh plugin instances per build — the typescript plugin is stateful and
// cannot be shared across config objects in the same array.
const makePlugins = () => [
  peerDepsExternal(),
  resolve(),
  commonjs(),
  typescript({
    tsconfig: "./tsconfig.json",
    declaration: true,
    declarationDir: "dist",
  }),
];

// Tooling deps are peer (often dev-only) — never bundle them into dist.
const external = [
  "eslint-plugin-jsx-a11y",
  "axe-core",
  "@testing-library/react",
];

// The /eslint entry intentionally ships a default export (the config array) and
// a named one (strictRules); silence rollup's mixed-exports note for it.
const onwarn = (warning, warn) => {
  if (warning.code === "MIXED_EXPORTS") return;
  warn(warning);
};

// Helper for the no-banner entries (constants/eslint/test/verify).
const plainEntry = (name) => ({
  input: `${name}.ts`,
  output: [
    { file: `dist/${name}.js`, format: "cjs" },
    { file: `dist/${name}.esm.js`, format: "esm" },
  ],
  plugins: makePlugins(),
  external,
  onwarn,
});

export default [
  // ── Main entry (provider, hooks, client surface) ──
  {
    input: "index.ts",
    output: [
      { file: "dist/index.js", format: "cjs", banner: USE_CLIENT_BANNER },
      { file: "dist/index.esm.js", format: "esm", banner: USE_CLIENT_BANNER },
    ],
    plugins: makePlugins(),
    external,
  },
  // ── Server-safe constants/types/metadata ──
  plainEntry("constants"),
  // ── Shareable ESLint preset ──
  plainEntry("eslint"),
  // ── Axe test harness ──
  plainEntry("test"),
  // ── Checklist runner ──
  plainEntry("verify"),
];
