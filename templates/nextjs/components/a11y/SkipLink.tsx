/**
 * "Skip to main content" link (WCAG 2.4.1 Bypass Blocks). Render it as the
 * first focusable element on every page (inside the provider, before the
 * header). Visually hidden until focused; targets the `main-content` id you set
 * on each page's <main>. Styling lives in styles/accessibility.css so this has
 * no Tailwind/CSS-framework dependency.
 */

export function SkipLink() {
  return (
    <a href="#main-content" className="a11y-skip-link">
      Skip to main content
    </a>
  );
}
