import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionIntro } from '@/components/SectionIntro'

export const metadata: Metadata = {
  title: 'Platform',
  description: 'The FrankAI platform direction, principles and integration capability.'
}

const pillars = [
  ['Assistance', 'Clear reasoning, planning and interaction shaped around the user and their context.'],
  ['Workflows', 'Operational products that turn conversation into structured, trackable work.'],
  ['Integrations', 'Controlled links to communication and service systems without surrendering oversight.'],
  ['Governance', 'Security, privacy, approvals and auditability built into the operating model.']
]

export default function PlatformPage() {
  return (
    <section className="page-section">
      <div className="container">
        <SectionIntro
          eyebrow="Platform direction"
          title="A practical intelligence layer for action."
          text="FrankAI is evolving as a connected platform: an assistant, operational products and integration infrastructure held together by disciplined controls."
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
        <div className="platform-note">
          <h2>For partners and serious collaborators</h2>
          <p>
            FrankAI is not positioned as a generic AI wrapper. The aim is controlled capability:
            products and systems that can become trusted parts of genuine work.
          </p>
          <Link className="button" href="/contact">Start a conversation</Link>
        </div>
      </div>
    </section>
  )
}
