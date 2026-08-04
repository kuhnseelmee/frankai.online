'use client'

import { FormEvent, useMemo, useState } from 'react'
import type { PlatformConfig } from '@/lib/platform/config'

type PlatformAdminClientProps = {
  initialConfig: PlatformConfig
}

const APPROVAL_PHRASE = 'APPROVE FRANKAI PLATFORM CHANGES'

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2)
}

function parseArrayJson(value: string, fieldName: string) {
  const parsed = JSON.parse(value) as unknown
  if (!Array.isArray(parsed)) {
    throw new Error(`${fieldName} must be a JSON array`)
  }

  return parsed
}

function csrfToken() {
  return document.cookie.match(/(?:^|;\s*)frankai_csrf=([^;]+)/)?.[1] || ''
}

export function PlatformAdminClient({ initialConfig }: PlatformAdminClientProps) {
  const [stagesJson, setStagesJson] = useState(pretty(initialConfig.stages))
  const [capabilitiesJson, setCapabilitiesJson] = useState(pretty(initialConfig.capabilities))
  const [agentsJson, setAgentsJson] = useState(pretty(initialConfig.agents))
  const [governanceJson, setGovernanceJson] = useState(pretty(initialConfig.governanceChecklist))
  const [notesJson, setNotesJson] = useState(pretty(initialConfig.notes))
  const [approvalPhrase, setApprovalPhrase] = useState('')
  const [approvalNote, setApprovalNote] = useState('')
  const [publishedAt, setPublishedAt] = useState(initialConfig.publishedAt)
  const [publishedBy, setPublishedBy] = useState(initialConfig.publishedBy)
  const [updatedAt, setUpdatedAt] = useState(initialConfig.updatedAt)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const publishReady = useMemo(
    () => approvalPhrase.trim() === APPROVAL_PHRASE && approvalNote.trim().length >= 20,
    [approvalPhrase, approvalNote]
  )

  async function saveDraft(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setStatus(null)
    setError(null)

    try {
      const payload = {
        stages: parseArrayJson(stagesJson, 'stages'),
        capabilities: parseArrayJson(capabilitiesJson, 'capabilities'),
        agents: parseArrayJson(agentsJson, 'agents'),
        governanceChecklist: parseArrayJson(governanceJson, 'governanceChecklist'),
        notes: parseArrayJson(notesJson, 'notes'),
        publishedAt,
        publishedBy,
        updatedAt
      }

      const response = await fetch('/api/admin/platform', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken() },
        body: JSON.stringify(payload)
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to save platform draft')
      }

      setStagesJson(pretty(result.stages))
      setCapabilitiesJson(pretty(result.capabilities))
      setAgentsJson(pretty(result.agents))
      setGovernanceJson(pretty(result.governanceChecklist))
      setNotesJson(pretty(result.notes))
      setPublishedAt(result.publishedAt)
      setPublishedBy(result.publishedBy)
      setUpdatedAt(result.updatedAt)
      setStatus('Draft saved.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save platform draft')
    } finally {
      setBusy(false)
    }
  }

  async function publishChanges() {
    setBusy(true)
    setStatus(null)
    setError(null)

    try {
      const response = await fetch('/api/admin/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken() },
        body: JSON.stringify({
          approvalPhrase,
          approvalNote,
          publishedBy: 'FrankAI operator'
        })
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to publish platform changes')
      }

      setPublishedAt(result.publishedAt)
      setPublishedBy(result.publishedBy)
      setUpdatedAt(result.updatedAt)
      setApprovalPhrase('')
      setApprovalNote('')
      setStatus('Changes published.')
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Failed to publish platform changes')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-console">
      <div className="admin-meta">
        <p><strong>Last updated:</strong> {new Date(updatedAt).toLocaleString()}</p>
        <p><strong>Last published:</strong> {publishedAt ? new Date(publishedAt).toLocaleString() : 'Not published'}</p>
        <p><strong>Published by:</strong> {publishedBy || 'Not available'}</p>
      </div>

      {status ? <div className="admin-alert admin-alert-ok">{status}</div> : null}
      {error ? <div className="admin-alert admin-alert-error">{error}</div> : null}

      <form className="admin-editor" onSubmit={saveDraft}>
        <label>
          <span>Stages JSON</span>
          <textarea value={stagesJson} onChange={(event) => setStagesJson(event.target.value)} />
        </label>
        <label>
          <span>Capabilities JSON</span>
          <textarea value={capabilitiesJson} onChange={(event) => setCapabilitiesJson(event.target.value)} />
        </label>
        <label>
          <span>Agent Registry JSON</span>
          <textarea value={agentsJson} onChange={(event) => setAgentsJson(event.target.value)} />
        </label>
        <label>
          <span>Governance Checklist JSON</span>
          <textarea value={governanceJson} onChange={(event) => setGovernanceJson(event.target.value)} />
        </label>
        <label>
          <span>Operating Notes JSON</span>
          <textarea value={notesJson} onChange={(event) => setNotesJson(event.target.value)} />
        </label>
        <button className="button" type="submit" disabled={busy}>
          {busy ? 'Saving...' : 'Save draft'}
        </button>
      </form>

      <div className="approval-panel">
        <p className="eyebrow">Approval gated publish</p>
        <p>Publishing requires the exact approval phrase and a review note.</p>
        <input
          value={approvalPhrase}
          onChange={(event) => setApprovalPhrase(event.target.value)}
          placeholder={APPROVAL_PHRASE}
        />
        <textarea
          value={approvalNote}
          onChange={(event) => setApprovalNote(event.target.value)}
          placeholder="Approval note, minimum 20 characters"
        />
        <button className="button button-secondary" type="button" disabled={busy || !publishReady} onClick={publishChanges}>
          {busy ? 'Publishing...' : 'Publish changes'}
        </button>
      </div>
    </div>
  )
}
