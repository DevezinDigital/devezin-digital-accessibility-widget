"use client";

/**
 * Wraps the package's AccessibilityProvider with this site's config so
 * app/layout.tsx stays clean. Mount it high in the tree, then render
 * <SkipLink /> and <AccessibilityWidget /> inside it.
 */

import { AccessibilityProvider } from "@devezindigital/accessibility";
import { A11Y_CONFIG } from "@/lib/accessibility-config";

export function AccessibilityProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccessibilityProvider
      config={{
        storageKey: A11Y_CONFIG.storageKey,
        features: A11Y_CONFIG.features,
      }}
    >
      {children}
    </AccessibilityProvider>
  );
}
