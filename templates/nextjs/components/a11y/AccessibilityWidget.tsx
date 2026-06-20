"use client";

/**
 * Floating accessibility widget — mount once in the root layout so it's on
 * every page. Built from native, accessible HTML (no UI library): a disclosure
 * button toggles a labelled panel of switches plus a text-size stepper. The
 * panel traps focus while open, closes on Escape or outside click, and returns
 * focus to the trigger. All styling lives in styles/accessibility.css.
 *
 * Controls render from A11Y_CONFIG.features via the package, so toggling a
 * feature off in lib/accessibility-config.ts removes it here automatically.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  enabledFeatures,
  registerAccessibilityOpener,
  useAccessibility,
  type ToggleFeatureId,
} from "@devezindigital/accessibility";
import { A11Y_CONFIG } from "@/lib/accessibility-config";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function AccessibilityWidget() {
  const {
    preferences,
    features,
    toggle,
    increaseFontSize,
    decreaseFontSize,
    fontSize,
  } = useAccessibility();

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const titleId = useId();

  // Allow opening from outside React (e.g. a footer "Accessibility" link).
  useEffect(() => registerAccessibilityOpener(() => setOpen(true)), []);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Focus the first control on open; restore focus to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panel?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false);
        // Closing unmounts the panel; if the click didn't land on something
        // focusable, focus would fall to <body>. Once the click settles, pull
        // focus back to the trigger only in that case — never steal it from an
        // element the user deliberately clicked (WCAG 2.4.3 Focus Order).
        requestAnimationFrame(() => {
          if (
            document.activeElement === document.body ||
            !document.activeElement
          ) {
            triggerRef.current?.focus();
          }
        });
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open, close]);

  const metas = enabledFeatures(features);
  const toggles = metas.filter((m) => m.kind === "toggle");
  const hasStepper = metas.some((m) => m.id === "fontSize");

  return (
    <div className="a11y-widget" data-accessibility-widget>
      <button
        ref={triggerRef}
        type="button"
        className="a11y-widget__trigger"
        aria-label="Accessibility settings"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <AccessibilityIcon />
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          className="a11y-widget__panel"
        >
          <h2 id={titleId} className="a11y-widget__title">
            Accessibility
          </h2>

          <ul className="a11y-widget__list">
            {toggles.map((meta) => {
              const id = meta.id as ToggleFeatureId;
              const checked = Boolean(preferences[id]);
              const labelId = `${panelId}-${meta.id}`;
              return (
                <li key={meta.id} className="a11y-widget__row">
                  <span id={labelId} className="a11y-widget__label">
                    {meta.label}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    aria-labelledby={labelId}
                    className="a11y-switch"
                    data-checked={checked}
                    onClick={() => toggle(id)}
                  >
                    <span className="a11y-switch__thumb" aria-hidden="true" />
                  </button>
                </li>
              );
            })}

            {hasStepper && (
              <li className="a11y-widget__row">
                <span className="a11y-widget__label" id={`${panelId}-textsize`}>
                  Text size
                </span>
                <div className="a11y-stepper">
                  <button
                    type="button"
                    className="a11y-stepper__btn"
                    // aria-disabled (not the native `disabled`) keeps the button
                    // focusable at the bound, so focus isn't dropped out of the
                    // panel's focus trap. The click is a no-op there because the
                    // provider clamps the value (WCAG 2.4.3 Focus Order).
                    aria-disabled={preferences.fontSize <= fontSize.min}
                    onClick={() => {
                      if (preferences.fontSize > fontSize.min)
                        decreaseFontSize();
                    }}
                    aria-label="Decrease text size"
                  >
                    <MinusIcon />
                  </button>
                  <span className="a11y-stepper__value" aria-live="polite">
                    {preferences.fontSize}px
                  </span>
                  <button
                    type="button"
                    className="a11y-stepper__btn"
                    aria-disabled={preferences.fontSize >= fontSize.max}
                    onClick={() => {
                      if (preferences.fontSize < fontSize.max)
                        increaseFontSize();
                    }}
                    aria-label="Increase text size"
                  >
                    <PlusIcon />
                  </button>
                </div>
              </li>
            )}
          </ul>

          <a className="a11y-widget__statement" href={A11Y_CONFIG.statementUrl}>
            Read our accessibility statement
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Inline icons (no icon-library dependency) ───────────────────────────────

function AccessibilityIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="4.5" r="1.6" />
      <path d="M4 7.5c2.5 1 5 1.5 8 1.5s5.5-.5 8-1.5" />
      <path d="M12 9v6" />
      <path d="M9.5 21l2.5-6 2.5 6" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
