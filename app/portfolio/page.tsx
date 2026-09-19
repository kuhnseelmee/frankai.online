import type { Metadata } from 'next'
import { PortfolioDirectory } from '@/components/PortfolioDirectory'

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Evidence-backed FrankAI platforms, services, methods and research, with maturity and privacy boundaries made explicit.',
  alternates: { canonical: '/portfolio' }
}

export default function PortfolioPage() {
  return (
    <section className="page-section">
      <div className="container">
        <header className="page-header">
          <p className="eyebrow">Portfolio</p>
          <h1 className="page-title">Built work, stated at its real maturity.</h1>
          <p className="page-lead">
            FrankAI brings platforms, professional services, reusable methods and research into one
            evidence-led engineering practice. Operational, active, pilot and research work remain
            visibly distinct.
          </p>
        </header>
        <PortfolioDirectory />
      </div>
    </section>
  )
}
