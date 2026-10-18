# ETR-02 / ETR-03 Candidate provenance and reconciliation ledger

Status: PARTIAL — verified candidate bytes and initial repository boundaries, not semantic release approval.
Observed 2026-10-18; candidate generated 2026-10-18.

## Candidate recovered and checked

Artifact: `FrankAI-Enterprise-Taxonomy-Registry-v1.0.0-candidate.zip` (conversation artifact, not a GitHub source of truth).
Candidate payload `data/registry.json` SHA-256: `4461b2e2c7e4a7faa2158061b4d1df6e72749f7b5a8abf123aadd37cb4de27eb`.
Manifest SHA-256 entries: 8/8 matched; ZIP CRC passed; 31 schemes; 196 concepts; Python unit suite 5/5 PASS. All candidate terms still labelled candidate and not yet approved.
Do NOT regenerate candidate terms from this ledger: import the exact verified original bytes only after attaching that source package and recording archival custody.

## Discovered owner boundaries

- `kuhnseelmee/frankai.online` README identifies itself as canonical platform repository.
- `frankai-online/frankai.online` README identifies an independent private Sites control-plane workspace.
- `frankai-online/agents.frankai.online` is a distinct agent repository.
- `lib/platform/config.ts` already owns `PlatformAgent.runtimeState`, `authorityLevel`, `GovernanceChecklistItem.riskLevel` and `GovernanceChecklistStatus`. Taxonomy is descriptive classification only and **must not replace** those field-level contracts or dictate privilege.
- `services/orchestrator/src/server.ts` owns service invocation and model adapter behavior, not the taxonomy.
- Current `lib/taxonomy/registry.ts` is a preliminary adapter using camelCase normalization and a `slug` field. Candidate schema instead uses `scheme_id`, `preferred_label`, `broader` and IDs such as `FAI-TAX-AGT-ORCHESTRATOR`. **Adapter is NOT yet candidate-compatible.** Do not use it to claim candidate ingestion passed.

## Exact candidate schemes (31)

`FAI-TAX-AGT`, `FAI-TAX-ROL`, `FAI-TAX-SKL`, `FAI-TAX-WFL`, `FAI-TAX-OPS`, `FAI-TAX-INV`, `FAI-TAX-TOL`, `FAI-TAX-CON`, `FAI-TAX-CAP`, `FAI-TAX-POL`, `FAI-TAX-GOV`, `FAI-TAX-CTR`, `FAI-TAX-ASN`, `FAI-TAX-MEM`, `FAI-TAX-EVD`, `FAI-TAX-PRV`, `FAI-TAX-DAT`, `FAI-TAX-RISK`, `FAI-TAX-AUT`, `FAI-TAX-EXE`, `FAI-TAX-VER`, `FAI-TAX-ART`, `FAI-TAX-ENV`, `FAI-TAX-SEC`, `FAI-TAX-OBS`, `FAI-TAX-LFC`, `FAI-TAX-TEN`, `FAI-TAX-QAL`, `FAI-TAX-IPR`, `FAI-TAX-DEP`, `FAI-TAX-DEC`.

## Crosswalk blockers requiring reconciliation

| Existing authoritative property | Candidate scheme | Decision |
|---|---|---|
| `PlatformAgent.runtimeState` (staged/sandbox/pilot/active/blocked) | EXE or LFC | UNRESOLVED — different entity semantics; do not merge |
| `PlatformAgent.authorityLevel` (observe/prepare/execute_with_approval/routine_autonomy) | AUT | UNRESOLVED — taxonomy must not assign authority |
| `GovernanceChecklistItem.riskLevel` (low/moderate/high/critical) | RISK | Candidate descriptive mapping only; confirm owner/policy semantics |
| `GovernanceChecklistStatus` (not_started/in_progress/blocked/ready_for_review/approved/deferred) | LFC, VER, DEC | UNRESOLVED — not equivalent state machines |
| `services/orchestrator` request/dispatch | INV, EXE | UNRESOLVED — runtime interface remains authoritative |

## Release blocker and next implementation

1. Place exact original candidate JSON and manifest in approved tracked immutable snapshot paths, or in immutable object storage with repository-pinned digest and retrieval contract; do not manually retype it.
2. Build a pure, tested adapter for the candidate's actual snake_case structure; run candidate-wide validation against **all** 196 concepts.
3. Record explicit classification mappings with canonical owning source links, version and human review. No default equivalence across lifecycle, runtime, authority or verification labels.
4. Run repository test, lint, typecheck and security checks; capture exact commit and independent reviewer decision.
5. Keep draft PR unmerged. No runtime dispatch, publishing, or policy writes.

Evidence distinction: candidate local suite passed; repository CI/typecheck, cross-registry tests and independent review NOT RUN.
