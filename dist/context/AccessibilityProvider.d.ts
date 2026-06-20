/**
 * context/AccessibilityProvider.tsx
 *
 * Holds the visitor's accessibility preferences and reflects them onto <html>
 * as classes (`high-contrast`, `reduce-motion`, `readable-font`, `text-spacing`,
 * `underline-links`, `grayscale`) plus a root font-size, where the package's
 * accessibility.css picks them up. Preferences persist in localStorage.
 *
 * Reduced motion and high contrast follow the OS settings
 * (`prefers-reduced-motion`, `prefers-contrast: more`) until the user overrides
 * them in the widget. This is a dependency-free port of the implementation
 * shipped in production on WIPit, generalised for reuse across sites.
 */
import { type ReactNode } from "react";
import { type AccessibilityPreferences, type FeatureFlags, type ToggleFeatureId } from "../types/accessibility-constants";
declare global {
    interface Window {
        /** Opens the accessibility widget from anywhere (e.g. a footer link). */
        openAccessibilityMenu?: () => void;
    }
}
/**
 * Registers the widget's "open" callback at module scope so external code can
 * open the panel via `openAccessibilityMenu()` / `window.openAccessibilityMenu()`.
 * Returns an unregister function. Mirrors the cookie package's
 * `registerPreferencesOpener`.
 */
export declare function registerAccessibilityOpener(open: () => void): () => void;
/** Opens the accessibility widget, if one is mounted. */
export declare function openAccessibilityMenu(): void;
export interface AccessibilityProviderConfig {
    /** localStorage key. Defaults to "a11y-preferences". Use a per-site key. */
    storageKey?: string;
    /**
     * Which features this site exposes. Omitted/`true` features stay on; set a
     * feature `false` to drop it everywhere (widget + persistence). Defaults to
     * all features enabled.
     */
    features?: Partial<FeatureFlags>;
}
export interface AccessibilityContextValue {
    /** Resolved preferences (OS-following values already resolved to booleans). */
    preferences: AccessibilityPreferences;
    /** The enabled-feature profile for this site. */
    features: FeatureFlags;
    version: string;
    toggle: (feature: ToggleFeatureId) => void;
    setFontSize: (px: number) => void;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
    /** Clears all preferences back to defaults (and OS-following). */
    reset: () => void;
    fontSize: {
        min: number;
        max: number;
        default: number;
        step: number;
    };
}
export declare function useAccessibility(): AccessibilityContextValue;
/** Read-only resolved preferences — a lighter hook for conditional rendering. */
export declare function useAccessibilityPreferences(): AccessibilityPreferences;
export declare function AccessibilityProvider({ children, config, }: {
    children: ReactNode;
    config?: AccessibilityProviderConfig;
}): import("react").JSX.Element;
