import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionIntro } from '@/components/SectionIntro'
import { currentWork } from '@/lib/current-work'
import { deploymentProofs } from '@/lib/deployment-proofs'

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
            <p>Connect assistant capability to messaging channels while preserving control over events, replies, execution state and operator review.</p>
          </article>
          <article className="feature-card">
            <h2>Android operations labs</h2>
            <p>Build local control rooms for Android provisioning, ADB-assisted workflows, network-state inspection and evidence capture.</p>
          </article>
          <article className="feature-card">
            <h2>Applied AI systems</h2>
            <p>Build purpose-fit tools where AI augments judgement rather than replacing accountability.</p>
          </article>
        </div>
        <section className="proof-section">
          <SectionIntro
            eyebrow="Latest work"
            title="Android and SMS control surfaces."
            text="The newest builds expand FrankAI's proof portfolio into device-side operations and governed messaging execution."
          />
          <div className="proof-directory">
            {currentWork.map((item) => (
              <article className="proof-card" key={item.name}>
                <div className="proof-head">
                  <h3>{item.name}</h3>
                  <span>{item.status}</span>
                </div>
                <p>{item.category}</p>
                <p>{item.summary}</p>
                <p>{item.proof}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="proof-section">
          <SectionIntro
            eyebrow="Operational proof portfolio"
            title="Live and emerging deployments."
            text="These public deployments show the current execution footprint across broadcast infrastructure, evidence systems and secure trading automation."
          />
          <div className="proof-directory">
            {deploymentProofs.map((proof) => (
              <article className="proof-card" key={proof.name}>
                <div className="proof-head">
                  <h3>{proof.name}</h3>
                  <span>{proof.status}</span>
                </div>
                <p>{proof.category}</p>
                <p>{proof.description}</p>
                <a
                  className="text-link"
                  href={proof.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Visit live deployment <span aria-hidden="true">-&gt;</span>
                </a>
              </article>
            ))}
          </div>
        </section>
        <div className="inline-cta">
          <p>Have a process that is slow, fragmented or hard to control?</p>
          <Link className="text-link" href="/contact">Discuss a workflow <span aria-hidden="true">-&gt;</span></Link>
        </div>
      </div>
    </section>
  )
}
