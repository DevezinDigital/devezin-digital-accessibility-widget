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

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  A11Y_VERSION,
  ALL_FEATURES,
  clampFontSize,
  DEFAULT_STORAGE_KEY,
  FEATURE_META,
  FONT_SIZE_DEFAULT,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_SIZE_STEP,
  type AccessibilityPreferences,
  type FeatureFlags,
  type ToggleFeatureId,
} from "../types/accessibility-constants";

declare global {
  interface Window {
    /** Opens the accessibility widget from anywhere (e.g. a footer link). */
    openAccessibilityMenu?: () => void;
  }
}

// ─── Module-level opener (open the widget from outside React) ─────────────────

let _opener: (() => void) | null = null;

/**
 * Registers the widget's "open" callback at module scope so external code can
 * open the panel via `openAccessibilityMenu()` / `window.openAccessibilityMenu()`.
 * Returns an unregister function. Mirrors the cookie package's
 * `registerPreferencesOpener`.
 */
export function registerAccessibilityOpener(open: () => void): () => void {
  _opener = open;
  return () => {
    if (_opener === open) _opener = null;
  };
}

/** Opens the accessibility widget, if one is mounted. */
export function openAccessibilityMenu(): void {
  _opener?.();
}

// ─── Stored shape (internal) ─────────────────────────────────────────────────

interface StoredPrefs {
  /** null = no explicit choice; follow the OS prefers-contrast setting. */
  highContrast: boolean | null;
  /** null = no explicit choice; follow the OS prefers-reduced-motion. */
  reducedMotion: boolean | null;
  grayscale: boolean;
  readableFont: boolean;
  textSpacing: boolean;
  underlineLinks: boolean;
  fontSize: number;
}

const DEFAULT_PREFS: StoredPrefs = {
  highContrast: null,
  reducedMotion: null,
  grayscale: false,
  readableFont: false,
  textSpacing: false,
  underlineLinks: false,
  fontSize: FONT_SIZE_DEFAULT,
};

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/**
 * Safe to call during render: on the server it returns defaults, and no SSR
 * markup depends on the stored values (the widget panel only mounts after the
 * user opens it, post-hydration), so hydration always matches.
 */
function readStoredPrefs(storageKey: string): StoredPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    // Preferences from an older schema are ignored — treat as first visit.
    if (stored.version && stored.version !== A11Y_VERSION) return DEFAULT_PREFS;
    return {
      highContrast:
        typeof stored.highContrast === "boolean" ? stored.highContrast : null,
      reducedMotion:
        typeof stored.reducedMotion === "boolean" ? stored.reducedMotion : null,
      grayscale: bool(stored.grayscale, false),
      readableFont: bool(stored.readableFont, false),
      textSpacing: bool(stored.textSpacing, false),
      underlineLinks: bool(stored.underlineLinks, false),
      fontSize:
        typeof stored.fontSize === "number"
          ? clampFontSize(stored.fontSize)
          : FONT_SIZE_DEFAULT,
    };
  } catch {
    // Corrupt storage — fall back to defaults.
    return DEFAULT_PREFS;
  }
}

function matchMediaSafe(query: string): boolean {
  return typeof window !== "undefined" && window.matchMedia(query).matches;
}

// ─── Context ─────────────────────────────────────────────────────────────────

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
  fontSize: { min: number; max: number; default: number; step: number };
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null,
);

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider",
    );
  }
  return context;
}

/** Read-only resolved preferences — a lighter hook for conditional rendering. */
export function useAccessibilityPreferences(): AccessibilityPreferences {
  return useAccessibility().preferences;
}

