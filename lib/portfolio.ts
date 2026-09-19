export const portfolioCategories = ['Platform', 'Service', 'Method', 'Lab'] as const
export const portfolioMaturities = [
  'Operational',
  'Available',
  'Active Development',
  'Pilot',
  'Research'
] as const

export type PortfolioCategory = (typeof portfolioCategories)[number]
export type PortfolioMaturity = (typeof portfolioMaturities)[number]
export type PortfolioVisibility = 'Public' | 'Anonymised'

export type PortfolioEntry = {
  slug: string
  name: string
  category: PortfolioCategory
  maturity: PortfolioMaturity
  visibility: PortfolioVisibility
  summary: string
  overview: string
  capabilities: readonly string[]
  evidence: string
  publicUrl?: string
  publicLabel?: string
  featured?: boolean
  current?: boolean
}

/**
 * Canonical, public-safe portfolio registry.
 *
 * Keep private identities, internal URLs, repository locations and operational
 * evidence out of this module. Everything here may be rendered publicly.
 */
export const portfolioEntries: readonly PortfolioEntry[] = [
  {
    slug: 'frankai-core-platform',
    name: 'FrankAI Core Platform',
    category: 'Platform',
    maturity: 'Operational',
    visibility: 'Public',
    summary:
      'The governed first-party foundation for identity, memory, administration, service integration and controlled AI-assisted work.',
    overview:
      'FrankAI Core brings the public practice, authenticated control plane and operational services into one owned system. Its design favours explicit authority, observable behaviour and recoverable releases over broad autonomous access.',
    capabilities: [
      'Invitation, account, session and multi-factor authentication controls',
      'Governed API and administration boundaries',
      'First-party memory, service integration and operational health surfaces',
      'Release, rollback and evidence-oriented operating procedures'
    ],
    evidence:
      'Implemented in the FrankAI application with production builds, security tests, authenticated routes and documented operating controls.',
    featured: true
  },
  {
    slug: 'ai-consulting',
    name: 'AI Consulting & Agentic Systems',
    category: 'Service',
    maturity: 'Available',
    visibility: 'Public',
    summary:
      'Evidence-led advisory, implementation and platform engineering for organisations putting AI into real workflows.',
    overview:
      'FrankAI works from the operating problem outward: identify the decision, evidence, authority and integration boundaries first, then design the smallest reliable AI-enabled system that can be evaluated and governed.',
    capabilities: [
      'AI readiness, use-case selection and implementation planning',
      'Workflow automation and agentic system design',
      'Knowledge retrieval, integration and private AI architecture',
      'Evaluation, governance, observability and production hardening'
    ],
    evidence:
      'The service model is grounded in working FrankAI platforms, documented engineering methods and delivery patterns represented in this portfolio.',
    publicUrl: '/services/ai-consulting',
    publicLabel: 'Explore the service',
    featured: true
  },
  {
    slug: 'agent-prompt-hub',
    name: 'Agent Prompt Hub',
    category: 'Platform',
    maturity: 'Active Development',
    visibility: 'Public',
    summary:
      'A governed registry for reusable agent instructions, project context, lifecycle state and controlled prompt retrieval.',
    overview:
      'The hub is being developed as an owned control surface for organising agent prompts by project and purpose. It treats prompts as versioned operational assets rather than loose text fragments.',
    capabilities: [
      'Project-scoped prompt organisation',
      'Version and lifecycle metadata',
      'Governed retrieval and reuse boundaries',
      'Separation between draft, reviewed and approved instructions'
    ],
    evidence:
      'Supported by implemented registry schemas, lifecycle documentation and a dedicated application architecture; its public endpoint is withheld until release verification is complete.',
    featured: true,
    current: true
  },
  {
    slug: 'raywooler-online',
    name: 'raywooler.online',
    category: 'Platform',
    maturity: 'Operational',
    visibility: 'Public',
    summary:
      'Raymond Wooler\'s professional website and governed service platform for publishing work, receiving enquiries and operating AI-assisted administration.',
    overview:
      'raywooler.online connects Raymond\'s professional profile, services and project evidence to an owned administration surface. It demonstrates how a public site, governed intake, content operations and bounded AI assistance can form one maintainable platform.',
    capabilities: [
      'Professional services, skills and project publishing',
      'Governed contact intake and administration',
      'Configurable AI-assisted support with provider boundaries',
      'Owned deployment, data and operational controls'
    ],
    evidence:
      'The public site is operational and its implementation repository contains the Next.js application, administration controls, database model, security tests and deployment configuration.',
    publicUrl: 'https://raywooler.online',
    publicLabel: 'Visit raywooler.online'
  },
  {
    slug: 'career-tracker',
    name: 'Career Tracker',
    category: 'Platform',
    maturity: 'Operational',
    visibility: 'Public',
    summary:
      'A practical workspace for organising opportunities, applications, preparation and follow-up without losing the human context.',
    overview:
      'Career Tracker turns a fragmented job-search process into a visible workflow. It is designed around usable records, next actions and candidate control rather than opaque automated decision-making.',
    capabilities: [
      'Opportunity and application tracking',
      'Structured progress and next-action views',
      'Interview and follow-up preparation',
      'Independent, user-directed workflow ownership'
    ],
    evidence:
      'The owned application is deployed at its public entry point and was verified during portfolio reconciliation.',
    publicUrl: 'https://jobs.frankai.online',
    publicLabel: 'Open Career Tracker',
    featured: true
  },
  {
    slug: 'careepoch',
    name: 'CareEpoch',
    category: 'Platform',
    maturity: 'Active Development',
    visibility: 'Anonymised',
    summary:
      'A privacy-conscious care operations and compliance platform for coordinating service delivery, evidence, property workflows and accountable reporting.',
    overview:
      'CareEpoch is the public-safe project identity for an anonymised implementation. The work joins operational records, workflow controls and evidence integrity without exposing participant, provider or tenancy information.',
    capabilities: [
      'Role-scoped operational workflows',
      'Evidence-linked service and property records',
      'Compliance-aware reporting and review gates',
      'Integration patterns that preserve source lineage'
    ],
    evidence:
      'Backed by implemented application foundations, integration work, governance documentation and tested data-model components reviewed privately.',
    featured: true,
    current: true
  },
  {
    slug: 'inspect-pro',
    name: 'Inspect Pro',
    category: 'Platform',
    maturity: 'Active Development',
    visibility: 'Public',
    summary:
      'A local-first property management and inspection platform for structured field work, document handling, compliance review and accountable follow-up.',
    overview:
      'Inspect Pro brings property records, inspection workflows, supporting documents and review activity into one operational application. AI-assisted features remain bounded by visible records and human review rather than being presented as independent decision-makers.',
    capabilities: [
      'Scheduled, recurring and comparative inspection workflows',
      'Photo, note, document and PDF reporting surfaces',
      'Compliance checklists, audit views and review controls',
      'Supabase-backed data, authentication and local development workflows'
    ],
    evidence:
      'A substantive implementation repository was reviewed, including inspection, reporting, document, compliance, authentication, database and test surfaces. No public application endpoint is claimed.',
    current: true
  },
  {
    slug: 'private-advocacy-intelligence',
    name: 'Private Advocacy Intelligence Platform',
    category: 'Platform',
    maturity: 'Active Development',
    visibility: 'Anonymised',
    summary:
      'A private evidence and chronology system designed to support accountable advocacy, preservation and independent review.',
    overview:
      'Only the architecture is described publicly. The system is designed around evidence lineage, chronology, governed access, preservation and recoverability; no case identity, health information or private source material is published.',
    capabilities: [
      'Evidence-linked timelines and source indexing',
      'Role-based access and guardian-level governance patterns',
      'Preservation, export and recovery controls',
      'Auditable action and response tracking'
    ],
    evidence:
      'Supported by a private implementation, security tests, governance records and documented preservation architecture reviewed under confidentiality.',
    current: true
  },
  {
    slug: 'openwa',
    name: 'OpenWA',
    category: 'Lab',
    maturity: 'Pilot',
    visibility: 'Public',
    summary:
      'A bounded messaging integration surface for testing controlled assistant events and operator-owned communication workflows.',
    overview:
      'OpenWA demonstrates how messaging can connect to governed systems without implying unrestricted autonomous communication. It remains a pilot while operating boundaries and delivery behaviour continue to be evaluated.',
    capabilities: [
      'Signed integration events',
      'Controlled routing boundaries',
      'Operator-visible messaging workflows',
      'Pilot deployment and recovery discipline'
    ],
    evidence:
      'A public pilot endpoint is deployed and responded successfully during the current reconciliation.',
    publicUrl: 'https://openwa.frankai.online',
    publicLabel: 'Open the pilot'
  },
  {
    slug: 'service-desk',
    name: 'Frank ServiceDesk',
    category: 'Platform',
    maturity: 'Pilot',
    visibility: 'Public',
    summary:
      'A service workflow pilot covering customer intake, bookings, job handling, quotes and progress tracking.',
    overview:
      'ServiceDesk tests a practical operations flow for repair and service work. Its public surface and implemented workflow support pilot status; broader production and customer claims are intentionally withheld.',
    capabilities: [
      'Customer intake and booking workflow',
      'Job status and diagnostic records',
      'Quote and approval flow',
      'Customer-visible progress tracking'
    ],
    evidence:
      'The public MVP is deployed and its own interface identifies the implemented service workflow and remaining scaffolded areas.',
    publicUrl: 'https://servicedesk.frankai.online',
    publicLabel: 'Open ServiceDesk'
  },
  {
    slug: 'local-private-ai',
    name: 'Local & Private AI',
    category: 'Lab',
    maturity: 'Research',
    visibility: 'Public',
    summary:
      'Evaluation of local and hybrid model patterns where privacy, sovereignty or offline control matters more than novelty.',
    overview:
      'This research stream tests where local inference is genuinely useful, what quality trade-offs appear and how private deployments can remain observable and governed. It is not represented as a finished product.',
    capabilities: [
      'Local-model evaluation',
      'Hybrid private/cloud architecture assessment',
      'Structured-output and quality testing',
      'Data-boundary and operational-cost analysis'
    ],
    evidence:
      'Supported by documented local-model evaluations and governed pilot work; claims are limited to research activity.',
    current: true
  },
  {
    slug: 'androidlab-control-room',
    name: 'AndroidLab Control Room',
    category: 'Lab',
    maturity: 'Active Development',
    visibility: 'Public',
    summary:
      'A local browser control room for preparing an Android network lab, provisioning devices over ADB and making run state inspectable.',
    overview:
      'AndroidLab reduces a multi-step device and network setup into a visible operator workflow. It is intentionally represented as a local development control room, not a hosted production service or a general-purpose autonomous Android agent.',
    capabilities: [
      'NetworkManager, interface and ADB state checks',
      'Hotspot and Android device provisioning workflows',
      'Live command history and step-level run progress',
      'Saved local presets and downloadable run bundles'
    ],
    evidence:
      'The FrankAI repository records the implemented local control-room workflow and its current device, network, progress, preset and run-bundle capabilities.',
    current: true
  },
  {
    slug: 'context-engineering-method',
    name: 'FrankAI Context Engineering Method',
    category: 'Method',
    maturity: 'Operational',
    visibility: 'Public',
    summary:
      'A reusable method for turning intent, evidence, constraints and continuity into precise professional AI work.',
    overview:
      'The method combines context assembly, evidence checking, explicit constraints, adversarial review and iterative validation. It keeps human intent and accountability visible throughout the work.',
    capabilities: [
      'Context and continuity capture',
      'Evidence and uncertainty controls',
      'Constraint-led prompt and workflow design',
      'Iterative validation and professional handoff'
    ],
    evidence:
      'Used repeatedly across FrankAI research, writing, planning and engineering work and maintained as a reusable versioned method.',
    publicUrl: '/methods',
    publicLabel: 'See the method'
  },
  {
    slug: 'multistream',
    name: 'MultiStream',
    category: 'Lab',
    maturity: 'Pilot',
    visibility: 'Public',
    summary:
      'A self-hosted restreaming control plane for coordinating RTMP ingest, destinations and durable broadcast work from one operational surface.',
    overview:
      'MultiStream combines a web control surface with a durable worker and media pipeline. Its repository and public deployment demonstrate substantial implementation, while known operating limits keep the project honestly classified as a pilot rather than a production streaming service.',
    capabilities: [
      'RTMP ingest and multi-destination stream configuration',
      'Durable worker state and FFmpeg process supervision',
      'Encrypted stream-key handling and governed administration',
      'Health, recovery and AI-assisted operations surfaces'
    ],
    evidence:
      'The implementation repository documents and contains the Next.js, PostgreSQL, worker, media, security and test surfaces; the public pilot also responded successfully during reconciliation.',
    publicUrl: 'https://multistream.hnrhardhouse.online',
    publicLabel: 'Open MultiStream'
  },
  {
    slug: 'signal-ledger',
    name: 'SignalLedger',
    category: 'Platform',
    maturity: 'Active Development',
    visibility: 'Public',
    summary:
      'An evidence and audit architecture for append-oriented records, verification, access controls and compliance-aware workflows.',
    overview:
      'SignalLedger explores how operational events and supporting evidence can remain attributable, reviewable and resistant to silent alteration. Its former public endpoint is not linked because current availability is unverified.',
    capabilities: [
      'Append-oriented event records',
      'Evidence verification and lineage',
      'Tenant-aware access boundaries',
      'Audit and compliance workflow design'
    ],
    evidence:
      'Supported by existing implementation records and public project material; current endpoint availability failed verification, so no outbound link is exposed.',
    current: true
  }
]

export function getPortfolioEntry(slug: string): PortfolioEntry | undefined {
  return portfolioEntries.find((entry) => entry.slug === slug)
}

export function getEntriesByCategory(category: PortfolioCategory): readonly PortfolioEntry[] {
  return portfolioEntries.filter((entry) => entry.category === category)
}

export const featuredPortfolioEntries = portfolioEntries.filter((entry) => entry.featured)
export const currentDevelopmentEntries = portfolioEntries.filter((entry) => entry.current)

export function profileHref(entry: PortfolioEntry): string {
  return `/portfolio/${entry.slug}`
}
