import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionIntro } from '@/components/SectionIntro'

export const metadata: Metadata = {
  title: 'Solutions',
  description: 'Operational products and AI-enabled workflows from FrankAI.'
}

export default function SolutionsPage() {
  return (
    <section className="page-section">
      <div className="container">
        <SectionIntro
          eyebrow="Solutions"
          title="AI that belongs inside real operations."
          text="FrankAI solutions focus on structured work: intake, coordination, service delivery and controlled automation."
        />
        <div className="feature-grid">
          <article className="feature-card featured">
            <p className="status">Live product</p>
            <h2>Frank ServiceDesk</h2>
            <p>
              Structured service intake, bookings, operational job handling, quotes, approvals and
              customer tracking in one practical workflow.
            </p>
            <a className="button" href="https://servicedesk.frankai.online">View ServiceDesk</a>
          </article>
          <article className="feature-card">
            <h2>Workflow design</h2>
            <p>Map repetitive operational work into systems that can be assisted, reviewed and governed.</p>
          </article>
          <article className="feature-card">
            <h2>Messaging automation</h2>
            <p>Connect assistant capability to messaging channels while preserving control over events and replies.</p>
          </article>
          <article className="feature-card">
            <h2>Applied AI systems</h2>
            <p>Build purpose-fit tools where AI augments judgement rather than replacing accountability.</p>
          </article>
        </div>
        <div className="inline-cta">
          <p>Have a process that is slow, fragmented or hard to control?</p>
          <Link className="text-link" href="/contact">Discuss a workflow <span aria-hidden="true">-&gt;</span></Link>
        </div>
      </div>
    </section>
  )
}
