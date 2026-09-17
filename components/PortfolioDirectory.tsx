import { PortfolioCard } from '@/components/PortfolioCard'
import type { PortfolioCategory, PortfolioItem } from '@/lib/portfolio'

export function PortfolioDirectory({ items, categories }: { items: PortfolioItem[]; categories?: PortfolioCategory[] }) {
  const groups = (categories ?? ['Platform', 'Service', 'Method', 'Lab']).map((category) => ({ category, items: items.filter((item) => item.category === category) })).filter((group) => group.items.length)
  return <div className="portfolio-directory">{groups.map((group) => <section key={group.category} aria-labelledby={`portfolio-${group.category}`}><div className="portfolio-group-heading"><p className="eyebrow">{group.category}</p><h2 id={`portfolio-${group.category}`}>{group.category === 'Platform' ? 'Substantial systems' : group.category === 'Service' ? 'Professional capability' : group.category === 'Method' ? 'Reusable ways of working' : 'Research and emerging work'}</h2></div><div className="card-grid three">{group.items.map((item) => <PortfolioCard item={item} key={item.id} />)}</div></section>)}</div>
}