export function AccessibilityProvider({
  children,
  config = {},
}: {
  children: ReactNode;
  config?: AccessibilityProviderConfig;
}) {
  const storageKey = config.storageKey ?? DEFAULT_STORAGE_KEY;
  const features = useMemo<FeatureFlags>(
    () => ({ ...ALL_FEATURES, ...config.features }),
    [config.features],
  );

  const [prefs, setPrefs] = useState<StoredPrefs>(() =>
    readStoredPrefs(storageKey),
  );
  const [systemReducedMotion, setSystemReducedMotion] = useState(() =>
    matchMediaSafe("(prefers-reduced-motion: reduce)"),
  );
  const [systemHighContrast, setSystemHighContrast] = useState(() =>
    matchMediaSafe("(prefers-contrast: more)"),
  );

  const reducedMotion = prefs.reducedMotion ?? systemReducedMotion;
  const highContrast = prefs.highContrast ?? systemHighContrast;

  // Track OS preference changes for users without an explicit choice.
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const contrast = window.matchMedia("(prefers-contrast: more)");
    const onMotion = (e: MediaQueryListEvent) =>
      setSystemReducedMotion(e.matches);
    const onContrast = (e: MediaQueryListEvent) =>
      setSystemHighContrast(e.matches);
    motion.addEventListener("change", onMotion);
    contrast.addEventListener("change", onContrast);
    return () => {
      motion.removeEventListener("change", onMotion);
      contrast.removeEventListener("change", onContrast);
    };
  }, []);

  // Reflect preferences on <html> so CSS can respond. Only enabled features
  // ever apply a class — a disabled feature stays at its default.
  useEffect(() => {
    const root = document.documentElement;
    const on = (id: ToggleFeatureId, active: boolean) => {
      const cls = FEATURE_META[id].htmlClass;
      if (cls) root.classList.toggle(cls, features[id] && active);
    };
    on("highContrast", highContrast);
    on("reducedMotion", reducedMotion);
    on("grayscale", prefs.grayscale);
    on("readableFont", prefs.readableFont);
    on("textSpacing", prefs.textSpacing);
    on("underlineLinks", prefs.underlineLinks);
    // Lets an explicit "motion on" choice override the OS-level
    // prefers-reduced-motion fallback in accessibility.css.
    root.classList.toggle(
      "motion-ok",
      features.reducedMotion && prefs.reducedMotion === false,
    );
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
  useEffect(() => {
    const toStore: Record<string, unknown> = {
      version: A11Y_VERSION,
      grayscale: prefs.grayscale,
      readableFont: prefs.readableFont,
      textSpacing: prefs.textSpacing,
      underlineLinks: prefs.underlineLinks,
      fontSize: prefs.fontSize,
    };
    if (prefs.reducedMotion !== null)
      toStore.reducedMotion = prefs.reducedMotion;
    if (prefs.highContrast !== null) toStore.highContrast = prefs.highContrast;
    try {
      localStorage.setItem(storageKey, JSON.stringify(toStore));
    } catch {
      // Storage full or unavailable — preferences just won't persist.
    }
  }, [prefs, storageKey]);

  // Expose the module-level opener on window for non-React callers.
  useEffect(() => {
    window.openAccessibilityMenu = openAccessibilityMenu;
    return () => {
      if (window.openAccessibilityMenu === openAccessibilityMenu) {
        delete window.openAccessibilityMenu;
      }
    };
  }, []);

  const toggle = useCallback(
    (feature: ToggleFeatureId) =>
      setPrefs((prev) => {
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
      }),
    [systemHighContrast, systemReducedMotion],
  );

  const setFontSize = useCallback(
    (px: number) =>
      setPrefs((prev) => ({ ...prev, fontSize: clampFontSize(px) })),
    [],
  );
  const increaseFontSize = useCallback(
    () =>
      setPrefs((prev) => ({
        ...prev,
        fontSize: clampFontSize(prev.fontSize + FONT_SIZE_STEP),
      })),
    [],
  );
  const decreaseFontSize = useCallback(
    () =>
      setPrefs((prev) => ({
        ...prev,
        fontSize: clampFontSize(prev.fontSize - FONT_SIZE_STEP),
      })),
    [],
  );
  const reset = useCallback(() => setPrefs(DEFAULT_PREFS), []);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
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
    }),
    [
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
    ],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}
