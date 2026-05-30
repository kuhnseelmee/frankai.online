import type {
  GovernanceChecklistItem,
  GovernanceChecklistStatus,
  PlatformAgent,
  PlatformCapability,
  PlatformConfig,
  PlatformStage,
  PlatformStageStatus
} from './config'

const stageStatuses: PlatformStageStatus[] = ['planned', 'in-progress', 'ready']
const agentStates: PlatformAgent['runtimeState'][] = ['staged', 'sandbox', 'pilot', 'active', 'blocked']
const authorityLevels: PlatformAgent['authorityLevel'][] = [
  'observe',
  'prepare',
  'execute_with_approval',
  'routine_autonomy'
]
const checklistStatuses: GovernanceChecklistStatus[] = [
  'not_started',
  'in_progress',
  'blocked',
  'ready_for_review',
  'approved',
  'deferred'
]
const riskLevels: GovernanceChecklistItem['riskLevel'][] = ['low', 'moderate', 'high', 'critical']

export class PlatformValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PlatformValidationError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredString(value: unknown, field: string, errors: string[]) {
  if (typeof value !== 'string' || !value.trim()) {
    errors.push(`${field} must be a non-empty string`)
    return ''
  }
  return value.trim()
}

function stringList(value: unknown, field: string, errors: string[]) {
  if (!Array.isArray(value)) {
    errors.push(`${field} must be an array of strings`)
    return []
  }

  const result = value
    .map((item, index) => requiredString(item, `${field}[${index}]`, errors))
    .filter(Boolean)

  if (result.length === 0) {
    errors.push(`${field} must include at least one item`)
  }

  return result
}

function parseStages(value: unknown, errors: string[]): PlatformStage[] {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push('stages must include at least one stage')
    return []
  }

  return value.flatMap((stage, index) => {
    if (!isRecord(stage)) {
      errors.push(`stages[${index}] must be an object`)
      return []
    }

    const status = stage.status
    if (!stageStatuses.includes(status as PlatformStageStatus)) {
      errors.push(`stages[${index}].status must be one of ${stageStatuses.join(', ')}`)
    }

    return [{
      id: requiredString(stage.id, `stages[${index}].id`, errors),
      title: requiredString(stage.title, `stages[${index}].title`, errors),
      objective: requiredString(stage.objective, `stages[${index}].objective`, errors),
      status: stageStatuses.includes(status as PlatformStageStatus)
        ? (status as PlatformStageStatus)
        : 'planned',
      owner: requiredString(stage.owner, `stages[${index}].owner`, errors),
      targetWindow: requiredString(stage.targetWindow, `stages[${index}].targetWindow`, errors),
      deliverables: stringList(stage.deliverables, `stages[${index}].deliverables`, errors)
    }]
  })
}

function parseCapabilities(value: unknown, errors: string[]): PlatformCapability[] {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push('capabilities must include at least one capability')
    return []
  }

  return value.flatMap((capability, index) => {
    if (!isRecord(capability)) {
      errors.push(`capabilities[${index}] must be an object`)
      return []
    }

    return [{
      id: requiredString(capability.id, `capabilities[${index}].id`, errors),
      name: requiredString(capability.name, `capabilities[${index}].name`, errors),
      description: requiredString(capability.description, `capabilities[${index}].description`, errors),
      currentState: requiredString(capability.currentState, `capabilities[${index}].currentState`, errors),
      nextStep: requiredString(capability.nextStep, `capabilities[${index}].nextStep`, errors)
    }]
  })
}

