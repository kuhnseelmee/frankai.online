# Public portfolio reconciliation

Reviewed 17 September 2026. This matrix records the evidence decision behind the public
portfolio registry in `lib/portfolio.ts`. The registry is intentionally public-safe and does
not contain internal names, client identities, private URLs or infrastructure metadata.

| Candidate | Decision | Evidence basis | Public treatment |
| --- | --- | --- | --- |
| FrankAI Core Platform | Existing — accurate | Next.js application, authenticated routes, MFA/recovery routes, platform control-plane code, build and authentication tests | Platform; Operational / evolving |
| AI Consulting | Existing — accurate | `app/services/ai-consulting`, `lib/ai-consulting.ts`, browser coverage and production build | Service; professional capability |
| Agent Prompt Hub | New — supported | `config/agents/README.md`, `agents/frank-core/`, agent source and prompt definition | Platform; Active Development |
| Job Tracker | Insufficient evidence | No implementation, authoritative documentation or verified public route found in this repository | Omitted from public registry |
| Care Operations & Compliance Platform | Existing — requires update | Existing evidence/compliance platform documentation and prior public project register; no certification or client attribution established | Platform; Active Development; architecture-level language |
| Private Advocacy Intelligence Platform | Private / anonymised | Candidate architecture supplied for reconciliation; no private implementation details published | Platform; Private · Active Development |
| DroidSMS | Research / experimental | Existing `lib/current-work.ts` project notes; no DroidSMS implementation source found in this repository | Platform; Research / prototype notes |
| OpenWA | Existing — requires update | Existing integration routes and deployment documentation | Lab; Pilot; no maturity overclaim |
| ServiceDesk | Existing — requires update | Existing platform configuration and prior public page references | Lab; Pilot; experimental service-management language |
| LangGraph Orchestration | Research / experimental | Candidate capability only; no LangGraph dependency or implementation found in this repository | Lab; Research direction |
| Local / Private AI | Research / experimental | Existing local-AI architectural references; no measured model results found | Lab; Research; no quality claims |
| FrankAI Context Engineering Method | New — supported | Existing agent prompt, research workflow and repository operating practices | Method; reusable method |
| Reticulum / Resilient Communications Research | Research / experimental | Candidate research direction only; no Reticulum implementation found | Lab; Research |

## Existing website inconsistencies resolved

- Replaced duplicated homepage, Proof, Solutions and Trust inventories with the canonical
  public registry where practical.
- Removed stale “live product” and “deployment proof” framing from the main discovery paths.
- Kept authenticated, administrative and API routes unchanged.
- Retained legacy source modules that may support other workflows; they are not imported by
  the new public portfolio pages.
