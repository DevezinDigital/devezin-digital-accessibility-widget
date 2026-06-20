/**
 * index.ts — Public API surface (built with the "use client" banner).
 *
 * Everything exported here is the package's committed, stable API. Internal
 * helpers (the module-level opener variable, the StoredPrefs shape) are kept
 * private.
 *
 * Server Components that only need types/constants/metadata should import from
 * `@devezindigital/accessibility/constants` instead, to avoid crossing the
 * client boundary for inert data.
 */
export type { AccessibilityPreferences, FeatureFlags, FeatureId, ToggleFeatureId, FeatureMeta, } from "./types/accessibility-constants";
export { A11Y_VERSION, DEFAULT_STORAGE_KEY, FONT_SIZE_MIN, FONT_SIZE_MAX, FONT_SIZE_DEFAULT, FONT_SIZE_STEP, ALL_FEATURES, FEATURE_META, FEATURE_ORDER, enabledFeatures, profileHasFeatures, clampFontSize, } from "./types/accessibility-constants";
export { AccessibilityProvider, useAccessibility, useAccessibilityPreferences, registerAccessibilityOpener, openAccessibilityMenu, } from "./context/AccessibilityProvider";
export type { AccessibilityProviderConfig, AccessibilityContextValue, } from "./context/AccessibilityProvider";
