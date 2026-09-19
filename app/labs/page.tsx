import type { Metadata } from 'next'
import { PortfolioCard } from '@/components/PortfolioCard'
import { getEntriesByCategory } from '@/lib/portfolio'

export const metadata: Metadata = {
  title: 'Labs',
  description:
    'FrankAI pilots and research, clearly separated from operational services and production claims.',
  alternates: { canonical: '/labs' }
}

const labEntries = getEntriesByCategory('Lab')

export default function LabsPage() {
  return (
    <section className="page-section">
      <div className="container">
        <header className="page-header">
          <p className="eyebrow">Labs</p>
          <h1 className="page-title">Experiments should be legible as experiments.</h1>
          <p className="page-lead">
            Labs contains bounded pilots and research. These entries demonstrate learning and
            engineering direction; they are not quietly promoted into finished products.
          </p>
        </header>
        <div className="portfolio-grid">
          {labEntries.map((entry) => (
            <PortfolioCard entry={entry} key={entry.slug} />
          ))}
        </div>
      </div>
    </section>
  )
}
