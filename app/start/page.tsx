import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Start With Frank',
  description: 'Choose how you want to begin with FrankAI.'
}

export default function StartPage() {
  return (
    <section className="page-section narrow">
      <div className="container">
        <p className="eyebrow">Start with Frank</p>
        <h1 className="page-title">The first-party experience is being prepared.</h1>
        <p className="page-lead">
          FrankAI is moving to an owned platform with clear controls and no dependency on the
          previous hosted app builder. Until direct access is ready, choose the path that fits your purpose.
        </p>
        <div className="start-grid">
          <article className="path-card">
            <h2>Explore operational solutions</h2>
            <p>See what is live today, including Frank ServiceDesk and workflow capability.</p>
            <Link className="button" href="/solutions">View solutions</Link>
          </article>
          <article className="path-card">
            <h2>Register interest</h2>
            <p>Describe whether you are seeking personal access, a client solution or a partnership discussion.</p>
            <Link className="button button-secondary" href="/contact">Contact FrankAI</Link>
          </article>
        </div>
      </div>
    </section>
  )
}
