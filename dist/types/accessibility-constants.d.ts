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
export declare const A11Y_VERSION = "1.0";
/** Default localStorage key. Override per-site via the provider config. */
export declare const DEFAULT_STORAGE_KEY = "a11y-preferences";
export declare const FONT_SIZE_MIN = 12;
export declare const FONT_SIZE_MAX = 24;
export declare const FONT_SIZE_DEFAULT = 16;
export declare const FONT_SIZE_STEP = 2;
export declare function clampFontSize(value: number): number;
/** Features rendered as an on/off switch. */
export type ToggleFeatureId = "highContrast" | "grayscale" | "readableFont" | "textSpacing" | "underlineLinks" | "reducedMotion";
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
export declare const ALL_FEATURES: FeatureFlags;
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
export declare const FEATURE_META: Record<FeatureId, FeatureMeta>;
/** Render/describe order for the widget and statement page. */
export declare const FEATURE_ORDER: FeatureId[];
/**
 * The feature metas a site actually exposes, in order. A feature is included
 * unless its flag is explicitly `false`, so an omitted/partial profile defaults
 * to "on" (back-compat friendly, like the cookie profile).
 */
export declare function enabledFeatures(flags?: Partial<FeatureFlags>): FeatureMeta[];
/** True if the widget would render at least one control for this profile. */
export declare function profileHasFeatures(flags?: Partial<FeatureFlags>): boolean;
