import type { Metadata } from 'next'
import Link from 'next/link'
import { PortfolioCard } from '@/components/PortfolioCard'
import { getPortfolioEntry } from '@/lib/portfolio'

export const metadata: Metadata = {
  title: 'Agents',
  description:
    'How FrankAI designs human-directed agents with bounded roles, controlled tools, explicit authority and reviewable evidence.',
  alternates: { canonical: '/agents' }
}

const agentHub = getPortfolioEntry('agent-prompt-hub')!

const boundaries = [
  ['Named purpose', 'Each agent has a defined operating role, scope and accountable human owner.'],
  ['Bounded context', 'Agents receive relevant information without inheriting every private record or credential.'],
  ['Controlled tools', 'Read, prepare and execute permissions are separated according to consequence.'],
  ['Visible evidence', 'Material recommendations and actions retain enough context to be reviewed and recovered.']
]

export default function AgentsPage() {
  return (
    <section className="page-section">
      <div className="container">
        <header className="page-header">
          <p className="eyebrow">Agents</p>
          <h1 className="page-title">Useful agents need boundaries, not mythology.</h1>
          <p className="page-lead">
            FrankAI treats an agent as a configured operating role inside a human-owned system.
            Raymond remains accountable for purpose, authority and release decisions; “Frank” is the
            collaborative intelligence layer, not an independent employee or decision-maker.
          </p>
        </header>
        <div className="pillar-grid">
          {boundaries.map(([title, text], index) => (
            <article className="pillar" key={title}>
              <p className="pillar-number">0{index + 1}</p>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <section className="content-block" aria-labelledby="agent-infrastructure">
          <div className="section-intro">
            <p className="eyebrow">Agent infrastructure</p>
            <h2 id="agent-infrastructure">Prompts become governed operating assets.</h2>
            <p className="section-lead">
              The active build below is the control surface for organising, reviewing and reusing
              project-specific agent instructions.
            </p>
          </div>
          <div className="portfolio-grid single-card">
            <PortfolioCard entry={agentHub} headingLevel="h3" />
          </div>
        </section>
        <div className="inline-cta">
          <p>Start with the workflow and authority model—not the number of agents.</p>
          <Link className="text-link" href="/services/ai-consulting">
            Explore agentic systems consulting <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
