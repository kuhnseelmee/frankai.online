import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionIntro } from '@/components/SectionIntro'

export const metadata: Metadata = {
  title: 'Release Cycle',
  description: 'Execution priorities for the first FrankAI platform release cycle.'
}

const priorities = [
  ['P0', 'Reliability baseline', 'Keep frankai.online live, rebuild memory automatically after ingest and verify public routes after deployment.'],
  ['P0', 'Security boundary', 'Require bearer authentication for memory APIs and keep raw private payloads out of public citations.'],
  ['P1', 'Pilot readiness', 'Define owner, allowed tools, approval gates, action receipt format and rollback path for each pilot workflow.'],
  ['P1', 'Docs and onboarding', 'Publish the minimum viable platform docs so serious collaborators can understand what is live and what is staged.'],
  ['P2', 'Model portability', 'Keep memory and governance outside any single model vendor so the platform can change engines without losing continuity.']
]

const cycle = [
  'Stabilise memory ingest and search',
  'Publish platform governance and rollout structure',
  'Select one controlled pilot workflow',
  'Instrument approvals, logs and receipts',
  'Review evidence before expanding access'
]

export default function ReleaseCyclePage() {
  return (
    <section className="page-section">
      <div className="container">
        <SectionIntro
          eyebrow="First release cycle"
          title="Execution priorities before expansion."
          text="The first FrankAI platform release should be judged by controlled usefulness: memory works, actions are governed and the release surface is honest."
        />
        <div className="priority-list">
          {priorities.map(([rank, title, text]) => (
            <article className="priority-row" key={`${rank}-${title}`}>
              <span className={`capability-status status-${rank === 'P0' ? 'live' : 'staged'}`}>{rank}</span>
              <div>
                <h2>{title}</h2>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="release-loop">
          <p className="eyebrow">Operating loop</p>
          <div className="loop-grid">
            {cycle.map((item, index) => (
              <div className="loop-step" key={item}>
                <span>0{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="inline-cta">
          <p>The release cycle is a control surface: it says what matters now and what is deliberately later.</p>
          <Link className="button button-secondary" href="/docs">Open docs</Link>
        </div>
      </div>
    </section>
  )
}
