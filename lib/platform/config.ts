export type PlatformStageStatus = 'planned' | 'in-progress' | 'ready'

export type PlatformStage = {
  id: string
  title: string
  objective: string
  status: PlatformStageStatus
  owner: string
  targetWindow: string
  deliverables: string[]
}

export type PlatformCapability = {
  id: string
  name: string
  description: string
  currentState: string
  nextStep: string
}

export type PlatformAgent = {
  id: string
  name: string
  role: string
  runtimeState: 'staged' | 'sandbox' | 'pilot' | 'active' | 'blocked'
  authorityLevel: 'observe' | 'prepare' | 'execute_with_approval' | 'routine_autonomy'
  allowedActions: string[]
  blockedActions: string[]
  owner: string
}

export type GovernanceChecklistStatus =
  | 'not_started'
  | 'in_progress'
  | 'blocked'
  | 'ready_for_review'
  | 'approved'
  | 'deferred'

export type GovernanceChecklistItem = {
  id: string
  phaseId: string
  title: string
  status: GovernanceChecklistStatus
  owner: string
  requiredEvidence: string[]
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'
  blocksProgression: boolean
}

export type PlatformConfig = {
  stages: PlatformStage[]
  capabilities: PlatformCapability[]
  agents: PlatformAgent[]
  governanceChecklist: GovernanceChecklistItem[]
  notes: string[]
  publishedAt: string | null
  publishedBy: string | null
  updatedAt: string
}

export const defaultPlatformConfig: PlatformConfig = {
  stages: [
    {
      id: 'foundation-governance',
      title: 'Foundation & Governance',
      objective: 'Lock scope boundaries, approval policy, memory rules and audit controls before runtime expansion.',
      status: 'in-progress',
      owner: 'FrankAI Platform Owner',
      targetWindow: 'Current release',
      deliverables: [
        'Mission boundaries and blocked-action classes',
        'Approval policy for outbound and irreversible work',
        'Audit event schema for prompts, tool calls and outcomes',
        'Readiness checklist and go/no-go criteria for pilot transition'
      ]
    },
    {
      id: 'runtime-control-plane',
      title: 'Runtime Control Plane',
      objective: 'Introduce the management surface for agent registry, run-state tracking and operator review.',
      status: 'planned',
      owner: 'Engineering',
      targetWindow: 'Next release',
      deliverables: [
        'Agent registry with service responsibilities',
        'Run-state tracking for staged, sandbox, pilot, active and blocked states',
        'Execution limits and timeout guardrails',
        'Incident fallback and manual override path'
      ]
    },
    {
      id: 'workflow-pilots',
      title: 'Workflow Pilots',
      objective: 'Launch controlled pilot workflows tied to measurable operating outcomes before broad rollout.',
      status: 'planned',
      owner: 'Ops + Delivery',
      targetWindow: 'After governance approval',
      deliverables: [
        'Lead triage pilot',
        'ServiceDesk dispatch pilot',
        'Document intake and classification pilot',
        'Pilot scorecard with cycle-time and quality metrics'
      ]
    }
  ],
  capabilities: [
    {
      id: 'agent-orchestration',
      name: 'Agent Orchestration',
      description: 'Coordinate specialised agents with controlled task routing and clear ownership boundaries.',
      currentState: 'Platform direction and route structure are published.',
      nextStep: 'Expose agent registry and run-state controls in the FrankAI operator console.'
    },
    {
      id: 'compliance-observability',
      name: 'Compliance & Observability',
      description: 'Track what agents do, why they did it and what evidence exists for review.',
      currentState: 'Memory ingest and search are live; action audit is not yet unified.',
      nextStep: 'Attach run, approval and action receipt records to platform memory.'
    },
    {
      id: 'human-in-the-loop',
      name: 'Human-in-the-Loop Controls',
      description: 'Require explicit review for sensitive actions and confidence-sensitive decisions.',
      currentState: 'Operational rule exists; platform-level approval gate is now being encoded.',
      nextStep: 'Require approval records before external communication or irreversible changes.'
    },
    {
      id: 'knowledge-and-context',
      name: 'Knowledge & Context Layer',
      description: 'Provide agents with reliable context from approved internal sources.',
      currentState: 'Authenticated memory ingest/search is live on frankai.online.',
      nextStep: 'Define source hierarchy and retrieval rules per agent role.'
    }
  ],
  agents: [
    {
      id: 'frank-main',
      name: 'Frank Main',
      role: 'Primary operator and strategic assistant',
      runtimeState: 'pilot',
      authorityLevel: 'prepare',
      allowedActions: ['Context gathering', 'Drafting', 'Local code changes', 'Readiness checks'],
      blockedActions: ['External sends without approval', 'Credential exposure', 'Destructive actions'],
      owner: 'Ray'
    },
    {
      id: 'servicedesk-dispatch',
      name: 'ServiceDesk Dispatch',
      role: 'Controlled service workflow triage and dispatch support',
      runtimeState: 'sandbox',
      authorityLevel: 'execute_with_approval',
      allowedActions: ['Fixture intake', 'Counterfactual approvals', 'Action receipts'],
      blockedActions: ['Live customer sends', 'Payment actions', 'Credential changes'],
      owner: 'FrankAI Ops'
    }
  ],
  governanceChecklist: [
    {
      id: 'gate-production-write',
      phaseId: 'foundation-governance',
      title: 'Production write restriction enforced',
      status: 'in_progress',
      owner: 'Systems Admin',
      requiredEvidence: ['Permission matrix', 'Environment separation record', 'Rollback procedure'],
      riskLevel: 'critical',
      blocksProgression: true
    },
    {
      id: 'gate-outbound-integration',
      phaseId: 'foundation-governance',
      title: 'Outbound integration restriction enforced',
      status: 'in_progress',
      owner: 'Platform Owner',
      requiredEvidence: ['Integration owner', 'Data flow diagram', 'Approval record'],
      riskLevel: 'high',
      blocksProgression: true
    },
    {
      id: 'gate-auditability',
      phaseId: 'runtime-control-plane',
      title: 'Auditability gate enforced for all material agent actions',
      status: 'not_started',
      owner: 'Engineering',
      requiredEvidence: ['Input/context log schema', 'Approval status field', 'Action receipt field'],
      riskLevel: 'high',
      blocksProgression: true
    },
    {
      id: 'gate-pilot-scope',
      phaseId: 'workflow-pilots',
      title: 'Pilot scope constrained and approved',
      status: 'not_started',
      owner: 'Operations',
      requiredEvidence: ['Included workflow list', 'Excluded workflow list', 'Success metrics'],
      riskLevel: 'moderate',
      blocksProgression: true
    }
  ],
  notes: [
    'FrankAI is the product home for the AI-agent platform.',
    'Capability does not imply permission; every expansion must pass governance controls.',
    'No autonomous high-impact action should run without an explicit approval workflow.'
  ],
  publishedAt: null,
  publishedBy: null,
  updatedAt: new Date(0).toISOString()
}
