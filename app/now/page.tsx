import type { Metadata } from 'next'
import { CurrentDevelopment } from '@/components/CurrentDevelopment'

export const metadata: Metadata = {
  title: 'Current Development',
  description: 'The active FrankAI development and research priorities derived from the public portfolio registry.',
  alternates: { canonical: '/now' }
}

export default function NowPage() {
  return (
    <section className="page-section">
      <div className="container">
        <header className="page-header">
          <p className="eyebrow">Now</p>
          <h1 className="page-title">Current development, without roadmap theatre.</h1>
          <p className="page-lead">
            This view is generated from the same canonical registry as the portfolio. It shows work
            that is active now while preserving the distinction between development and research.
          </p>
        </header>
        <CurrentDevelopment />
      </div>
    </section>
  )
}
