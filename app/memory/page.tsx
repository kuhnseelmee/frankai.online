import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionIntro } from '@/components/SectionIntro'

export const metadata: Metadata = {
  title: 'Memory Architecture',
  description: 'How FrankAI stores, indexes and retrieves operating memory.'
}

const flow = [
  ['Ingest', 'Authenticated events arrive from trusted sources and are appended to a durable JSONL queue.'],
  ['Normalize', 'Events keep source, kind, timestamps, privacy level, text and safe metadata in a consistent shape.'],
  ['Index', 'A searchable index is rebuilt from the queue so new memory becomes available after ingestion.'],
  ['Retrieve', 'Runtime search returns bounded excerpts with citations instead of dumping uncontrolled raw history.']
]

const boundaries = [
  'Secrets and credentials do not belong in memory.',
  'Raw bodies are excluded from public citation metadata.',
  'Private and restricted memories need deliberate handling before broader agent use.',
  'The memory layer stays model-portable.'
]

export default function MemoryPage() {
  return (
    <section className="page-section">
      <div className="container">
        <SectionIntro
          eyebrow="Memory architecture"
          title="Continuity belongs to the platform, not the model."
          text="FrankAI uses an owned memory layer so the selected AI model can receive relevant context just in time without pretending the model itself permanently remembers Ray or the business."
        />
        <div className="pillar-grid">
          {flow.map(([title, text], index) => (
            <article className="pillar" key={title}>
              <p className="pillar-number">0{index + 1}</p>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="memory-boundary">
          <div>
            <p className="eyebrow">Boundary rules</p>
            <h2>Useful memory without reckless storage.</h2>
          </div>
          <ul>
            {boundaries.map((boundary) => (
              <li key={boundary}>{boundary}</li>
            ))}
          </ul>
        </div>
        <div className="inline-cta">
          <p>Current live APIs: authenticated memory ingest and authenticated memory search.</p>
          <Link className="button button-secondary" href="/governance">Review governance</Link>
        </div>
      </div>
    </section>
  )
}
