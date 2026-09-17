export type PortfolioCategory = 'Platform' | 'Service' | 'Method' | 'Lab'
export type PortfolioStatus =
  | 'Operational'
  | 'Active Development'
  | 'Pilot'
  | 'Research'
  | 'Private'
  | 'Concept'

export type PortfolioItem = {
  id: string
  slug: string
  name: string
  category: PortfolioCategory
  status: PortfolioStatus
  visibility: 'Public' | 'Private'
  shortDescription: string
  longDescription: string
  capabilities: string[]
  technologies: string[]
  publicLinks?: { label: string; href: string }[]
  featured?: boolean
  maturity: string
  nowLane: 'Building' | 'Validating' | 'Operating' | 'Researching'
  tags: string[]
}

// Public-safe source of truth. Do not add internal project names, private URLs,
// people, organisations, evidence or infrastructure identifiers here.
export const portfolio: PortfolioItem[] = [
  {
    id: 'frankai-core', slug: 'frankai-core', name: 'FrankAI Core Platform', category: 'Platform', status: 'Operational', visibility: 'Public',
    shortDescription: 'An evolving first-party platform for human-directed, AI-assisted engineering and governed operation.',
    longDescription: 'FrankAI combines authenticated application workflows, AI orchestration, secure identity boundaries and evidence-aware operating practices in one evolving platform.',
    capabilities: ['Secure identity workflows', 'MFA and recovery', 'Session and administrative boundaries', 'AI orchestration', 'Governed deployment'],
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'OpenAI API'], publicLinks: [{ label: 'Visit FrankAI', href: 'https://frankai.online' }], featured: true, maturity: 'Operational / evolving', nowLane: 'Operating', tags: ['governance', 'platform']
  },
  {
    id: 'ai-consulting', slug: 'ai-consulting', name: 'AI Consulting', category: 'Service', status: 'Operational', visibility: 'Public',
    shortDescription: 'Practical architecture and implementation for governed AI, automation and information systems.',
    longDescription: 'Engagements can range from readiness and workflow analysis through focused implementation, integration, evaluation and platform engineering.',
    capabilities: ['AI solution architecture', 'Workflow analysis', 'Governed agents', 'Systems integration', 'Context engineering', 'AI governance'], technologies: ['Architecture review', 'APIs', 'Data systems'], publicLinks: [{ label: 'Explore consulting', href: '/services/ai-consulting' }], featured: true, maturity: 'Professional capability', nowLane: 'Building', tags: ['consulting', 'architecture']
  },
  {
    id: 'agent-prompt-hub', slug: 'agent-prompt-hub', name: 'Agent Prompt Hub', category: 'Platform', status: 'Active Development', visibility: 'Public',
    shortDescription: 'Governed infrastructure for project-scoped, version-controlled agent definitions.',
    longDescription: 'Agents are treated as governed software assets with explicit project boundaries, reusable definitions and consistent orchestration patterns.',
    capabilities: ['Project-scoped agents', 'Prompt and version management', 'Source-controlled definitions', 'Separated project contexts'], technologies: ['Agent orchestration', 'Version control'], maturity: 'Active development', nowLane: 'Building', tags: ['agents', 'governance']
  },
  {
    id: 'care-operations', slug: 'care-operations', name: 'Care Operations & Compliance Platform', category: 'Platform', status: 'Active Development', visibility: 'Public',
    shortDescription: 'A sovereign care-operations architecture for workflows, Proof-of-Care concepts, evidence and governed reporting.',
    longDescription: 'This public summary focuses on architecture: operational workflows, participant-safety documentation, property and compliance workflows, integrations and governed AI. Current implementation and roadmap capability remain distinct.',
    capabilities: ['Operational workflows', 'Proof-of-Care concepts', 'Evidence and reporting', 'Compliance-oriented records', 'Governed AI'], technologies: ['Sovereign architecture', 'Evidence systems'], maturity: 'Active development', nowLane: 'Validating', tags: ['care', 'compliance', 'sovereignty']
  },
  {
    id: 'private-advocacy', slug: 'private-advocacy', name: 'Private Advocacy Intelligence Platform', category: 'Platform', status: 'Active Development', visibility: 'Private',
    shortDescription: 'A privately operated evidence and advocacy system designed for provenance, continuity and governed analysis.',
    longDescription: 'The public description is intentionally limited to architecture: evidence lineage, temporal reconstruction, document indexing, access governance, preservation, independent recovery and controlled AI access.',
    capabilities: ['Evidence provenance', 'Temporal analysis', 'Document indexing', 'Role separation', 'Auditability', 'Backup and recovery'], technologies: ['Evidence-centric systems', 'Governed AI'], maturity: 'Private / active development', nowLane: 'Validating', tags: ['private', 'evidence', 'recovery']
  },
  {
    id: 'droidsms', slug: 'droidsms', name: 'DroidSMS', category: 'Platform', status: 'Research', visibility: 'Public',
    shortDescription: 'A sovereign local Android messaging workflow focused on durable acknowledgement and execution certainty.',
    longDescription: 'DroidSMS explores how Android and ADB workflows can separate accepted intent, execution, delivery outcome and operator review while retaining a durable message ledger.',
    capabilities: ['Android / ADB integration', 'Deduplication', 'Message ledger', 'Operator review', 'Retention and recovery'], technologies: ['Android', 'ADB', 'Local-first workflows'], maturity: 'Prototype notes / research', nowLane: 'Researching', tags: ['android', 'messaging', 'local']
  },
  {
    id: 'openwa', slug: 'openwa', name: 'OpenWA', category: 'Lab', status: 'Pilot', visibility: 'Public', shortDescription: 'An emerging conversation and agent-workflow project.', longDescription: 'OpenWA explores conversation workflows, triage, controlled action and delivery-certainty mechanisms. It is represented as an emerging project, not a finished general-purpose platform.', capabilities: ['Conversation workflows', 'Triage', 'Controlled action', 'Delivery certainty'], technologies: ['Messaging integration', 'Agent workflows'], maturity: 'Emerging / pilot', nowLane: 'Researching', tags: ['agents', 'messaging']
  },
  {
    id: 'servicedesk', slug: 'servicedesk', name: 'ServiceDesk', category: 'Lab', status: 'Pilot', visibility: 'Public', shortDescription: 'Experimental service-management agent work for triage, knowledge and support operations.', longDescription: 'ServiceDesk explores governed agents for incident triage, knowledge authoring, workflow assistance and support operations.', capabilities: ['Incident triage', 'Knowledge authoring', 'Workflow assistance', 'Support operations'], technologies: ['Agent workflows', 'Web application'], maturity: 'Emerging / pilot', nowLane: 'Researching', tags: ['service', 'agents']
  },
  {
    id: 'langgraph', slug: 'langgraph', name: 'LangGraph Orchestration', category: 'Lab', status: 'Research', visibility: 'Public', shortDescription: 'Research into stateful, multi-step and governed agent workflows.', longDescription: 'LangGraph is a candidate orchestration direction: state management, controlled execution and multi-step workflows. No completed general-purpose platform is claimed.', capabilities: ['Stateful workflows', 'Multi-step orchestration', 'Controlled execution', 'State management'], technologies: ['Orchestration research'], maturity: 'Research direction', nowLane: 'Researching', tags: ['orchestration', 'research']
  },
  {
    id: 'local-private-ai', slug: 'local-private-ai', name: 'Local / Private AI', category: 'Lab', status: 'Research', visibility: 'Public', shortDescription: 'Evaluation of local inference, structured extraction and sovereign processing.', longDescription: 'The lab compares smaller and local models through tested tasks involving schema-constrained output, extraction, recall, accuracy and reliability.', capabilities: ['Local inference', 'Structured extraction', 'Schema-constrained output', 'Model evaluation'], technologies: ['Local models', 'Evaluation workflows'], maturity: 'Research', nowLane: 'Researching', tags: ['local', 'sovereignty', 'evaluation']
  },
  {
    id: 'context-engineering', slug: 'context-engineering', name: 'FrankAI Context Engineering Method', category: 'Method', status: 'Operational', visibility: 'Public', shortDescription: 'A disciplined method for turning ambiguous requests into validated, maintainable work.', longDescription: 'The method treats prompting as context engineering and specification: reconstruct context, define constraints, identify authoritative evidence, fact-check, structure, iterate, preserve continuity and validate the finished result.', capabilities: ['Context reconstruction', 'Constraint definition', 'Evidence checking', 'Continuity', 'Output validation'], technologies: ['Research workflow', 'Specification'], featured: true, maturity: 'Reusable method', nowLane: 'Operating', tags: ['method', 'evidence']
  },
  {
    id: 'reticulum', slug: 'reticulum', name: 'Reticulum / Resilient Communications Research', category: 'Lab', status: 'Research', visibility: 'Public', shortDescription: 'Research into decentralised, resilient and infrastructure-independent communications.', longDescription: 'Reticulum interest remains research until a functioning implementation is demonstrated in the repository.', capabilities: ['Decentralised communications', 'Offline-capable systems', 'Infrastructure independence'], technologies: ['Reticulum'], maturity: 'Research', nowLane: 'Researching', tags: ['resilience', 'sovereignty']
  }
]

export const featuredPortfolio = portfolio.filter((item) => item.featured)
export const currentDevelopment = portfolio.filter((item) => item.nowLane !== 'Operating')
