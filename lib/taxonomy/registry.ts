/** FrankAI ETR: purely descriptive, non-authorizing taxonomy contract. */
export type ConceptStatus = "draft" | "active" | "deprecated" | "retired";
export type TaxonomyScheme = {
  id: string;
  code: string;
  label: string;
  description: string;
};
export type TaxonomyConcept = {
  id: string;
  schemeId: string;
  slug: string;
  preferredLabel: string;
  definition: string;
  status: ConceptStatus;
  parentId?: string;
  replacedById?: string;
};
export type TaxonomySnapshot = {
  registryVersion: string;
  schemes: readonly TaxonomyScheme[];
  concepts: readonly TaxonomyConcept[];
};
export type TaxonomyErrorCode =
  | "UNKNOWN_SCHEME" | "UNKNOWN_CONCEPT" | "SCHEME_MISMATCH"
  | "DEPRECATED_CONCEPT" | "INVALID_REGISTRY";
export type TaxonomyResult =
  | { ok: true; concept: TaxonomyConcept }
  | { ok: false; code: TaxonomyErrorCode };

const schemePattern = /^FAI-TAX-[A-Z0-9]{2,12}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[a-zA-Z0-9.-]+)?$/;

/** Validate one immutable snapshot before a consumer trusts its classification metadata. */
export function validateTaxonomySnapshot(snapshot: TaxonomySnapshot): string[] {
  const errors: string[] = [];
  if (!semverPattern.test(snapshot.registryVersion)) errors.push("invalid version");
  const schemeIds = new Set<string>();
  const codes = new Set<string>();
  for (const s of snapshot.schemes) {
    if (!schemePattern.test(s.id) || s.id !== `FAI-TAX-${s.code}`) errors.push(`invalid scheme id: ${s.id}`);
    if (schemeIds.has(s.id) || codes.has(s.code)) errors.push(`duplicate scheme: ${s.id}`);
    if (!s.label.trim() || !s.description.trim()) errors.push(`empty scheme definition: ${s.id}`);
    schemeIds.add(s.id); codes.add(s.code);
  }
  const concepts = new Map<string, TaxonomyConcept>();
  for (const c of snapshot.concepts) {
    if (!schemeIds.has(c.schemeId)) errors.push(`unknown scheme: ${c.id}`);
    if (!slugPattern.test(c.slug) || c.id !== `${c.schemeId}-${c.slug.toUpperCase().replaceAll("-", "_")}`) errors.push(`invalid concept id: ${c.id}`);
    if (concepts.has(c.id)) errors.push(`duplicate concept: ${c.id}`);
    if (!c.preferredLabel.trim() || !c.definition.trim()) errors.push(`empty concept definition: ${c.id}`);
    concepts.set(c.id, c);
  }
  for (const c of snapshot.concepts) {
    if (c.parentId) {
      const p = concepts.get(c.parentId);
      if (!p || p.schemeId !== c.schemeId) errors.push(`invalid parent: ${c.id}`);
    }
    if (c.replacedById && (!concepts.has(c.replacedById) || c.replacedById === c.id)) errors.push(`invalid replacement: ${c.id}`);
    const seen = new Set<string>([c.id]);
    let cursor = c.parentId;
    while (cursor) {
      if (seen.has(cursor)) { errors.push(`parent cycle: ${c.id}`); break; }
      seen.add(cursor);
      cursor = concepts.get(cursor)?.parentId;
    }
  }
  return errors;
}

/** A classifier lookup deliberately cannot return grants or permissions. */
export function resolveTaxonomyConcept(
  snapshot: TaxonomySnapshot, schemeId: string, conceptId: string,
): TaxonomyResult {
  if (validateTaxonomySnapshot(snapshot).length) return { ok: false, code: "INVALID_REGISTRY" };
  if (!snapshot.schemes.some(s => s.id === schemeId)) return { ok: false, code: "UNKNOWN_SCHEME" };
  const concept = snapshot.concepts.find(c => c.id === conceptId);
  if (!concept) return { ok: false, code: "UNKNOWN_CONCEPT" };
  if (concept.schemeId !== schemeId) return { ok: false, code: "SCHEME_MISMATCH" };
  if (concept.status !== "active") return { ok: false, code: "DEPRECATED_CONCEPT" };
  return { ok: true, concept };
}
