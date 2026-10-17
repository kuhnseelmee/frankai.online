import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
const data = JSON.parse(readFileSync(new URL('../docs/architecture/fra-dom-001/catalogue.json', import.meta.url),'utf8'))
test('catalogue identity and counts',()=>{assert.equal(data.domains.length,32);assert.equal(data.hostnames.length,33);assert.equal(new Set(data.domains.map((d:{id:string})=>d.id)).size,32);assert.equal(new Set(data.hostnames.map((h:{hostname:string})=>h.hostname)).size,33)})
test('all hostnames remain proposed and unverified',()=>{const ids=new Set(data.domains.map((d:{id:string})=>d.id));for(const h of data.hostnames){assert.ok(ids.has(h.domain_id));assert.equal(h.exposure,'UNPUBLISHED');assert.equal(h.verification_status,'UNVERIFIED');assert.equal(h.environment,'PROPOSED');assert.match(h.hostname,/^[a-z0-9.-]+$/)}})
