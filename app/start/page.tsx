import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Start With FrankAI',
  description: 'Choose the clearest path into FrankAI consulting, portfolio evidence or collaboration.',
  alternates: { canonical: '/start' }
}

export default function StartPage() {
  return (
    <section className="page-section narrow">
      <div className="container">
        <header className="page-header">
          <p className="eyebrow">Start with FrankAI</p>
          <h1 className="page-title">Begin with the problem, not the performance of AI.</h1>
          <p className="page-lead">
            The strongest starting point is a real workflow, decision or information problem. Choose
            the path that matches what you need to understand or change.
          </p>
        </header>
        <div className="start-grid">
          <article className="path-card">
            <p className="eyebrow">Organisations</p>
            <h2>Discuss an AI or workflow problem</h2>
            <p>Describe the current work, constraints, risks and outcome. FrankAI will help frame a practical engagement.</p>
            <Link className="button" href="/contact">Start an enquiry</Link>
          </article>
          <article className="path-card">
            <p className="eyebrow">Evidence</p>
            <h2>Inspect the portfolio</h2>
            <p>Review working platforms, active development, pilots, research and anonymised case-study architecture.</p>
            <Link className="button button-secondary" href="/portfolio">Open the portfolio</Link>
          </article>
          <article className="path-card">
            <p className="eyebrow">Approach</p>
            <h2>Understand how FrankAI works</h2>
            <p>See the human-directed operating model, context method and concrete governance controls.</p>
            <Link className="button button-secondary" href="/methods">Review the methods</Link>
          </article>
        </div>
      </div>
    </section>
  )
}
