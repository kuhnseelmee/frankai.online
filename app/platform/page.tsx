import type { Metadata } from 'next'
import Link from 'next/link'
import { PortfolioCard } from '@/components/PortfolioCard'
import { getEntriesByCategory } from '@/lib/portfolio'

export const metadata: Metadata = {
  title: 'Platform',
  description: 'The FrankAI platform architecture: identity, context, governed execution, evidence and recoverable operations.',
  alternates: { canonical: '/platform' }
}

const platformEntries = getEntriesByCategory('Platform')

const layers = [
  ['Identity & authority', 'Named people, roles, sessions and permissions define who may see, decide and act.'],
  ['Context & evidence', 'Relevant history and source lineage support decisions without treating every datum as equally trustworthy.'],
  ['Governed execution', 'Agents and integrations operate through bounded tools, approval gates and observable outcomes.'],
  ['Operations & recovery', 'Health checks, release evidence, backups and rollback paths keep capability maintainable.']
]

export default function PlatformPage() {
  return (
    <section className="page-section">
      <div className="container">
        <header className="page-header">
          <p className="eyebrow">Platform architecture</p>
          <h1 className="page-title">An owned intelligence layer for controlled work.</h1>
          <p className="page-lead">
            FrankAI is not a generic wrapper around a model. It combines identity, context, tools,
            evidence and operating controls so AI assistance can become a dependable part of real work.
          </p>
        </header>
        <div className="pillar-grid">
          {layers.map(([title, text], index) => (
            <article className="pillar" key={title}>
              <p className="pillar-number">0{index + 1}</p>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <section className="content-block" aria-labelledby="platform-register">
          <div className="section-intro">
            <p className="eyebrow">Platform register</p>
            <h2 id="platform-register">Systems using the architecture</h2>
            <p className="section-lead">
              Public and anonymised systems share the same expectation: maturity, authority and
              evidence boundaries must remain visible.
            </p>
          </div>
          <div className="portfolio-grid">
            {platformEntries.map((entry) => (
              <PortfolioCard entry={entry} headingLevel="h3" key={entry.slug} />
            ))}
          </div>
        </section>
        <div className="platform-directory">
          <Link className="directory-link" href="/governance"><span>Governance</span><p>Authority, approvals, evidence and data restraint.</p></Link>
          <Link className="directory-link" href="/agents"><span>Agents</span><p>Human-directed operating roles and controlled tools.</p></Link>
          <Link className="directory-link" href="/methods"><span>Methods</span><p>Context engineering and evidence-led delivery.</p></Link>
          <Link className="directory-link" href="/now"><span>Current Development</span><p>The active work derived from the portfolio registry.</p></Link>
        </div>
        <div className="inline-cta">
          <p>For organisations that need useful AI without surrendering control.</p>
          <Link className="button" href="/contact">Start a conversation</Link>
        </div>
      </div>
    </section>
  )
}
