/**
 * Accessibility statement page (Server Component).
 *
 * Reads copy from lib/accessibility-config.ts and generates the "Accessibility
 * settings" feature list from the enabled widget features, so the page always
 * matches what the widget actually offers. Imports from the package's
 * server-safe `/constants` entry — no "use client" needed.
 *
 * Styling is intentionally minimal/semantic so it inherits your site's
 * typography. Wrap or restyle via the `.a11y-statement` class as needed.
 */

import type { Metadata } from "next";
import {
  enabledFeatures,
  FEATURE_META,
} from "@devezindigital/accessibility/constants";
import {
  A11Y_CONFIG,
  SITE,
  STATEMENT_CONFIG,
} from "@/lib/accessibility-config";

const description = `${SITE.name}'s commitment to digital accessibility: our target conformance with ${STATEMENT_CONFIG.targetStandard}, the assistive technologies we support, and how to report an accessibility barrier.`;

export const metadata: Metadata = {
  title: `Accessibility Statement — ${SITE.name}`,
  description,
  alternates: { canonical: A11Y_CONFIG.statementUrl },
  openGraph: {
    title: `Accessibility Statement — ${SITE.name}`,
    description,
    url: A11Y_CONFIG.statementUrl,
    type: "website",
  },
};

export default function AccessibilityPage() {
  const widgetFeatures = enabledFeatures(A11Y_CONFIG.features).filter(
    (f) => f.id !== "fontSize",
  );
  const hasFontSize = A11Y_CONFIG.features.fontSize !== false;
  const lastUpdated = STATEMENT_CONFIG.lastUpdated || "[set lastUpdated]";

  return (
    <main id="main-content" className="a11y-statement">
      <article>
        <h1>Accessibility Statement</h1>
        <p>
          <strong>Last updated:</strong> {lastUpdated}
        </p>

        <p>
          {SITE.name} is committed to making this website usable for everyone,
          including people who rely on assistive technologies or need different
          visual settings.
        </p>

        {STATEMENT_CONFIG.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}

        <section>
          <h2>Conformance status</h2>
          <p>
            We aim to conform to the{" "}
            <a
              href="https://www.w3.org/WAI/standards-guidelines/wcag/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Web Content Accessibility Guidelines (WCAG)
            </a>{" "}
            — target level: {STATEMENT_CONFIG.targetStandard}.
          </p>
        </section>

        {(widgetFeatures.length > 0 || hasFontSize) && (
          <section>
            <h2>Accessibility settings</h2>
            <p>
              Every page includes an accessibility widget — the round button in
              the bottom-left corner of the screen. It lets you:
            </p>
            <ul>
              {widgetFeatures.map((feature) => (
                <li key={feature.id}>
                  <strong>{feature.label}</strong> — {feature.description}
                </li>
              ))}
              {hasFontSize && (
                <li>
                  <strong>{FEATURE_META.fontSize.label}</strong> —{" "}
                  {FEATURE_META.fontSize.description}
                </li>
              )}
            </ul>
            <p>
              Your choices are saved in your browser and applied automatically
              on your next visit.
            </p>
          </section>
        )}

        <section>
          <h2>Assistive technologies supported</h2>
          <ul>
            {STATEMENT_CONFIG.assistiveTech.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Feedback</h2>
          <p>
            If you encounter an accessibility barrier on {SITE.name}, please
            email us at <strong>{SITE.contactEmail}</strong>. We aim to respond
            within 5 business days.
          </p>
        </section>

        <section>
          <h2>Resources</h2>
          <ul>
            <li>
              <a
                href="https://www.w3.org/WAI/standards-guidelines/wcag/"
                target="_blank"
                rel="noreferrer"
              >
                Web Content Accessibility Guidelines (WCAG)
              </a>
            </li>
            <li>
              <a
                href="https://www.w3.org/WAI/"
                target="_blank"
                rel="noreferrer"
              >
                W3C Web Accessibility Initiative (WAI)
              </a>
            </li>
            <li>
              <a
                href="https://www.ada.gov/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Americans with Disabilities Act (ADA)
              </a>
            </li>
          </ul>
        </section>
      </article>
    </main>
  );
}
