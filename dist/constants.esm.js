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
const A11Y_VERSION = "1.0";
/** Default localStorage key. Override per-site via the provider config. */
const DEFAULT_STORAGE_KEY = "a11y-preferences";
// ─── Font-size bounds (px) ───────────────────────────────────────────────────
const FONT_SIZE_MIN = 12;
const FONT_SIZE_MAX = 24;
const FONT_SIZE_DEFAULT = 16;
const FONT_SIZE_STEP = 2;
function clampFontSize(value) {
    return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, value));
}
/** Default profile — every feature on. */
const ALL_FEATURES = {
    highContrast: true,
    grayscale: true,
    readableFont: true,
    textSpacing: true,
    underlineLinks: true,
    reducedMotion: true,
    fontSize: true,
};
const FEATURE_META = {
    highContrast: {
        id: "highContrast",
        label: "High contrast",
        description: "Switch to a high-contrast color scheme. Follows your operating system's contrast preference by default.",
        kind: "toggle",
        htmlClass: "high-contrast",
        followsOS: "prefers-contrast",
    },
    grayscale: {
        id: "grayscale",
        label: "Grayscale",
        description: "Remove color from the interface, which can help with some forms of color sensitivity.",
        kind: "toggle",
        htmlClass: "grayscale",
    },
    readableFont: {
        id: "readableFont",
        label: "Readable font",
        description: "Switch the interface to a high-legibility typeface designed for low-vision readers.",
        kind: "toggle",
        htmlClass: "readable-font",
    },
    textSpacing: {
        id: "textSpacing",
        label: "Text spacing",
        description: "Increase line height, letter spacing, and word spacing for easier reading (WCAG 1.4.12).",
        kind: "toggle",
        htmlClass: "text-spacing",
    },
    underlineLinks: {
        id: "underlineLinks",
        label: "Underline links",
        description: "Underline every link so color is never the only cue (WCAG 1.4.1).",
        kind: "toggle",
        htmlClass: "underline-links",
    },
    reducedMotion: {
        id: "reducedMotion",
        label: "Reduce motion",
        description: "Turn off animations and transitions. Follows your operating system preference by default.",
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
const FEATURE_ORDER = [
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
function enabledFeatures(flags) {
    return FEATURE_ORDER.filter((id) => flags?.[id] !== false).map((id) => FEATURE_META[id]);
}
/** True if the widget would render at least one control for this profile. */
function profileHasFeatures(flags) {
    return enabledFeatures(flags).length > 0;
}

export { A11Y_VERSION, ALL_FEATURES, DEFAULT_STORAGE_KEY, FEATURE_META, FEATURE_ORDER, FONT_SIZE_DEFAULT, FONT_SIZE_MAX, FONT_SIZE_MIN, FONT_SIZE_STEP, clampFontSize, enabledFeatures, profileHasFeatures };
