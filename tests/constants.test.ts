import { describe, expect, it } from "vitest";

import {
  clampFontSize,
  enabledFeatures,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  profileHasFeatures,
} from "../types/accessibility-constants";

describe("clampFontSize", () => {
  it("clamps to the configured bounds", () => {
    expect(clampFontSize(4)).toBe(FONT_SIZE_MIN);
    expect(clampFontSize(999)).toBe(FONT_SIZE_MAX);
    expect(clampFontSize(16)).toBe(16);
  });
});

describe("enabledFeatures", () => {
  it("defaults to all features when no profile is given", () => {
    expect(enabledFeatures()).toHaveLength(7);
  });

  it("drops only the features explicitly set to false", () => {
    const metas = enabledFeatures({ grayscale: false, fontSize: false });
    const ids = metas.map((m) => m.id);
    expect(ids).not.toContain("grayscale");
    expect(ids).not.toContain("fontSize");
    expect(ids).toContain("highContrast");
  });

  it("preserves the canonical order", () => {
    const ids = enabledFeatures().map((m) => m.id);
    expect(ids[0]).toBe("highContrast");
    expect(ids[ids.length - 1]).toBe("fontSize");
  });
});

describe("profileHasFeatures", () => {
  it("is false only when every feature is disabled", () => {
    expect(profileHasFeatures()).toBe(true);
    expect(
      profileHasFeatures({
        highContrast: false,
        grayscale: false,
        readableFont: false,
        textSpacing: false,
        underlineLinks: false,
        reducedMotion: false,
        fontSize: false,
      }),
    ).toBe(false);
  });
});
