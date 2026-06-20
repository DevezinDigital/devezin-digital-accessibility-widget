# Security Policy

## Supported versions

This package follows the latest released `main`. Security fixes are applied to
the current major version line.

| Version | Supported |
| ------- | --------- |
| 1.x     | ✅        |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security reports.**

Report suspected vulnerabilities privately via one of:

- GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
  (the **Security** tab → **Report a vulnerability**), or
- email **security@devezindigital.com**.

Please include:

- a description of the issue and its impact,
- steps to reproduce or a proof of concept,
- affected version(s) and environment.

We aim to acknowledge reports within **3 business days** and to provide a
remediation timeline after triage. Please give us a reasonable window to ship a
fix before any public disclosure.

## Scope & threat model

This is a dependency-free, backend-less client + build-time library. It has no
server, no API, no database, and stores user preferences only in the browser's
`localStorage`. The realistic attack surface is limited to:

1. client-side code running in a consuming site's browser (DOM + `localStorage`),
2. the `accessibility-init` scaffolder, which writes template files into a
   developer's working directory at setup time, and
3. supply-chain integrity (the committed `dist/`, the lockfile, and dev
   dependencies).

There are no secrets, credentials, or network calls in this package.
