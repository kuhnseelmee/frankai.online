import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultPlatformConfig } from '../lib/platform/config.ts'
import { PlatformValidationError, validatePlatformConfig } from '../lib/platform/validation.ts'

test('accepts the default FrankAI platform config', () => {
  const config = validatePlatformConfig(defaultPlatformConfig)

  assert.equal(config.stages.length, defaultPlatformConfig.stages.length)
  assert.equal(config.capabilities.length, defaultPlatformConfig.capabilities.length)
  assert.equal(config.agents.length, defaultPlatformConfig.agents.length)
  assert.equal(config.governanceChecklist.length, defaultPlatformConfig.governanceChecklist.length)
})

test('rejects malformed stage state', () => {
  assert.throws(
    () =>
      validatePlatformConfig({
        ...defaultPlatformConfig,
        stages: [{ ...defaultPlatformConfig.stages[0], status: 'done' }]
      }),
    PlatformValidationError
  )
})

test('rejects malformed agent authority', () => {
  assert.throws(
    () =>
      validatePlatformConfig({
        ...defaultPlatformConfig,
        agents: [{ ...defaultPlatformConfig.agents[0], authorityLevel: 'root' }]
      }),
    /authorityLevel must be one of/
  )
})

test('rejects malformed governance checklist evidence', () => {
  assert.throws(
    () =>
      validatePlatformConfig({
        ...defaultPlatformConfig,
        governanceChecklist: [
          {
            ...defaultPlatformConfig.governanceChecklist[0],
            requiredEvidence: []
          }
        ]
      }),
    /requiredEvidence must include at least one item/
  )
})
