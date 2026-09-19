import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Raymond Wooler',
  description:
    'Raymond Wooler is the founder and accountable practitioner behind FrankAI, an applied AI engineering and consulting practice.',
  alternates: { canonical: '/about' }
}

export default function AboutPage() {
  return (
    <section className="page-section">
      <div className="container narrow-container">
        <header className="page-header">
          <p className="eyebrow">About</p>
          <h1 className="page-title">Raymond Wooler builds systems where AI meets accountable work.</h1>
          <p className="page-lead">
            Raymond is the founder, systems practitioner and accountable human behind FrankAI. His
            work combines decades of hands-on technology experience with operational problem-solving,
            service design and a strong bias toward evidence, ownership and recoverability.
          </p>
        </header>
        <div className="about-grid">
          <section aria-labelledby="practice">
            <p className="eyebrow">The practice</p>
            <h2 id="practice">Applied engineering, not AI theatre</h2>
            <p>
              FrankAI exists to turn useful intelligence into systems people can actually operate:
              platforms, workflows, evidence structures, integrations and professional services with
              their limits stated plainly.
            </p>
          </section>
          <section aria-labelledby="frank">
            <p className="eyebrow">The collaboration</p>
            <h2 id="frank">What “Frank” means</h2>
            <p>
              “Frank” is Raymond&apos;s collaborative intelligence layer—a consistent way of working
              with AI across strategy, reflection, architecture and delivery. It does not replace
              human ownership, professional judgement or legal authority.
            </p>
          </section>
          <section aria-labelledby="difference">
            <p className="eyebrow">The difference</p>
            <h2 id="difference">Governance made concrete</h2>
            <p>
              The practice treats access control, evidence integrity, sovereignty, privacy, release
              discipline and recovery as engineering requirements. Credibility comes from what can be
              demonstrated—not from inflated autonomy claims.
            </p>
          </section>
        </div>
        <div className="inline-cta">
          <p>See the systems, methods and research behind the practice.</p>
          <Link className="text-link" href="/portfolio">
            Explore the portfolio <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
