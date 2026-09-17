import Link from 'next/link'
import type { PortfolioItem } from '@/lib/portfolio'

export function PortfolioCard({ item }: { item: PortfolioItem }) {
  const link = item.publicLinks?.[0]
  return (
    <article className="portfolio-card">
      <div className="portfolio-card-top">
        <p className="eyebrow">{item.category}</p>
        <span className={`status status-${item.status.toLowerCase().replaceAll(' ', '-')}`}>{item.visibility === 'Private' ? `Private · ${item.status}` : item.status}</span>
      </div>
      <h3>{item.name}</h3>
      <p>{item.shortDescription}</p>
      <div className="tag-list" aria-label="Themes">
        {item.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      {link?.href.startsWith('/') ? <Link className="text-link" href={link.href}>{link.label} <span aria-hidden="true">-&gt;</span></Link> : link ? <a className="text-link" href={link.href} rel="noopener noreferrer" target="_blank">{link.label} <span aria-hidden="true">-&gt;</span></a> : null}
    </article>
  )
}
