"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');

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

// ─── Module-level opener (open the widget from outside React) ─────────────────
let _opener = null;
/**
 * Registers the widget's "open" callback at module scope so external code can
 * open the panel via `openAccessibilityMenu()` / `window.openAccessibilityMenu()`.
 * Returns an unregister function. Mirrors the cookie package's
 * `registerPreferencesOpener`.
 */
function registerAccessibilityOpener(open) {
    _opener = open;
    return () => {
        if (_opener === open)
            _opener = null;
    };
}
/** Opens the accessibility widget, if one is mounted. */
function openAccessibilityMenu() {
    _opener?.();
}
const DEFAULT_PREFS = {
    highContrast: null,
    reducedMotion: null,
    grayscale: false,
    readableFont: false,
    textSpacing: false,
    underlineLinks: false,
    fontSize: FONT_SIZE_DEFAULT,
};
function bool(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
}
/**
 * Safe to call during render: on the server it returns defaults, and no SSR
 * markup depends on the stored values (the widget panel only mounts after the
 * user opens it, post-hydration), so hydration always matches.
 */
function readStoredPrefs(storageKey) {
    if (typeof window === "undefined")
        return DEFAULT_PREFS;
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
        // Preferences from an older schema are ignored — treat as first visit.
        if (stored.version && stored.version !== A11Y_VERSION)
            return DEFAULT_PREFS;
        return {
            highContrast: typeof stored.highContrast === "boolean" ? stored.highContrast : null,
            reducedMotion: typeof stored.reducedMotion === "boolean" ? stored.reducedMotion : null,
            grayscale: bool(stored.grayscale, false),
            readableFont: bool(stored.readableFont, false),
            textSpacing: bool(stored.textSpacing, false),
            underlineLinks: bool(stored.underlineLinks, false),
            fontSize: typeof stored.fontSize === "number"
                ? clampFontSize(stored.fontSize)
                : FONT_SIZE_DEFAULT,
        };
    }
    catch {
        // Corrupt storage — fall back to defaults.
        return DEFAULT_PREFS;
    }
}
function matchMediaSafe(query) {
    return typeof window !== "undefined" && window.matchMedia(query).matches;
}
const AccessibilityContext = react.createContext(null);
function useAccessibility() {
    const context = react.useContext(AccessibilityContext);
    if (!context) {
        throw new Error("useAccessibility must be used within an AccessibilityProvider");
    }
    return context;
}
/** Read-only resolved preferences — a lighter hook for conditional rendering. */
function useAccessibilityPreferences() {
    return useAccessibility().preferences;
}
function AccessibilityProvider({ children, config = {}, }) {
    const storageKey = config.storageKey ?? DEFAULT_STORAGE_KEY;
    const features = react.useMemo(() => ({ ...ALL_FEATURES, ...config.features }), [config.features]);
    const [prefs, setPrefs] = react.useState(() => readStoredPrefs(storageKey));
    const [systemReducedMotion, setSystemReducedMotion] = react.useState(() => matchMediaSafe("(prefers-reduced-motion: reduce)"));
    const [systemHighContrast, setSystemHighContrast] = react.useState(() => matchMediaSafe("(prefers-contrast: more)"));
    const reducedMotion = prefs.reducedMotion ?? systemReducedMotion;
    const highContrast = prefs.highContrast ?? systemHighContrast;
    // Track OS preference changes for users without an explicit choice.
    react.useEffect(() => {
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const contrast = window.matchMedia("(prefers-contrast: more)");
        const onMotion = (e) => setSystemReducedMotion(e.matches);
        const onContrast = (e) => setSystemHighContrast(e.matches);
        motion.addEventListener("change", onMotion);
        contrast.addEventListener("change", onContrast);
        return () => {
            motion.removeEventListener("change", onMotion);
            contrast.removeEventListener("change", onContrast);
        };
    }, []);
    // Reflect preferences on <html> so CSS can respond. Only enabled features
    // ever apply a class — a disabled feature stays at its default.
    react.useEffect(() => {
        const root = document.documentElement;
        const on = (id, active) => {
            const cls = FEATURE_META[id].htmlClass;
            if (cls)
                root.classList.toggle(cls, features[id] && active);
        };
        on("highContrast", highContrast);
        on("reducedMotion", reducedMotion);
        on("grayscale", prefs.grayscale);
        on("readableFont", prefs.readableFont);
        on("textSpacing", prefs.textSpacing);
        on("underlineLinks", prefs.underlineLinks);
        // Lets an explicit "motion on" choice override the OS-level
        // prefers-reduced-motion fallback in accessibility.css.
        root.classList.toggle("motion-ok", features.reducedMotion && prefs.reducedMotion === false);
        root.style.fontSize =
            features.fontSize && prefs.fontSize !== FONT_SIZE_DEFAULT
                ? `${prefs.fontSize}px`
                : "";
    }, [
        features,
        highContrast,
        reducedMotion,
        prefs.reducedMotion,
        prefs.grayscale,
        prefs.readableFont,
        prefs.textSpacing,
        prefs.underlineLinks,
        prefs.fontSize,
    ]);
    // Persist. null (= follow the OS) is intentionally not written for the
    // motion/contrast preferences, so the OS setting keeps applying until the
    // user flips the switch.
    react.useEffect(() => {
        const toStore = {
            version: A11Y_VERSION,
            grayscale: prefs.grayscale,
            readableFont: prefs.readableFont,
            textSpacing: prefs.textSpacing,
            underlineLinks: prefs.underlineLinks,
            fontSize: prefs.fontSize,
        };
        if (prefs.reducedMotion !== null)
            toStore.reducedMotion = prefs.reducedMotion;
        if (prefs.highContrast !== null)
            toStore.highContrast = prefs.highContrast;
        try {
            localStorage.setItem(storageKey, JSON.stringify(toStore));
        }
        catch {
            // Storage full or unavailable — preferences just won't persist.
        }
    }, [prefs, storageKey]);
    // Expose the module-level opener on window for non-React callers.
    react.useEffect(() => {
        window.openAccessibilityMenu = openAccessibilityMenu;
        return () => {
            if (window.openAccessibilityMenu === openAccessibilityMenu) {
                delete window.openAccessibilityMenu;
            }
        };
    }, []);
    const toggle = react.useCallback((feature) => setPrefs((prev) => {
        if (feature === "highContrast") {
            return {
                ...prev,
                highContrast: !(prev.highContrast ?? systemHighContrast),
            };
        }
        if (feature === "reducedMotion") {
            return {
                ...prev,
                reducedMotion: !(prev.reducedMotion ?? systemReducedMotion),
            };
        }
        return { ...prev, [feature]: !prev[feature] };
    }), [systemHighContrast, systemReducedMotion]);
    const setFontSize = react.useCallback((px) => setPrefs((prev) => ({ ...prev, fontSize: clampFontSize(px) })), []);
    const increaseFontSize = react.useCallback(() => setPrefs((prev) => ({
        ...prev,
        fontSize: clampFontSize(prev.fontSize + FONT_SIZE_STEP),
    })), []);
    const decreaseFontSize = react.useCallback(() => setPrefs((prev) => ({
        ...prev,
        fontSize: clampFontSize(prev.fontSize - FONT_SIZE_STEP),
    })), []);
    const reset = react.useCallback(() => setPrefs(DEFAULT_PREFS), []);
    const value = react.useMemo(() => ({
        preferences: {
            highContrast,
            reducedMotion,
            grayscale: prefs.grayscale,
            readableFont: prefs.readableFont,
            textSpacing: prefs.textSpacing,
            underlineLinks: prefs.underlineLinks,
            fontSize: prefs.fontSize,
        },
        features,
        version: A11Y_VERSION,
        toggle,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        reset,
        fontSize: {
            min: FONT_SIZE_MIN,
            max: FONT_SIZE_MAX,
            default: FONT_SIZE_DEFAULT,
            step: FONT_SIZE_STEP,
        },
    }), [
        highContrast,
        reducedMotion,
        prefs.grayscale,
        prefs.readableFont,
        prefs.textSpacing,
        prefs.underlineLinks,
        prefs.fontSize,
        features,
        toggle,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        reset,
    ]);
    return (jsxRuntime.jsx(AccessibilityContext.Provider, { value: value, children: children }));
}

exports.A11Y_VERSION = A11Y_VERSION;
exports.ALL_FEATURES = ALL_FEATURES;
exports.AccessibilityProvider = AccessibilityProvider;
exports.DEFAULT_STORAGE_KEY = DEFAULT_STORAGE_KEY;
exports.FEATURE_META = FEATURE_META;
exports.FEATURE_ORDER = FEATURE_ORDER;
exports.FONT_SIZE_DEFAULT = FONT_SIZE_DEFAULT;
exports.FONT_SIZE_MAX = FONT_SIZE_MAX;
exports.FONT_SIZE_MIN = FONT_SIZE_MIN;
exports.FONT_SIZE_STEP = FONT_SIZE_STEP;
exports.clampFontSize = clampFontSize;
exports.enabledFeatures = enabledFeatures;
exports.openAccessibilityMenu = openAccessibilityMenu;
exports.profileHasFeatures = profileHasFeatures;
exports.registerAccessibilityOpener = registerAccessibilityOpener;
exports.useAccessibility = useAccessibility;
exports.useAccessibilityPreferences = useAccessibilityPreferences;
