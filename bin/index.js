#!/usr/bin/env node

/**
 * bin/index.js — Accessibility widget scaffolder.
 *
 * Copies the Next.js template files (provider wrapper, widget, skip link,
 * statement page, styles, config, and a sample a11y test) into the consuming
 * project. Existing files are skipped, never overwritten, so customizations are
 * preserved on re-run. Plain JS because it runs at install time with no build
 * step.
 */

import prompts from "prompts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageRoot = path.resolve(__dirname, "..");
const targetRoot = process.cwd();

function getAllFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? getAllFiles(fullPath) : [fullPath];
  });
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

async function main() {
  console.log("\n♿ Accessibility Widget Setup\n");

  const response = await prompts(
    [
      {
        type: "confirm",
        name: "confirmed",
        message: `This will copy the Next.js template files into your project at ${targetRoot}. Continue?`,
        initial: true,
      },
    ],
    {
      onCancel: () => {
        console.log("\n✖ Setup cancelled.\n");
        process.exit(0);
      },
    },
  );

  if (!response.confirmed) {
    console.log("\n✖ Setup cancelled.\n");
    process.exit(0);
  }

  const templateDir = path.join(packageRoot, "templates", "nextjs");

  if (!fs.existsSync(templateDir)) {
    console.error(`\n✖ Template directory not found at ${templateDir}.\n`);
    process.exit(1);
  }

  const files = getAllFiles(templateDir);
  const copied = [];
  const skipped = [];

  for (const srcFile of files) {
    const relativePath = path.relative(templateDir, srcFile);
    const destFile = path.join(targetRoot, relativePath);

    if (fs.existsSync(destFile)) {
      // Don't clobber files the developer may have customized.
      skipped.push(relativePath);
    } else {
      copyFile(srcFile, destFile);
      copied.push(relativePath);
    }
  }

  console.log("\n✔ Setup complete!\n");

  if (copied.length > 0) {
    console.log("Copied:");
    copied.forEach((f) => console.log(`  + ${f}`));
  }

  if (skipped.length > 0) {
    console.log("\nSkipped (already exist):");
    skipped.forEach((f) => console.log(`  ~ ${f}`));
  }

  console.log(`
─────────────────────────────────────────────
Next steps:

  1. Import the stylesheet in your root layout (or globals.css):
       import "@/styles/accessibility.css";

  2. Wrap your app in the provider and mount the widget + skip link
     in app/layout.tsx:
       <AccessibilityProviderWrapper>
         <SkipLink />
         {children}
         <AccessibilityWidget />
       </AccessibilityProviderWrapper>

  3. Give your page's <main> an id="main-content" so the skip link lands.

  4. Edit lib/accessibility-config.ts — site name, contact email,
     which widget features to expose, and the statement-page copy.

  5. (Optional) Add the a11y checks to your build:
       - eslint.config.js:  import a11y from
           "@devezindigital/accessibility/eslint";  → spread ...a11y
       - run the sample test in tests/accessibility.test.tsx

  See README.md for full instructions.
─────────────────────────────────────────────
`);
}

main().catch((err) => {
  // Surface fs/permission errors as a friendly message + non-zero exit instead
  // of an unhandled-rejection stack trace.
  console.error(`\n✖ Setup failed: ${err?.message ?? err}\n`);
  process.exit(1);
});
