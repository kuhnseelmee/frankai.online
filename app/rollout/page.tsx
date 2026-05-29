import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionIntro } from '@/components/SectionIntro'

export const metadata: Metadata = {
  title: 'Rollout',
  description: 'FrankAI staged rollout path for the first platform release.'
}

const stages = [
  {
    status: 'Live',
    title: 'Foundation',
    text: 'Public platform domain, authenticated memory ingest, searchable memory index and controlled first-party routes.'
  },
  {
    status: 'Active',
    title: 'Governed workspace',
    text: 'Documented governance controls, rollout structure, release priorities and memory architecture on frankai.online.'
  },
  {
    status: 'Next',
    title: 'Pilot workflows',
    text: 'Limited operational workflows with clear owners, allowed tools, approval gates and action receipts.'
  },
  {
    status: 'Planned',
    title: 'First release cycle',
    text: 'A packaged platform release with onboarding, docs, observability, recovery process and pilot intake.'
  }
]

export default function RolloutPage() {
  return (
    <section className="page-section">
      <div className="container">
        <SectionIntro
          eyebrow="Staged rollout"
          title="Move deliberately from working foundation to first release."
          text="FrankAI should not jump from prototype to promise. Each stage must leave usable capability, evidence and a narrower set of risks."
        />
        <div className="timeline">
          {stages.map((stage, index) => (
            <article className="timeline-item" key={stage.title}>
              <div>
                <span className={`capability-status status-${stage.status === 'Live' ? 'live' : 'staged'}`}>
                  {stage.status}
                </span>
                <p className="pillar-number">0{index + 1}</p>
              </div>
              <div>
                <h2>{stage.title}</h2>
                <p>{stage.text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="inline-cta">
          <p>The rollout belongs on FrankAI because it describes platform maturity, not Ray&apos;s personal profile.</p>
          <Link className="button button-secondary" href="/governance">View controls</Link>
        </div>
      </div>
    </section>
  )
}
