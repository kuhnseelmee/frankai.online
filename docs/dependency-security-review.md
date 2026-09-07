# Dependency security review - production closure

Latest audit run: 2026-09-05 using `npm audit --omit=dev`.

The current production-only audit reports 0 critical, 0 high, 0 moderate, and
0 low findings. No `npm audit fix --force` was used.

| Package/path | Version | Context | Classification | Action |
|---|---:|---|---|---|
| `next` | 16.3.0 | production runtime | CLEAN_CURRENT_AUDIT | Retained current patched runtime line |
| `nodemailer` | 9.0.3 | production SMTP path | NOT_REACHABLE for listed vulnerable versions | Patched release applied; SMTP smoke passed |
| `@playwright/test`, `playwright` | 1.62.0 | development-only browser tests | DEVELOPMENT_ONLY | Patched test tooling applied |
| `eslint`, `eslint-config-next`, plugins | installed lockfile versions | development-only lint tooling | DEVELOPMENT_ONLY | Major upgrade deferred; lint remains clean |
| `brace-expansion`, `minimatch`, `js-yaml` | transitive | development tooling | DEVELOPMENT_ONLY | No uncontrolled major upgrade |
| `postcss` | 8.5.23 | build/image pipeline transitive | CLEAN_CURRENT_AUDIT | Patched through override |
| `sharp` | 0.35.3 | Next image pipeline | CLEAN_CURRENT_AUDIT | Patched lockfile package |
| `fastify` | 5.12.3 | private API/orchestrator slice | CLEAN_CURRENT_AUDIT | Patched from 5.11.2 |
| `fast-uri` | 3.1.7 / 4.1.4 nested | Fastify/AJV/serializer transitive | CLEAN_CURRENT_AUDIT | Patched by `npm audit fix` |

The earlier report of 13 high findings is historical and does not match the
current production-only result. The later Fastify/fast-uri findings observed
on 2026-09-05 were remediated through a narrow Fastify update and lockfile
refresh. The guarded production deployment completed after lint, build,
service restart, and readiness checks.
