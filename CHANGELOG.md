# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-06-20

### Added

- Floating **accessibility widget** (high contrast, grayscale, readable font,
  text spacing, underline links, reduce motion, text size) backed by a
  `localStorage` provider that respects OS `prefers-reduced-motion` /
  `prefers-contrast`.
- Scaffolded **accessibility statement page** that stays in sync with the
  enabled widget features.
- **Verification stack**: a shareable `eslint-plugin-jsx-a11y` preset
  (`/eslint`), an axe-core test harness (`/test`), and a structural checklist
  runner (`/verify`).
- Composite **GitHub Action** (`github-action/`) to run the verification stack
  in a consuming repo's CI.
- `accessibility-init` CLI to scaffold editable templates into a consuming
  Next.js site.
- Server-safe `/constants` entry for importing feature metadata into Server
  Components without the client tax.

[Unreleased]: https://github.com/DevezinDigital/devezin-digital-accessibility-widget/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/DevezinDigital/devezin-digital-accessibility-widget/releases/tag/v1.0.0
