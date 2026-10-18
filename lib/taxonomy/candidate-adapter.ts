/**
 * Adapt the immutable ETR v1 source envelope to the read-only internal lookup model.
 * This does not normalize authoritative platform enums, authorize actions, or publish.
 */
import { validateTaxonomySnapshot, type TaxonomySnapshot } from "./registry";

export type CandidateScheme = {
  id: string; name: string; description: string; owner_role: string;
  status: string; version: string;
};
export type CandidateConcept = {
  id: string; scheme_id: string; preferred_label: string; definition: string;
  broader: string | null; aliases: readonly string[]; status: string;
  introduced_in: string; external_mappings: readonly unknown[];
};
export type CandidateEnvelope = {
  registry_id: string; version: string; release_status: string;
  schemes: readonly CandidateScheme[]; concepts: readonly CandidateConcept[];
};
const statuses = new Set(["draft", "active", "deprecated", "retired"]);
export function adaptCandidateEnvelope(input: CandidateEnvelope): TaxonomySnapshot {
  if (input.registry_id !== "FAI-ETR" || input.release_status !== "candidate") {
    throw new Error("INVALID_CANDIDATE_ENVELOPE");
  }
  const seen = new Set<string>();
  const schemes = input.schemes.map(s => {
    if (seen.has(s.id)) throw new Error("DUPLICATE_SCHEME");
    seen.add(s.id);
    return { id: s.id, code: s.id.replace(/^FAI-TAX-/, ""), label: s.name, description: s.description };
  });
  const concepts = input.concepts.map(c => {
    if (!statuses.has(c.status)) throw new Error("INVALID_CANDIDATE_STATUS");
    if (!c.id.startsWith(c.scheme_id + "-")) throw new Error("INVALID_CANDIDATE_CONCEPT");
    return {
      id: c.id,
      schemeId: c.scheme_id,
      slug: c.id.slice(c.scheme_id.length + 1).toLowerCase().replaceAll("_", "-"),
      preferredLabel: c.preferred_label,
      definition: c.definition,
      status: c.status as "draft" | "active" | "deprecated" | "retired",
      ...(c.broader ? { parentId: c.broader } : {}),
    };
  });
  const snapshot: TaxonomySnapshot = { registryVersion: input.version, schemes, concepts };
  const errors = validateTaxonomySnapshot(snapshot);
  if (errors.length) throw new Error("INVALID_CANDIDATE_TAXONOMY: " + errors.join("; "));
  return snapshot;
}
