# Dependency security review — staging acceptance

Audit run: 2026-07-30 using the npm advisory service. No `npm audit fix --force`
was used.

| Package/path | Version | Context | Classification | Action |
|---|---:|---|---|---|
| `next` | 16.2.12 | production runtime; advisories arrive through bundled `postcss`/`sharp` | POTENTIALLY_REACHABLE | Narrow Next.js patch applied; remaining bundled advisory requires upstream/package review |
| `nodemailer` | 9.0.3 | production SMTP path | NOT_REACHABLE for listed vulnerable versions | Patched release applied; SMTP smoke passed |
| `@playwright/test`, `playwright` | 1.62.0 | development-only browser tests | DEVELOPMENT_ONLY | Patched test tooling applied |
| `eslint`, `eslint-config-next`, plugins | installed lockfile versions | development-only lint tooling | DEVELOPMENT_ONLY | Major upgrade deferred; lint remains clean |
| `brace-expansion`, `minimatch`, `js-yaml` | transitive | development tooling | DEVELOPMENT_ONLY | No uncontrolled major upgrade |
| `postcss`, `sharp` | Next.js transitive/native | build/image pipeline | POTENTIALLY_REACHABLE | Current Next.js patch applied; upstream compatibility review remains |

The final audit reports 13 high findings, all either development-only tooling or
transitive dependencies of the Next.js build/runtime stack. No critical findings
are reported. Production activation should re-run this review against the final
release lockfile and resolve any newly reachable advisory before cutover.
