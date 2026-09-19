import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionIntro } from '@/components/SectionIntro'

export const metadata: Metadata = {
  title: 'Governance',
  description: 'Concrete FrankAI controls for authority, approval, evidence, data restraint and staged AI-agent execution.',
  alternates: { canonical: '/governance' }
}

const controls = [
  {
    title: 'Authority boundary',
    text: 'Every agent action belongs to a named role, permission scope and accountable owner.'
  },
  {
    title: 'Approval gate',
    text: 'External communication, irreversible changes and sensitive access require explicit approval or a documented policy exception.'
  },
  {
    title: 'Evidence trail',
    text: 'Material actions should record intent, context, authority, result and recovery path without exposing unnecessary private content.'
  },
  {
    title: 'Data restraint',
    text: 'Memory and retrieval should store what helps continuity while keeping secrets, raw payloads and high-risk data out of ordinary context.'
  },
  {
    title: 'Release and recovery',
    text: 'Build provenance, validation evidence, rollback material and operational ownership must be established before production activation.'
  }
]

const levels = [
  ['Observe', 'Read-only context gathering, summaries and recommendations.'],
  ['Prepare', 'Drafts, plans, proposed actions and validation checks before execution.'],
  ['Execute with approval', 'Controlled actions after human confirmation or policy-backed authority.'],
  ['Autonomous routine', 'Narrow, reversible, logged tasks only after repeated safe operation.']
]

export default function GovernancePage() {
  return (
    <section className="page-section">
      <div className="container">
        <SectionIntro
          eyebrow="Governance controls"
          title="FrankAI earns execution by proving control."
          text="No agent receives broad trust by default. Capability is staged through scope, least privilege, approval, evidence, recovery and review."
        />
        <div className="feature-grid">
          {controls.map((control) => (
            <article className="feature-card" key={control.title}>
              <h2>{control.title}</h2>
              <p>{control.text}</p>
            </article>
          ))}
        </div>
        <div className="operating-levels">
          <div>
            <p className="eyebrow">Execution ladder</p>
            <h2>Access increases only when the risk model is understood.</h2>
          </div>
          <div>
            {levels.map(([title, text], index) => (
              <div className="capability-row" key={title}>
                <span className="capability-status status-staged">L{index + 1}</span>
                <p>
                  <strong>{title}</strong>
                  <br />
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="inline-cta">
          <p>Governance is part of the product surface, not buried in internal notes.</p>
          <Link className="button button-secondary" href="/release-cycle">View priorities</Link>
        </div>
      </div>
    </section>
  )
}
