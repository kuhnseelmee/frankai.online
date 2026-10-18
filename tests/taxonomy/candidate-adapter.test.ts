import assert from "node:assert/strict";
import test from "node:test";
import { adaptCandidateEnvelope, type CandidateEnvelope } from "../../lib/taxonomy/candidate-adapter";
import { resolveTaxonomyConcept } from "../../lib/taxonomy/registry";

const candidate: CandidateEnvelope = {
  registry_id: "FAI-ETR",
  version: "1.0.0",
  release_status: "candidate",
  schemes: [{id:"FAI-TAX-AGT",name:"Agent",description:"Classifies agents",owner_role:"TaxonomySteward",status:"active",version:"1.0.0"}],
  concepts: [{id:"FAI-TAX-AGT-ORCHESTRATOR",scheme_id:"FAI-TAX-AGT",preferred_label:"Orchestrator",definition:"Descriptive role",broader:null,aliases:[],status:"active",introduced_in:"1.0.0",external_mappings:[]}],
};
test("candidate envelope preserves IDs and source labels without granting authority", () => {
 const snapshot=adaptCandidateEnvelope(candidate);
 assert.equal(snapshot.concepts[0].id,"FAI-TAX-AGT-ORCHESTRATOR");
 assert.equal(snapshot.concepts[0].preferredLabel,"Orchestrator");
 const result=resolveTaxonomyConcept(snapshot,"FAI-TAX-AGT","FAI-TAX-AGT-ORCHESTRATOR");
 assert.equal(result.ok,true);
 assert.equal("authorized" in result,false);
});
test("candidate envelope rejects unexpected release status", () => {
 assert.throws(()=>adaptCandidateEnvelope({...candidate,release_status:"released"}),/INVALID_CANDIDATE_ENVELOPE/);
});
test("adapter rejects broken ancestry",()=>{
 assert.throws(()=>adaptCandidateEnvelope({...candidate,concepts:[{...candidate.concepts[0],broader:"FAI-TAX-AGT-NOT-FOUND"}]}),/INVALID_CANDIDATE_TAXONOMY/);
});
