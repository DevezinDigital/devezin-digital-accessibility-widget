// @vitest-environment jsdom
//
// Unit tests for the AccessibilityProvider — the toggle / persistence /
// OS-following / font-size-clamp logic that previously had no direct coverage
// (the constants and checklist suites cover the pure helpers only).

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { type ReactNode } from "react";

import {
  AccessibilityProvider,
  useAccessibility,
} from "../context/AccessibilityProvider";
import {
  A11Y_VERSION,
  FONT_SIZE_DEFAULT,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
} from "../types/accessibility-constants";

const STORAGE_KEY = "test-a11y";

// jsdom doesn't implement matchMedia; the provider queries it on mount.
function mockMatchMedia(matches: boolean): void {
  window.matchMedia = (query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

function wrapper({ children }: { children: ReactNode }) {
  return (
    <AccessibilityProvider config={{ storageKey: STORAGE_KEY }}>
      {children}
    </AccessibilityProvider>
  );
}

beforeEach(() => {
  mockMatchMedia(false);
  localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.style.fontSize = "";
});

afterEach(cleanup);

describe("AccessibilityProvider", () => {
  it("toggles a feature and reflects it as a class on <html>", () => {
    const { result } = renderHook(() => useAccessibility(), { wrapper });

    expect(result.current.preferences.grayscale).toBe(false);
    act(() => result.current.toggle("grayscale"));

    expect(result.current.preferences.grayscale).toBe(true);
    expect(document.documentElement.classList.contains("grayscale")).toBe(true);
  });

  it("persists preferences to the configured storage key with a version stamp", () => {
    const { result } = renderHook(() => useAccessibility(), { wrapper });

    act(() => result.current.toggle("underlineLinks"));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(stored.underlineLinks).toBe(true);
    expect(stored.version).toBe(A11Y_VERSION);
  });

  it("clamps font size to the configured bounds", () => {
    const { result } = renderHook(() => useAccessibility(), { wrapper });

    act(() => result.current.setFontSize(999));
    expect(result.current.preferences.fontSize).toBe(FONT_SIZE_MAX);

    act(() => result.current.setFontSize(1));
    expect(result.current.preferences.fontSize).toBe(FONT_SIZE_MIN);
  });

  it("follows the OS preference until the user makes an explicit choice", () => {
    mockMatchMedia(true); // prefers-reduced-motion + prefers-contrast both on
    const { result } = renderHook(() => useAccessibility(), { wrapper });

    expect(result.current.preferences.reducedMotion).toBe(true);
    expect(result.current.preferences.highContrast).toBe(true);

    // An explicit toggle overrides the OS value...
    act(() => result.current.toggle("reducedMotion"));
    expect(result.current.preferences.reducedMotion).toBe(false);

    // ...and the explicit choice is what gets persisted (OS-follow = null is not).
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(stored.reducedMotion).toBe(false);
    expect("highContrast" in stored).toBe(false);
  });

  it("reset() restores defaults and OS-following", () => {
    const { result } = renderHook(() => useAccessibility(), { wrapper });

    act(() => {
      result.current.toggle("grayscale");
      result.current.increaseFontSize();
    });
    act(() => result.current.reset());

    expect(result.current.preferences.grayscale).toBe(false);
    expect(result.current.preferences.fontSize).toBe(FONT_SIZE_DEFAULT);
  });

  it("ignores stored preferences written under an older schema version", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: "0.0", grayscale: true }),
    );

    const { result } = renderHook(() => useAccessibility(), { wrapper });
    expect(result.current.preferences.grayscale).toBe(false);
  });
});
