import type { Metadata } from 'next'
import Link from 'next/link'
import { AIConsultingTeaser } from '@/components/AIConsultingTeaser'
import { PortfolioCard } from '@/components/PortfolioCard'
import { getEntriesByCategory } from '@/lib/portfolio'

export const metadata: Metadata = {
  title: 'Solutions',
  description:
    'FrankAI consulting and governed operational platforms for workflow, evidence, service delivery and controlled automation.',
  alternates: { canonical: '/solutions' }
}

const platformEntries = getEntriesByCategory('Platform')

const solutionAreas = [
  ['Operational workflow design', 'Turn fragmented intake, decisions, approvals and follow-up into a visible, owned process.'],
  ['Evidence and knowledge systems', 'Preserve source lineage, retrieval context and reviewable records without flattening uncertainty.'],
  ['Agentic integration', 'Connect AI to tools and systems through bounded roles, explicit permissions and observable outcomes.'],
  ['Private and hybrid AI', 'Choose local, cloud or hybrid architecture according to privacy, quality, latency and operating cost.']
]

export default function SolutionsPage() {
  return (
    <section className="page-section">
      <div className="container">
        <header className="page-header">
          <p className="eyebrow">Solutions</p>
          <h1 className="page-title">AI engineering that starts with the operating problem.</h1>
          <p className="page-lead">
            FrankAI designs the workflow, evidence and authority model before choosing the automation.
            The result can be a focused implementation, a reusable platform or a staged pilot.
          </p>
        </header>
        <AIConsultingTeaser />
        <section aria-labelledby="solution-areas">
          <div className="section-intro">
            <p className="eyebrow">Where we apply it</p>
            <h2 id="solution-areas">Practical systems around real work</h2>
          </div>
          <div className="feature-grid">
            {solutionAreas.map(([title, text]) => (
              <article className="feature-card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="content-block" aria-labelledby="platform-work">
          <div className="section-intro">
            <p className="eyebrow">Platform work</p>
            <h2 id="platform-work">Implemented, active and pilot systems</h2>
            <p className="section-lead">
              Status comes from the canonical portfolio registry. An operational system and an active
              build are not presented as the same thing.
            </p>
          </div>
          <div className="portfolio-grid">
            {platformEntries.map((entry) => (
              <PortfolioCard entry={entry} headingLevel="h3" key={entry.slug} />
            ))}
          </div>
        </section>
        <div className="inline-cta">
          <p>Have a process that is slow, fragmented or difficult to govern?</p>
          <Link className="text-link" href="/contact">Discuss the workflow <span aria-hidden="true">-&gt;</span></Link>
        </div>
      </div>
    </section>
  )
}
