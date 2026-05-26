import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionIntro } from '@/components/SectionIntro'

export const metadata: Metadata = {
  title: 'Trust',
  description: 'How FrankAI handles boundaries, approvals, evidence and staged capability.'
}

const principles = [
  {
    title: 'Intent becomes a mission',
    text: 'A request should be clarified into an objective, risk assessment and proposed actions before operational execution begins.'
  },
  {
    title: 'Approval requires context',
    text: 'A reviewer should see the intended action, credible failure modes, withheld actions and the effect of rejection.'
  },
  {
    title: 'Action leaves a receipt',
    text: 'Material actions should produce evidence of authority, scope, outcome and recovery path without exposing unnecessary private content.'
  }
]

const capability = [
  ['Live', 'First-party frankai.online presence and controlled public information routes.'],
  ['Live', 'Frank ServiceDesk operational workflow environment.'],
  ['Live', 'Signed messaging integration bridge for controlled assistant events.'],
  ['Staged', 'Frank Dispatch mission, approval and action receipt workflow using safe fixture intake.'],
  ['Locked', 'Inbound email ingestion pending webhook credential activation and operational hardening.']
]

export default function TrustPage() {
  return (
    <section className="page-section">
      <div className="container">
        <SectionIntro
          eyebrow="Trust and governance"
          title="Capability should be inspectable before it is autonomous."
          text="FrankAI is built around controlled action: understanding intent, identifying consequence, obtaining meaningful authority and preserving evidence."
        />
        <div className="trust-principles">
          {principles.map((principle, index) => (
            <article className="trust-principle" key={principle.title}>
              <p className="pillar-number">0{index + 1}</p>
              <h2>{principle.title}</h2>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
        <div className="trust-evidence">
          <div>
            <p className="eyebrow">Capability register</p>
            <h2>What is live, staged and deliberately locked.</h2>
            <p className="trust-evidence-lead">
              Honest status is part of the product. A capability is not represented as active until
              the access, safety and delivery path are actually verified.
            </p>
          </div>
          <div className="capability-list">
            {capability.map(([status, description]) => (
              <div className="capability-row" key={description}>
                <span className={`capability-status status-${status.toLowerCase()}`}>{status}</span>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="trust-callout">
          <div>
            <p className="eyebrow">Frank Dispatch</p>
            <h2>The next operating layer.</h2>
            <p>
              Dispatch is being developed to turn contact into governed missions, approvals and
              action receipts before real-world execution is enabled.
            </p>
          </div>
          <Link className="button" href="/contact">Discuss a controlled workflow</Link>
        </div>
      </div>
    </section>
  )
}
