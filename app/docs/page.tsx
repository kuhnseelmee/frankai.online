import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionIntro } from '@/components/SectionIntro'

export const metadata: Metadata = {
  title: 'Docs',
  description: 'FrankAI platform documentation entry point.'
}

const docs = [
  ['/platform', 'Platform overview', 'What FrankAI is becoming and how the pieces fit together.'],
  ['/governance', 'Governance controls', 'Execution levels, approval gates and action evidence.'],
  ['/rollout', 'Staged rollout', 'The practical migration from foundation to first release.'],
  ['/release-cycle', 'Release priorities', 'What matters during the first platform release cycle.'],
  ['/memory', 'Memory architecture', 'Ingest, index, retrieve and protect operating memory.'],
  ['/trust', 'Trust register', 'Live, staged and locked capability status.']
]

export default function DocsPage() {
  return (
    <section className="page-section">
      <div className="container">
        <SectionIntro
          eyebrow="Platform docs"
          title="The first documentation spine for FrankAI."
          text="These docs make the platform legible: what is live, what is controlled, what is next and what should not be treated as active yet."
        />
        <div className="docs-grid">
          {docs.map(([href, title, text]) => (
            <Link className="directory-link" href={href} key={href}>
              <span>{title}</span>
              <p>{text}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
