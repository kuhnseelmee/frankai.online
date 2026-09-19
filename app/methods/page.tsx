import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Methods',
  description:
    'The FrankAI context engineering and governed delivery methods for evidence-led AI work.',
  alternates: { canonical: '/methods' }
}

const contextMethod = [
  ['01', 'Frame', 'Define the real objective, decision, audience, authority and consequences.'],
  ['02', 'Ground', 'Assemble relevant context, source evidence, continuity and known uncertainty.'],
  ['03', 'Design', 'Specify constraints, outputs, controls, failure modes and review points.'],
  ['04', 'Verify', 'Test the result, challenge unsupported claims and preserve a clear handoff.']
]

const deliveryPrinciples = [
  ['Evidence before assertion', 'Maturity and capability are stated only as strongly as the available implementation or documentation supports.'],
  ['Human accountability', 'AI can structure, analyse and prepare; accountable people retain consequential authority.'],
  ['Sovereign by design', 'Ownership, export, recovery and provider dependence are architectural questions, not afterthoughts.'],
  ['Recoverable releases', 'A release is incomplete without reproducible builds, validation evidence and a tested rollback path.']
]

export default function MethodsPage() {
  return (
    <section className="page-section">
      <div className="container">
        <header className="page-header">
          <p className="eyebrow">Methods</p>
          <h1 className="page-title">Context-rich work. Evidence-led decisions. Controlled delivery.</h1>
          <p className="page-lead">
            FrankAI methods turn an ambiguous request into a bounded professional workflow without
            losing the history, constraints or human judgement that make the answer useful.
          </p>
        </header>
        <section aria-labelledby="context-method">
          <div className="section-intro">
            <p className="eyebrow">Context engineering</p>
            <h2 id="context-method">A reusable four-stage method</h2>
            <p className="section-lead">
              The method applies across research, professional writing, planning and technical work.
            </p>
          </div>
          <ol className="method-grid">
            {contextMethod.map(([number, title, text]) => (
              <li className="method-card" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="content-block" aria-labelledby="delivery-method">
          <div className="section-intro">
            <p className="eyebrow">Engineering discipline</p>
            <h2 id="delivery-method">Governance expressed as working practice</h2>
          </div>
          <div className="feature-grid">
            {deliveryPrinciples.map(([title, text]) => (
              <article className="feature-card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <div className="inline-cta">
          <p>Methods are useful only when they improve the resulting work.</p>
          <Link className="text-link" href="/portfolio/context-engineering-method">
            View the method profile <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
