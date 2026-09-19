import { PortfolioCard } from '@/components/PortfolioCard'
import { currentDevelopmentEntries } from '@/lib/portfolio'

export function CurrentDevelopment() {
  return (
    <div className="portfolio-grid">
      {currentDevelopmentEntries.map((entry) => (
        <PortfolioCard entry={entry} headingLevel="h3" key={entry.slug} />
      ))}
    </div>
  )
}
