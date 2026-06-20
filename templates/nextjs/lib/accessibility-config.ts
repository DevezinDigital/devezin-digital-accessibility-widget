/**
 * lib/accessibility-config.ts
 *
 * The single per-site customization hub. Edit this file to match each site:
 * identity, which widget features to expose, and the accessibility-statement
 * copy. The widget, provider wrapper, and statement page all read from here, so
 * you rarely need to touch the components themselves.
 */

import type { FeatureFlags } from "@devezindigital/accessibility/constants";

// ─── Site identity ───────────────────────────────────────────────────────────

export const SITE = {
  /** Display name shown on the statement page. */
  name: "Your Site Name",
  /** Legal entity that operates the site. */
  legalName: "Your Company Ltd",
  /** Contact address for accessibility feedback. */
  contactEmail: "accessibility@example.com",
};

// ─── Widget configuration ────────────────────────────────────────────────────

export const A11Y_CONFIG = {
  /**
   * localStorage key for this site's preferences. Use a site-specific value so
   * preferences don't collide if two of your sites share a domain/subdomain.
   */
  storageKey: "yoursite-accessibility",

  /**
   * Which widget features to expose. Set a feature to `false` to hide its
   * control everywhere; the statement page drops its description to match.
   * Leave a feature out (or `true`) to keep it on.
   */
  features: {
    highContrast: true,
    grayscale: true,
    readableFont: true,
    textSpacing: true,
    underlineLinks: true,
    reducedMotion: true,
    fontSize: true,
  } satisfies FeatureFlags,

  /** Route of the accessibility statement page. */
  statementUrl: "/accessibility",
};

// ─── Accessibility statement copy ────────────────────────────────────────────

export const STATEMENT_CONFIG = {
  /**
   * REQUIRED before launch — ISO date (e.g. "2026-06-17"). Left empty on
   * purpose so a "[set …]" warning renders rather than shipping a stale date.
   */
  lastUpdated: "",

  /** The standard you conform to. WCAG 2.1 AA is the common legal baseline. */
  targetStandard: "WCAG 2.1 Level AA",

  /**
   * Free-form sections rendered in order on the statement page. Edit freely to
   * match the site's real practices. The "Accessibility settings" section is
   * generated from A11Y_CONFIG.features automatically, so you don't list the
   * widget controls here.
   */
  sections: [
    {
      title: "Our commitment",
      body: `${"Your Site Name"} is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards as we build new features.`,
    },
    {
      title: "Known limitations",
      body: "Accessibility is an ongoing effort. If you encounter content that isn't fully accessible, please let us know using the contact details below and we'll prioritize a fix.",
    },
  ],

  /** Assistive technologies the site is tested/designed against. */
  assistiveTech: [
    "Screen readers (NVDA, JAWS, VoiceOver, TalkBack)",
    "Screen magnification software",
    "Speech recognition software",
    "Keyboard-only navigation",
  ],
};
