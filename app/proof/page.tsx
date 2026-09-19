import type { Metadata } from 'next'
import Link from 'next/link'
import { PortfolioCard } from '@/components/PortfolioCard'
import { portfolioEntries, portfolioMaturities } from '@/lib/portfolio'

export const metadata: Metadata = {
  title: 'Evidence & Proof',
  description:
    'The evidence discipline behind FrankAI portfolio claims, maturity labels and public project links.',
  alternates: { canonical: '/proof' }
}

const maturityMeaning = {
  Operational: 'Implemented and in active use within its stated boundary.',
  Available: 'A professional service that can be scoped and delivered now.',
  'Active Development': 'Substantive implementation exists and work is continuing.',
  Pilot: 'A bounded deployment or MVP is being tested; broader production claims are withheld.',
  Research: 'An evidence-led investigation or experiment, not an operational product.'
} as const

const evidenceRules = [
  ['Implementation over naming', 'A project name, domain or design concept is not enough; public entries need identifiable code, deployment or authoritative documentation.'],
  ['Status follows the weakest material boundary', 'A functioning page does not make every promised integration operational.'],
  ['Privacy limits publication', 'Private work may be represented only through neutral, architecture-level descriptions.'],
  ['Links are deliberate', 'Broken, private or unverified endpoints are withheld even when the underlying work remains in the registry.']
]

export default function ProofPage() {
  return (
    <section className="page-section">
      <div className="container">
        <header className="page-header">
          <p className="eyebrow">Evidence and proof</p>
          <h1 className="page-title">Credibility comes from bounded, testable claims.</h1>
          <p className="page-lead">
            FrankAI does not use “live” as a decorative label. Public work is reconciled against
            implementation, documentation and endpoint evidence, then presented at the maturity that
            evidence supports.
          </p>
        </header>

        <section aria-labelledby="maturity-register">
          <div className="section-intro">
            <p className="eyebrow">Maturity register</p>
            <h2 id="maturity-register">Five labels with distinct meanings</h2>
          </div>
          <div className="maturity-grid">
            {portfolioMaturities.map((maturity) => (
              <article className="maturity-card" key={maturity}>
                <span className={`maturity maturity-${maturity.toLowerCase().replaceAll(' ', '-')}`}>{maturity}</span>
                <p>{maturityMeaning[maturity]}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="content-block" aria-labelledby="evidence-rules">
          <div className="section-intro">
            <p className="eyebrow">Publication rules</p>
            <h2 id="evidence-rules">How claims enter the public portfolio</h2>
          </div>
          <div className="feature-grid">
            {evidenceRules.map(([title, text]) => (
              <article className="feature-card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="content-block" aria-labelledby="evidence-backed-work">
          <div className="section-intro">
            <p className="eyebrow">Evidence-backed work</p>
            <h2 id="evidence-backed-work">The current public register</h2>
            <p className="section-lead">
              Each profile states its evidence basis and exposes an external link only when that link
              is intentionally public and currently verified.
            </p>
          </div>
          <div className="portfolio-grid">
            {portfolioEntries.map((entry) => (
              <PortfolioCard entry={entry} headingLevel="h3" key={entry.slug} />
            ))}
          </div>
        </section>

        <div className="inline-cta">
          <p>Inspect the portfolio by platform, service, method and lab.</p>
          <Link className="text-link" href="/portfolio">Open the portfolio <span aria-hidden="true">-&gt;</span></Link>
        </div>
      </div>
    </section>
  )
}
