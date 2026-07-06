import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionIntro } from '@/components/SectionIntro'
import { deploymentProofs, type DeploymentProof } from '@/lib/deployment-proofs'
import styles from './proof.module.css'

export const metadata: Metadata = {
  title: 'Proof',
  description: 'Working FrankAI systems, capability status and operational proof points across live deployments.'
}

const proofPoints = [
  {
    title: 'Frank ServiceDesk',
    status: 'Live',
    text: 'Customer intake, booking, staff job handling, diagnostics, quote approval, invoice flow and repair status tracking are implemented as a working operations product.',
    href: 'https://servicedesk.frankai.online'
  },
  {
    title: 'Messaging bridge',
    status: 'Live',
    text: 'OpenWA is connected through a signed webhook bridge, proving that assistant events can move through real communication infrastructure with controlled routing.',
    href: 'https://openwa.frankai.online'
  },
  {
    title: 'Platform console',
    status: 'Staged',
    text: 'The first-party platform surface includes health, memory, governance and approval concepts that turn capability into something reviewable.'
  },
  {
    title: 'Inspect Pro',
    status: 'Staged',
    text: 'A property inspection and operations application has been staged on the VPS, pending DNS completion and further production hardening.'
  }
]

const workflow = [
  ['01', 'Conversation or intake captures the request without asking for passwords or unnecessary private material.'],
  ['02', 'Frank structures the issue into risk, priority, recommended next step and operational record.'],
  ['03', 'A human operator reviews the record, assigns work, requests approval or rejects unsafe action.'],
  ['04', 'The system preserves status, notes, decisions and customer-visible progress.']
]

const readiness = [
  ['Live', 'First-party public site, governance pages, ServiceDesk MVP and messaging bridge.'],
  ['Staged', 'Frank Dispatch approval flow, Inspect Pro deployment, memory search and platform console.'],
  ['Locked', 'Broad autonomous action, unreviewed outbound communication and unrestricted mailbox ingestion.'],
  ['Planned', 'Case-study screenshots, public roadmap, production database migration and incident response policy.']
]

function DeploymentProofCard({
  name,
  url,
  category,
  status,
  description,
  purpose,
  significance
}: DeploymentProof) {
  return (
    <article className={styles.deploymentProofCard}>
      <div className={styles.deploymentProofTop}>
        <div>
          <p className={styles.proofCategory}>{category}</p>
          <h3>{name}</h3>
        </div>
        <span>{status}</span>
      </div>
      <p className={styles.deploymentProofDescription}>{description}</p>
      <div className={styles.deploymentProofDetails}>
        <div>
          <p className={styles.deploymentProofLabel}>Purpose</p>
          <p>{purpose}</p>
        </div>
        <div>
          <p className={styles.deploymentProofLabel}>Technical significance</p>
          <p>{significance}</p>
        </div>
      </div>
      <a
        className={`button button-secondary ${styles.deploymentProofLink}`}
        href={url}
        rel="noopener noreferrer"
        target="_blank"
      >
        Visit live deployment
      </a>
    </article>
  )
}

export default function ProofPage() {
  return (
    <section className="page-section">
      <div className="container">
        <SectionIntro
          eyebrow="Operational proof"
          title="FrankAI is built through working systems, not pitch-deck capability."
          text="The platform thesis is simple: conversations should become controlled workflows, approvals, records and accountable action."
        />
        <div className="proof-directory">
          {proofPoints.map((point) => (
            <article className="proof-card" key={point.title}>
              <div className="proof-head">
                <h2>{point.title}</h2>
                <span>{point.status}</span>
              </div>
              <p>{point.text}</p>
              {point.href ? (
                <a
                  className="text-link"
                  href={point.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Open system <span aria-hidden="true">-&gt;</span>
                </a>
              ) : null}
            </article>
          ))}
        </div>
        <section className={styles.deploymentProofSection}>
          <SectionIntro
            eyebrow="Deployment proof"
            title="Live Deployment Proofs"
            text="These deployments represent live proof-of-work across broadcast infrastructure, compliance-grade evidence systems and secure trading automation. Each project shows applied architecture, deployment capability and the ability to turn strategic concepts into working public infrastructure."
          />
          <div className={styles.deploymentProofGrid}>
            {deploymentProofs.map((proof) => (
              <DeploymentProofCard key={proof.name} {...proof} />
            ))}
          </div>
        </section>
        <div className="proof-workflow">
          <div>
            <p className="eyebrow">Workflow pattern</p>
            <h2>From conversation to controlled work.</h2>
            <p>
              FrankAI is strongest when the assistant does not merely answer. It turns intent into
              structured work that can be reviewed, actioned and audited.
            </p>
          </div>
          <div className="timeline">
            {workflow.map(([number, text]) => (
              <div className="timeline-item compact" key={number}>
                <span className="pillar-number">{number}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="trust-evidence">
          <div>
            <p className="eyebrow">Readiness register</p>
            <h2>What can be trusted today, and what remains deliberately gated.</h2>
          </div>
          <div className="capability-list">
            {readiness.map(([status, description]) => (
              <div className="capability-row" key={description}>
                <span className={`capability-status status-${status.toLowerCase()}`}>{status}</span>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="inline-cta">
          <p>Have a workflow that needs governed AI assistance?</p>
          <Link className="text-link" href="/contact">Send a controlled enquiry <span aria-hidden="true">-&gt;</span></Link>
        </div>
      </div>
    </section>
  )
}
