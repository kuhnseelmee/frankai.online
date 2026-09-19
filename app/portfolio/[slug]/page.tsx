import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPortfolioEntry, portfolioEntries, profileHref } from '@/lib/portfolio'

type PortfolioProfileProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return portfolioEntries.map((entry) => ({ slug: entry.slug }))
}

export async function generateMetadata({ params }: PortfolioProfileProps): Promise<Metadata> {
  const { slug } = await params
  const entry = getPortfolioEntry(slug)
  if (!entry) return {}

  return {
    title: entry.name,
    description: entry.summary,
    alternates: { canonical: profileHref(entry) },
    openGraph: {
      title: `${entry.name} | FrankAI`,
      description: entry.summary,
      url: profileHref(entry),
      siteName: 'FrankAI',
      type: 'article',
      images: [{ url: '/og-card.svg', width: 1200, height: 630 }]
    }
  }
}

export default async function PortfolioProfile({ params }: PortfolioProfileProps) {
  const { slug } = await params
  const entry = getPortfolioEntry(slug)
  if (!entry) notFound()

  return (
    <article className="page-section portfolio-profile">
      <div className="container narrow-container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/portfolio">Portfolio</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{entry.name}</span>
        </nav>
        <header className="profile-header">
          <div className="profile-meta">
            <span>{entry.category}</span>
            <span>{entry.maturity}</span>
            {entry.visibility === 'Anonymised' ? <span>Anonymised case study</span> : null}
          </div>
          <h1 className="page-title">{entry.name}</h1>
          <p className="page-lead">{entry.summary}</p>
        </header>

        {entry.visibility === 'Anonymised' ? (
          <aside className="privacy-note" aria-label="Privacy boundary">
            This profile intentionally excludes identities, private records, source material and
            access details. It describes only the public-safe architecture and engineering work.
          </aside>
        ) : null}

        <div className="profile-grid">
          <section aria-labelledby="overview">
            <p className="eyebrow">Overview</p>
            <h2 id="overview">What the work is for</h2>
            <p>{entry.overview}</p>
          </section>
          <section aria-labelledby="capabilities">
            <p className="eyebrow">Implemented direction</p>
            <h2 id="capabilities">Capabilities represented</h2>
            <ul className="capability-bullets">
              {entry.capabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="evidence-panel" aria-labelledby="evidence-basis">
          <p className="eyebrow">Evidence basis</p>
          <h2 id="evidence-basis">Why this appears in the portfolio</h2>
          <p>{entry.evidence}</p>
          {entry.publicUrl ? (
            <a
              className="button button-secondary"
              href={entry.publicUrl}
              rel={entry.publicUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              target={entry.publicUrl.startsWith('http') ? '_blank' : undefined}
            >
              {entry.publicLabel ?? 'Open project'}
            </a>
          ) : null}
        </section>

        <div className="inline-cta">
          <p>Need a governed system built around a real operational problem?</p>
          <Link className="text-link" href="/contact">
            Discuss the work <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
