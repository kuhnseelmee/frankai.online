import assert from "node:assert/strict";
import test from "node:test";
import { resolveTaxonomyConcept, validateTaxonomySnapshot, type TaxonomySnapshot } from "../../lib/taxonomy/registry";

const snapshot: TaxonomySnapshot = {
  registryVersion: "1.0.0",
  schemes: [{ id: "FAI-TAX-RISK", code: "RISK", label: "Risk", description: "Descriptive risk classification" }],
  concepts: [{ id: "FAI-TAX-RISK-HIGH", schemeId: "FAI-TAX-RISK", slug: "high", preferredLabel: "High", definition: "High classified risk; no implied execution permission", status: "active" }],
};
test("valid snapshot and read-only resolution", () => {
  assert.deepEqual(validateTaxonomySnapshot(snapshot), []);
  assert.equal(resolveTaxonomyConcept(snapshot, "FAI-TAX-RISK", "FAI-TAX-RISK-HIGH").ok, true);
  assert.deepEqual(Object.keys(resolveTaxonomyConcept(snapshot, "FAI-TAX-RISK", "FAI-TAX-RISK-HIGH")).sort(), ["concept", "ok"]);
});
test("classification does not grant permissions", () => {
  const result = resolveTaxonomyConcept(snapshot, "FAI-TAX-RISK", "FAI-TAX-RISK-HIGH");
  assert.equal("permission" in result, false);
  assert.equal("authorized" in result, false);
});
test("unknown terms fail closed", () => {
  assert.deepEqual(resolveTaxonomyConcept(snapshot, "FAI-TAX-RISK", "FAI-TAX-RISK-UNKNOWN"), { ok: false, code: "UNKNOWN_CONCEPT" });
});
test("invalid ancestry is rejected", () => {
  const broken: TaxonomySnapshot = { ...snapshot, concepts: [{ ...snapshot.concepts[0], parentId: "FAI-TAX-RISK-HIGH" }] };
  assert.ok(validateTaxonomySnapshot(broken).some(e => e.includes("cycle")));
});
test("unapproved/deprecated labels cannot resolve active", () => {
  const draft: TaxonomySnapshot = { ...snapshot, concepts: [{ ...snapshot.concepts[0], status: "draft" }] };
  assert.deepEqual(resolveTaxonomyConcept(draft, "FAI-TAX-RISK", "FAI-TAX-RISK-HIGH"), { ok: false, code: "DEPRECATED_CONCEPT" });
});
