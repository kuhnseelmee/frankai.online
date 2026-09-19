import type { Metadata } from 'next'
import Link from 'next/link'
import { portfolioEntries } from '@/lib/portfolio'

export const metadata: Metadata = {
  title: 'Trust',
  description: 'How FrankAI makes authority, maturity, evidence, privacy and recovery boundaries inspectable.',
  alternates: { canonical: '/trust' }
}

const principles = [
  {
    title: 'Authority is named',
    text: 'A consequential action belongs to an accountable human role and an explicit permission boundary.'
  },
  {
    title: 'Evidence stays attributable',
    text: 'Material claims and actions retain their source, context, outcome and recovery path.'
  },
  {
    title: 'Privacy constrains publication',
    text: 'Private identities and records are not traded for a stronger-looking public case study.'
  },
  {
    title: 'Recovery is part of ownership',
    text: 'Backups, export, rollback and continuity determine whether a system is genuinely controlled.'
  }
]

export default function TrustPage() {
  return (
    <section className="page-section">
      <div className="container">
        <header className="page-header">
          <p className="eyebrow">Trust and governance</p>
          <h1 className="page-title">Trust grows when the boundaries are inspectable.</h1>
          <p className="page-lead">
            FrankAI does not ask visitors to trust broad claims about intelligence or autonomy. It
            exposes the operating principles, maturity labels and evidence boundaries that make work
            accountable.
          </p>
        </header>
        <div className="pillar-grid">
          {principles.map((principle, index) => (
            <article className="pillar" key={principle.title}>
              <p className="pillar-number">0{index + 1}</p>
              <h2>{principle.title}</h2>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
        <section className="trust-evidence" aria-labelledby="capability-register">
          <div>
            <p className="eyebrow">Capability register</p>
            <h2 id="capability-register">One source of truth for public status</h2>
            <p className="trust-evidence-lead">
              This register is rendered from the same canonical data as the portfolio and Current
              Development. Status changes should be made once, with evidence, rather than rewritten
              independently across marketing pages.
            </p>
          </div>
          <div className="capability-list">
            {portfolioEntries.map((entry) => (
              <div className="capability-row" key={entry.slug}>
                <span className={`capability-status status-${entry.maturity.toLowerCase().replaceAll(' ', '-')}`}>
                  {entry.maturity}
                </span>
                <p><strong>{entry.name}</strong><br />{entry.summary}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="trust-callout">
          <div>
            <p className="eyebrow">From principle to implementation</p>
            <h2>Governance must survive contact with the system.</h2>
            <p>
              Authentication, access boundaries, audit records, staged deployment, privacy review and
              rollback evidence matter more than an abstract promise to be responsible.
            </p>
          </div>
          <Link className="button" href="/governance">Inspect the controls</Link>
        </div>
      </div>
    </section>
  )
}
