# Enterprise Taxonomy Registry (ETR) — integration contract

Status: **candidate / review required**. Release: **1.0.0-candidate**. Owner: FrankAI platform architecture. Implementing branch: `feat/etr-01-taxonomy-integration`.

## Decision and scope

The canonical platform repository `kuhnseelmee/frankai.online` owns the controlled classification vocabulary. The private control-plane Sites workspace (`frankai-online/frankai.online`) and agent registry (`frankai-online/agents.frankai.online`) are consumers, not competing masters. Existing agent, workflow, tool, policy, approval and evidence registries continue to own their records. ETR exclusively owns taxonomic schemes, controlled concepts, relationships, status, version and deprecation mappings.

This repository integration establishes a **non-authorizing, data-only classification boundary**. It does not publish a vocabulary to production, grant capabilities, change policy decisions, migrate data or change agent invocation. Initial seed is deliberately limited pending exact reconciliation of the 31-scheme/196-concept candidate package; importing or rewording the candidate without review is prohibited.

## Identity, namespace and version

- Scheme ID: `FAI-TAX-<SCHEME>`; concept ID: `FAI-TAX-<SCHEME>-<SLUG>`, stable and never reused.
- Scheme code: 2–12 uppercase alphanumeric characters. Slugs: lowercase kebab-case.
- Vocabulary version: SemVer. Any meaning-changing replacement requires a major version; additive terms may be minor; typo/metadata corrections may be patch only when semantics remain unchanged.
- Vocabulary snapshot is content-addressed using deterministic SHA-256 of canonical JSON, separately from Git commit SHA.
- Consumers pin `registryVersion` plus `digest`; unpinned or mismatched snapshots must fail validation.
- A retired concept retains its ID and maps to an explicit replacement if available; never silently reassign.
- Per-record classifications reference canonical term IDs; no duplicated mutable term text.

## Authority and decision boundaries

`taxonomy label → metadata only` and never `taxonomy label → privilege`. Policy, RBAC/ABAC, approval grants and runtime tool permissions remain independent enforcement points. Classification of risk or sensitivity is descriptive input; security-enforced thresholds are defined and approved in the policy registry.

Publish transition: DRAFT → PROPOSED → REVIEWED → APPROVED → RELEASED → DEPRECATED → RETIRED. Reject unauthorized skips. Maintain author, reviewer, independent verifier, evidence links, timestamp, source commit, digest, compatibility report and rollback reference.

## Integration contract

Read-only interface (future endpoint, **not implemented**): `GET /api/registry/taxonomy/versions/{version}`; `GET /api/registry/taxonomy/concepts/{id}?version=...`. Write requests go through repository change control, not runtime agent APIs.

Consumers must validate foreign-key references against a pinned release, check scheme membership and active/deprecated status, and emit structured errors: `UNKNOWN_SCHEME`, `UNKNOWN_CONCEPT`, `SCHEME_MISMATCH`, `VERSION_MISMATCH`, `DIGEST_MISMATCH`, `DEPRECATED_CONCEPT`. Unknown classification is never inferred from free text. Reject unknown classifications on governance-critical paths; presentation-only consumers can render 'unclassified' with warnings.

## Reconciliation gates

1. Enumerate existing registries and their owners and schemas. Capture source commits; classify name collisions.
2. Extract original candidate ZIP `FrankAI-Enterprise-Taxonomy-Registry-v1.0.0-candidate.zip` under offline workspace; verify manifest and all tests; compare exact concept definitions and 31 schemes. Candidate is not yet committed to this repo.
3. Record mapping `source_registry + existing_value → concept_id`; classify as exact / alias / disputed / missing. Reject ambiguous mappings.
4. Review terminology, owner approval, backward compatibility, tenant isolation, security effects and licensing.
5. Independent Auditor tests controlled seed, full candidate import, consumer lookups, policy non-escalation, migrations, recovery, rollback and signed release provenance.
6. Merge only after required review and CI. Publish a versioned snapshot in an independently authorized release; deploy only under a separate production gate.

## Acceptance tests

- IDs unique, stable, syntax-valid and unambiguous; all parent/replacement references resolve and no ancestry cycles.
- No duplicate ownership, no embedded credentials, no customer/private evidence or executable instruction in vocabulary data.
- Changing classification cannot independently authorize a tool invocation or bypass human approval.
- Snapshot selection detects unknown version and digest mismatch; historical snapshots remain immutable.
- Full 31/196 candidate and downstream adapters acceptance remains **NOT RUN** until imported and independently verified.

## Rollback and operations

Revert the referencing consumer to its previously pinned released vocabulary; do not delete old snapshots or rewrite classification history. Stop rollout on semantic collision or failed policy boundary test. Keep separate operation audit records and restore tested signed archives.

## Explicit non-claims

This document and branch do not constitute production registration, a published taxonomy API, migrations, full 196-concept adoption, CI acceptance, or an independent audit.
