# FrankAI public portfolio reconciliation

Date: 2026-09-19

This record explains which candidate initiatives are represented in the public
FrankAI portfolio and why. It contains public-safe evidence summaries only. It
does not identify private participants, organisations, repositories, records,
infrastructure or access details.

## Publication rule

A public entry requires identifiable implementation, deployment or authoritative
documentation evidence. Its maturity is limited by the weakest material boundary.
A domain, design concept or project name alone is not evidence of an operational
system.

## Reconciliation matrix

| Candidate | Classification | Public decision | Evidence basis |
| --- | --- | --- | --- |
| FrankAI Core Platform | Existing — supported | Platform · Operational | Implemented application, authenticated boundaries, tests and operating documentation. |
| AI Consulting & Agentic Systems | Existing — supported | Service · Available | Defined delivery model grounded in the platforms and methods represented by this portfolio. |
| Agent Prompt Hub | New — supported | Platform · Active Development | Implemented registry model, lifecycle documentation and application architecture. Public endpoint withheld pending release verification. |
| raywooler.online | Existing — supported | Platform · Operational | Live professional site plus implementation repository covering its public, administrative, data and security surfaces. |
| Career Tracker | Existing — supported | Platform · Operational | Owned deployed application and implemented workflow surface. |
| CareEpoch | Private implementation / public-safe identity | Platform · Active Development | Private implementation, integration and governance evidence reviewed; provider, participant and operational identities withheld. |
| Inspect Pro | Existing — supported | Platform · Active Development | Substantive implementation repository covering inspections, documents, reporting, compliance, authentication and data workflows. No public application endpoint claimed. |
| Private Advocacy Intelligence Platform | Private / anonymised | Platform · Active Development | Private application, security and preservation architecture reviewed; only neutral architecture is public. |
| OpenWA | Existing — requires qualification | Lab · Pilot | Public endpoint verified; claims bounded to messaging-integration pilot behaviour. |
| Frank ServiceDesk | Existing — requires qualification | Platform · Pilot | Public MVP verified; broader production claims withheld. |
| Local & Private AI | Research / experimental | Lab · Research | Documented local-model evaluation and governed pilot work. |
| FrankAI Context Engineering Method | New — supported | Method · Operational | Reusable, versioned method applied across research, writing, planning and engineering. |
| MultiStream | Existing — supported with qualification | Lab · Pilot | Substantive restreaming implementation repository and public deployment verified; known operating limits keep the claim at pilot maturity. |
| AndroidLab Control Room | Existing — supported | Lab · Active Development | Repository-maintained current-work evidence describes implemented local network, ADB, progress, preset and run-bundle capabilities. |
| SignalLedger | Existing — requires qualification | Platform · Active Development | Implementation records and project material exist; failing endpoint receives no public link. |
| DroidSMS | Insufficient publication evidence | Omitted | Substantive implementation may justify later inclusion, but the evidence package was not available to this release candidate. |
| TraderBot | Insufficient publication evidence | Omitted | A public-facing concept did not establish current implementation maturity. |
| LangGraph orchestration | Research direction only | Omitted | No authoritative public implementation package was available. |
| Reticulum research | Research direction only | Omitted | No substantive implementation or research record was available. |

## Privacy boundary

Private case studies use generic titles and architecture-level descriptions.
They expose no personal information, care-provider identity, case evidence,
private URL, repository location or access detail.

## Link boundary

Only intentionally public endpoints verified during reconciliation receive
outbound links. A retained portfolio entry may have no link when the endpoint is
private, broken or not yet verified.

## Maintenance rule

`lib/portfolio.ts` is the canonical public model. Portfolio pages, project
profiles, maturity displays and Current Development must derive from it rather
than maintaining independent project arrays.
