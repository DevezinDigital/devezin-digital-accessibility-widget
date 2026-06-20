/**
 * constants.ts — Server-safe entry (`@devezindigital/accessibility/constants`).
 *
 * Built WITHOUT the "use client" banner, so Server Components can import the
 * pure types/constants/metadata (e.g. to render the statement page or describe
 * features) without paying the client-component tax. Deliberately mirrors the
 * inert surface of index.ts — no provider, hooks, or DOM code.
 */
export type { AccessibilityPreferences, FeatureFlags, FeatureId, ToggleFeatureId, FeatureMeta, } from "./types/accessibility-constants";
export { A11Y_VERSION, DEFAULT_STORAGE_KEY, FONT_SIZE_MIN, FONT_SIZE_MAX, FONT_SIZE_DEFAULT, FONT_SIZE_STEP, ALL_FEATURES, FEATURE_META, FEATURE_ORDER, enabledFeatures, profileHasFeatures, clampFontSize, } from "./types/accessibility-constants";
