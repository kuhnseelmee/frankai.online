import Link from 'next/link'
import { profileHref, type PortfolioEntry } from '@/lib/portfolio'

type PortfolioCardProps = {
  entry: PortfolioEntry
  headingLevel?: 'h2' | 'h3'
}

export function PortfolioCard({ entry, headingLevel = 'h2' }: PortfolioCardProps) {
  const Heading = headingLevel

  return (
    <article className="portfolio-card">
      <div className="portfolio-card-top">
        <p className="portfolio-category">{entry.category}</p>
        <div className="status-stack" aria-label={`Status: ${entry.maturity}${entry.visibility === 'Anonymised' ? '; anonymised case study' : ''}`}>
          <span className={`maturity maturity-${entry.maturity.toLowerCase().replaceAll(' ', '-')}`}>
            {entry.maturity}
          </span>
          {entry.visibility === 'Anonymised' ? <span className="visibility">Anonymised</span> : null}
        </div>
      </div>
      <Heading>
        <Link href={profileHref(entry)}>{entry.name}</Link>
      </Heading>
      <p>{entry.summary}</p>
      <div className="portfolio-actions">
        <Link className="text-link" href={profileHref(entry)}>
          View profile <span aria-hidden="true">-&gt;</span>
        </Link>
        {entry.publicUrl ? (
          <a
            className="text-link text-link-secondary"
            href={entry.publicUrl}
            rel={entry.publicUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
            target={entry.publicUrl.startsWith('http') ? '_blank' : undefined}
          >
            {entry.publicLabel ?? 'Open project'} <span aria-hidden="true">-&gt;</span>
          </a>
        ) : null}
      </div>
    </article>
  )
}
