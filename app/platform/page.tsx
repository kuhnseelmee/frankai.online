import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionIntro } from '@/components/SectionIntro'

export const metadata: Metadata = {
  title: 'Platform',
  description: 'The FrankAI platform direction, principles and integration capability.'
}

const pillars = [
  ['Agent workspace', 'Persistent identity, working memory and tool access organised around a clear operating role.'],
  ['Governed execution', 'Missions, approvals, access boundaries and action receipts before consequential work is automated.'],
  ['Memory layer', 'Ingested events become searchable context that can travel across models and interfaces.'],
  ['Release discipline', 'Capability moves through staged readiness instead of vague promises or uncontrolled autonomy.']
]

const platformLinks = [
  ['/governance', 'Governance controls', 'Approval gates, policy boundaries and evidence requirements.'],
  ['/rollout', 'Staged rollout', 'How capability moves from foundation to pilot to first release.'],
  ['/release-cycle', 'Execution priorities', 'The practical worklist for the first platform release cycle.'],
  ['/memory', 'Memory architecture', 'How FrankAI turns history into retrievable operating context.']
]

export default function PlatformPage() {
  return (
    <section className="page-section">
      <div className="container">
        <SectionIntro
          eyebrow="Platform direction"
          title="A practical intelligence layer for action."
          text="FrankAI is evolving from a public assistant presence into an enterprise AI-agent platform: memory, governance, execution and release control held together as one operating layer."
        />
        <div className="pillar-grid">
          {pillars.map(([title, text], index) => (
            <article className="pillar" key={title}>
              <p className="pillar-number">0{index + 1}</p>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="platform-directory">
          {platformLinks.map(([href, title, text]) => (
            <Link className="directory-link" href={href} key={href}>
              <span>{title}</span>
              <p>{text}</p>
            </Link>
          ))}
        </div>
        <div className="platform-note">
          <h2>For partners and serious collaborators</h2>
          <p>
            FrankAI is not positioned as a generic AI wrapper. The aim is controlled capability:
            agents, products and systems that can become trusted parts of genuine work.
          </p>
          <Link className="button" href="/contact">Start a conversation</Link>
        </div>
      </div>
    </section>
  )
}
