import type pg from 'pg'
import { randomUUID } from 'node:crypto'
import { redactAuditMetadata } from './redaction'
import { auditDefinition } from './audit-registry'

export const FINAL_ADMINISTRATOR_REQUIRED = 'FINAL_ADMINISTRATOR_REQUIRED'

export async function lockAdministratorMembership(client: pg.PoolClient) {
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended('frankai.final-administrator', 0))")
  await client.query("SELECT id FROM users WHERE role='ADMIN' FOR UPDATE")
}

export async function recoverableAdministratorCount(client: pg.PoolClient) {
  const result = await client.query(`SELECT count(*)::int AS count
    FROM users u
    WHERE u.role='ADMIN' AND u.status='ACTIVE'
      AND u.email_verified_at IS NOT NULL AND u.mfa_enrolled_at IS NOT NULL
      AND (u.locked_until IS NULL OR u.locked_until <= now())
      AND EXISTS (SELECT 1 FROM mfa_recovery_codes c WHERE c.user_id=u.id AND c.used_at IS NULL)`)
  return Number(result.rows[0].count)
}

export async function assertRecoverableAdministrator(client: pg.PoolClient) {
  if (await recoverableAdministratorCount(client) < 1) {
    const error = new Error(FINAL_ADMINISTRATOR_REQUIRED)
    error.name = FINAL_ADMINISTRATOR_REQUIRED
    throw error
  }
}

export async function auditInTransaction(client: pg.PoolClient, actorUserId: string, action: string, result: string, targetType: string | null, targetId: string | null, metadata: Record<string, unknown> = {}) {
  const definition = auditDefinition(action)
  if (!definition) throw new Error(`Unregistered audit action: ${action}`)
  if (!definition.successFailure.includes(result)) throw new Error(`Unsupported audit result for ${action}: ${result}`)
  const requestId = typeof metadata.requestId === 'string' ? metadata.requestId : randomUUID()
  await client.query('INSERT INTO audit_events (id,actor_user_id,action,result,target_type,target_id,request_id,metadata_json) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [randomUUID(), actorUserId, action, result, targetType, targetId, requestId, JSON.stringify(redactAuditMetadata({ ...metadata, requestId }))])
}