function parseAgents(value: unknown, errors: string[]): PlatformAgent[] {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push('agents must include at least one agent')
    return []
  }

  return value.flatMap((agent, index) => {
    if (!isRecord(agent)) {
      errors.push(`agents[${index}] must be an object`)
      return []
    }

    const runtimeState = agent.runtimeState
    const authorityLevel = agent.authorityLevel
    if (!agentStates.includes(runtimeState as PlatformAgent['runtimeState'])) {
      errors.push(`agents[${index}].runtimeState must be one of ${agentStates.join(', ')}`)
    }
    if (!authorityLevels.includes(authorityLevel as PlatformAgent['authorityLevel'])) {
      errors.push(`agents[${index}].authorityLevel must be one of ${authorityLevels.join(', ')}`)
    }

    return [{
      id: requiredString(agent.id, `agents[${index}].id`, errors),
      name: requiredString(agent.name, `agents[${index}].name`, errors),
      role: requiredString(agent.role, `agents[${index}].role`, errors),
      runtimeState: agentStates.includes(runtimeState as PlatformAgent['runtimeState'])
        ? (runtimeState as PlatformAgent['runtimeState'])
        : 'staged',
      authorityLevel: authorityLevels.includes(authorityLevel as PlatformAgent['authorityLevel'])
        ? (authorityLevel as PlatformAgent['authorityLevel'])
        : 'observe',
      allowedActions: stringList(agent.allowedActions, `agents[${index}].allowedActions`, errors),
      blockedActions: stringList(agent.blockedActions, `agents[${index}].blockedActions`, errors),
      owner: requiredString(agent.owner, `agents[${index}].owner`, errors)
    }]
  })
}

function parseChecklist(value: unknown, errors: string[]): GovernanceChecklistItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push('governanceChecklist must include at least one item')
    return []
  }

  return value.flatMap((item, index) => {
    if (!isRecord(item)) {
      errors.push(`governanceChecklist[${index}] must be an object`)
      return []
    }

    const status = item.status
    const riskLevel = item.riskLevel
    if (!checklistStatuses.includes(status as GovernanceChecklistStatus)) {
      errors.push(`governanceChecklist[${index}].status must be one of ${checklistStatuses.join(', ')}`)
    }
    if (!riskLevels.includes(riskLevel as GovernanceChecklistItem['riskLevel'])) {
      errors.push(`governanceChecklist[${index}].riskLevel must be one of ${riskLevels.join(', ')}`)
    }
    if (typeof item.blocksProgression !== 'boolean') {
      errors.push(`governanceChecklist[${index}].blocksProgression must be boolean`)
    }

    return [{
      id: requiredString(item.id, `governanceChecklist[${index}].id`, errors),
      phaseId: requiredString(item.phaseId, `governanceChecklist[${index}].phaseId`, errors),
      title: requiredString(item.title, `governanceChecklist[${index}].title`, errors),
      status: checklistStatuses.includes(status as GovernanceChecklistStatus)
        ? (status as GovernanceChecklistStatus)
        : 'not_started',
      owner: requiredString(item.owner, `governanceChecklist[${index}].owner`, errors),
      requiredEvidence: stringList(item.requiredEvidence, `governanceChecklist[${index}].requiredEvidence`, errors),
      riskLevel: riskLevels.includes(riskLevel as GovernanceChecklistItem['riskLevel'])
        ? (riskLevel as GovernanceChecklistItem['riskLevel'])
        : 'moderate',
      blocksProgression: typeof item.blocksProgression === 'boolean' ? item.blocksProgression : true
    }]
  })
}

export function validatePlatformConfig(input: unknown): PlatformConfig {
  const errors: string[] = []
  if (!isRecord(input)) {
    throw new PlatformValidationError('Platform config must be an object')
  }

  const notes = stringList(input.notes, 'notes', errors)
  const config = {
    stages: parseStages(input.stages, errors),
    capabilities: parseCapabilities(input.capabilities, errors),
    agents: parseAgents(input.agents, errors),
    governanceChecklist: parseChecklist(input.governanceChecklist, errors),
    notes,
    publishedAt: typeof input.publishedAt === 'string' && input.publishedAt.trim() ? input.publishedAt : null,
    publishedBy: typeof input.publishedBy === 'string' && input.publishedBy.trim() ? input.publishedBy.trim() : null,
    updatedAt: typeof input.updatedAt === 'string' && input.updatedAt.trim() ? input.updatedAt : new Date().toISOString()
  }

  if (errors.length > 0) {
    throw new PlatformValidationError(errors.join('; '))
  }

  return config
}
