/**
 * types/accessibility-constants.ts — Canonical source of truth.
 *
 * Holds the shared types, storage keys, feature metadata, and presets used by
 * both the React provider (client) and the server-safe `/constants` entry.
 * Nothing in here imports React or touches the DOM, so it is safe to pull into
 * a Server Component.
 */

/**
 * Bumping this string invalidates every visitor's stored preferences on their
 * next visit (the provider ignores stored prefs written under an older
 * version). Use it when the meaning of a stored field changes.
 */
export const A11Y_VERSION = "1.0";

/** Default localStorage key. Override per-site via the provider config. */
export const DEFAULT_STORAGE_KEY = "a11y-preferences";

// ─── Font-size bounds (px) ───────────────────────────────────────────────────

export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 24;
export const FONT_SIZE_DEFAULT = 16;
export const FONT_SIZE_STEP = 2;

export function clampFontSize(value: number): number {
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, value));
}

// ─── Feature identifiers ─────────────────────────────────────────────────────

/** Features rendered as an on/off switch. */
export type ToggleFeatureId =
  | "highContrast"
  | "grayscale"
  | "readableFont"
  | "textSpacing"
  | "underlineLinks"
  | "reducedMotion";

/** All widget features (the toggles plus the font-size stepper). */
export type FeatureId = ToggleFeatureId | "fontSize";

/**
 * Resolved preferences a consumer reads from `useAccessibility()`. The
 * OS-following preferences (highContrast, reducedMotion) are already resolved
 * to concrete booleans here.
 */
export interface AccessibilityPreferences {
  highContrast: boolean;
  grayscale: boolean;
  readableFont: boolean;
  textSpacing: boolean;
  underlineLinks: boolean;
  reducedMotion: boolean;
  fontSize: number;
}

/**
 * Declares which features a site exposes in its widget. Mirrors the cookie
 * package's `cookieProfile` idea: a site flips a feature off and the widget,
 * statement page, and persistence all stop referencing it — no component edits.
 */
export type FeatureFlags = Record<FeatureId, boolean>;

/** Default profile — every feature on. */
export const ALL_FEATURES: FeatureFlags = {
  highContrast: true,
  grayscale: true,
  readableFont: true,
  textSpacing: true,
  underlineLinks: true,
  reducedMotion: true,
  fontSize: true,
};

// ─── Feature metadata ────────────────────────────────────────────────────────

export interface FeatureMeta {
  id: FeatureId;
  /** Short control label shown in the widget. */
  label: string;
  /** One-line description, reused on the statement page. */
  description: string;
  kind: "toggle" | "stepper";
  /** Class toggled on <html> for toggle features (CSS in accessibility.css). */
  htmlClass?: string;
  /** OS media query this feature follows by default until the user overrides. */
  followsOS?: "prefers-reduced-motion" | "prefers-contrast";
}

export const FEATURE_META: Record<FeatureId, FeatureMeta> = {
  highContrast: {
    id: "highContrast",
    label: "High contrast",
    description:
      "Switch to a high-contrast color scheme. Follows your operating system's contrast preference by default.",
    kind: "toggle",
    htmlClass: "high-contrast",
    followsOS: "prefers-contrast",
  },
  grayscale: {
    id: "grayscale",
    label: "Grayscale",
    description:
      "Remove color from the interface, which can help with some forms of color sensitivity.",
    kind: "toggle",
    htmlClass: "grayscale",
  },
  readableFont: {
    id: "readableFont",
    label: "Readable font",
    description:
      "Switch the interface to a high-legibility typeface designed for low-vision readers.",
    kind: "toggle",
    htmlClass: "readable-font",
  },
  textSpacing: {
    id: "textSpacing",
    label: "Text spacing",
    description:
      "Increase line height, letter spacing, and word spacing for easier reading (WCAG 1.4.12).",
    kind: "toggle",
    htmlClass: "text-spacing",
  },
  underlineLinks: {
    id: "underlineLinks",
    label: "Underline links",
    description:
      "Underline every link so color is never the only cue (WCAG 1.4.1).",
    kind: "toggle",
    htmlClass: "underline-links",
  },
  reducedMotion: {
    id: "reducedMotion",
    label: "Reduce motion",
    description:
      "Turn off animations and transitions. Follows your operating system preference by default.",
    kind: "toggle",
    htmlClass: "reduce-motion",
    followsOS: "prefers-reduced-motion",
  },
  fontSize: {
    id: "fontSize",
    label: "Text size",
    description: "Scale the entire interface up or down.",
    kind: "stepper",
  },
};

/** Render/describe order for the widget and statement page. */
export const FEATURE_ORDER: FeatureId[] = [
  "highContrast",
  "grayscale",
  "readableFont",
  "textSpacing",
  "underlineLinks",
  "reducedMotion",
  "fontSize",
];

/**
 * The feature metas a site actually exposes, in order. A feature is included
 * unless its flag is explicitly `false`, so an omitted/partial profile defaults
 * to "on" (back-compat friendly, like the cookie profile).
 */
export function enabledFeatures(flags?: Partial<FeatureFlags>): FeatureMeta[] {
  return FEATURE_ORDER.filter((id) => flags?.[id] !== false).map(
    (id) => FEATURE_META[id],
  );
}

/** True if the widget would render at least one control for this profile. */
export function profileHasFeatures(flags?: Partial<FeatureFlags>): boolean {
  return enabledFeatures(flags).length > 0;
}
