import { PortfolioCard } from '@/components/PortfolioCard'
import {
  getEntriesByCategory,
  portfolioCategories,
  type PortfolioCategory
} from '@/lib/portfolio'

type PortfolioDirectoryProps = {
  categories?: readonly PortfolioCategory[]
}

export function PortfolioDirectory({ categories = portfolioCategories }: PortfolioDirectoryProps) {
  return (
    <div className="portfolio-directory">
      {categories.map((category) => {
        const entries = getEntriesByCategory(category)
        if (entries.length === 0) return null

        return (
          <section className="portfolio-group" aria-labelledby={`portfolio-${category.toLowerCase()}`} key={category}>
            <div className="portfolio-group-heading">
              <p className="eyebrow">{category}</p>
              <h2 id={`portfolio-${category.toLowerCase()}`}>{category}s</h2>
            </div>
            <div className="portfolio-grid">
              {entries.map((entry) => (
                <PortfolioCard entry={entry} headingLevel="h3" key={entry.slug} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
