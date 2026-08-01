# Dependency security review — staging acceptance

Audit run: 2026-08-01 using `npm audit --omit=dev`. No `npm audit fix --force`
was used. The current production-only audit reports 0 critical, 3 high, 0
moderate, and 0 low findings. Reachability remains under review.

| Package/path | Version | Context | Classification | Action |
|---|---:|---|---|---|
| `next` | 16.2.12 | production runtime; advisories arrive through bundled `postcss`/`sharp` | POTENTIALLY_REACHABLE | Narrow Next.js patch applied; remaining bundled advisory requires upstream/package review |
| `nodemailer` | 9.0.3 | production SMTP path | NOT_REACHABLE for listed vulnerable versions | Patched release applied; SMTP smoke passed |
| `@playwright/test`, `playwright` | 1.62.0 | development-only browser tests | DEVELOPMENT_ONLY | Patched test tooling applied |
| `eslint`, `eslint-config-next`, plugins | installed lockfile versions | development-only lint tooling | DEVELOPMENT_ONLY | Major upgrade deferred; lint remains clean |
| `brace-expansion`, `minimatch`, `js-yaml` | transitive | development tooling | DEVELOPMENT_ONLY | No uncontrolled major upgrade |
| `postcss`, `sharp` | Next.js transitive/native | build/image pipeline | POTENTIALLY_REACHABLE | Current Next.js patch applied; upstream compatibility review remains |

The earlier report of 13 high findings is historical and does not match the
current production-only result. The current Next.js/PostCSS/sharp findings are
not dismissed solely because they are transitive; the final release must either
remediate them or carry a documented formal risk acceptance before production
remediation.
