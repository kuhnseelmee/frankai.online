export type DeploymentProof = {
  name: string
  url: string
  category: string
  status: string
  description: string
  purpose: string
  significance: string
}

export const deploymentProofs: DeploymentProof[] = [
  {
    name: 'MultiStream',
    url: 'https://multistream.hnrhardhouse.online',
    category: 'Broadcast Infrastructure / Streaming Automation',
    status: 'In Development / Deployment Proof',
    description:
      'A broadcast and multi-platform streaming control project designed to manage live broadcast distribution from a central interface.',
    purpose:
      'Provides a controlled streaming platform capable of receiving a live broadcast and distributing it across multiple configured platforms.',
    significance:
      'Demonstrates applied infrastructure design, dashboard-driven operational control, creator tooling, streaming workflow automation, and future AI-assisted broadcast management.'
  },
  {
    name: 'SignalLedger',
    url: 'https://signalledger.frankai.online',
    category: 'Compliance / Evidence / Audit Infrastructure',
    status: 'Active Build / Strategic Platform',
    description:
      'A secure evidence, audit, and compliance platform focused on preserving operational integrity through append-only records, evidence verification, tenant-aware controls, and proof-of-care style workflows.',
    purpose:
      'Creates a defensible record of operational events, incidents, documents, and compliance signals.',
    significance:
      'Demonstrates full-stack architecture, multi-tenant system design, evidence verification, audit logging, compliance workflows, secure document handling, and governance-focused platform design.'
  },
  {
    name: 'TraderBot',
    url: 'https://traderbot.frankai.online',
    category: 'Trading Automation / Secure Dashboard Platform',
    status: 'Prototype / Secure Platform Build',
    description:
      'A secure trading-bot dashboard concept designed for authenticated user management, API configuration, role-based access, bot control, public landing pages, and exchange integration readiness.',
    purpose:
      'Provides a secure management interface for trading automation infrastructure, including future support for Pionex API integration and controlled user access.',
    significance:
      'Demonstrates financial automation architecture, secure dashboard design, role-based access planning, API credential governance, risk-aware platform thinking, and production-style SaaS structure.'
  }
]

