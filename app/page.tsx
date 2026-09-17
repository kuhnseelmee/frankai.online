import Link from 'next/link'
import { PortfolioCard } from '@/components/PortfolioCard'
import { SectionIntro } from '@/components/SectionIntro'
import { featuredPortfolio } from '@/lib/portfolio'

const structuredData = {
  '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'FrankAI', url: 'https://frankai.online',
  description: 'Independent applied AI engineering and consulting for governed systems.', founder: { '@type': 'Person', name: 'Raymond Wooler' },
  serviceType: 'Applied AI engineering and consulting'
}

export default function Home() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <section className="hero"><div className="container hero-grid"><div>
      <p className="eyebrow">Applied AI engineering · governed systems · consulting</p>
      <h1>Build useful AI systems <span>with control.</span></h1>
      <p className="hero-lead">FrankAI is an independent applied AI engineering and consulting initiative founded by Raymond Wooler. We combine systems engineering, AI-assisted research, agent architecture and automation to build practical production-oriented systems.</p>
      <div className="hero-actions"><Link className="button" href="/services/ai-consulting">Explore AI Consulting</Link><Link className="button button-secondary" href="/portfolio">View the portfolio</Link></div>
    </div><div className="control-panel" aria-label="FrankAI operating model"><p className="panel-label">Human-directed operating model</p>
      {['Reconstruct context and constraints.', 'Design the workflow and authority boundary.', 'Build, test and preserve evidence.', 'Deploy carefully with recovery in mind.'].map((text, i) => <div className="flow-row" key={text}><span>0{i + 1}</span><div><strong>{text.split('.')[0]}</strong><p>{text}</p></div></div>)}
      <p className="panel-note">Frank is the AI counterpart used throughout Raymond’s research, architecture, development and problem-solving workflow. Accountability remains human.</p>
    </div></div></section>
    <section className="band audience"><div className="container"><SectionIntro eyebrow="What FrankAI does" title="Engineering depth applied to real work." text="The practice brings together architecture, implementation and disciplined research across systems where governance, sovereignty and recoverability matter." />
      <div className="card-grid three">{['Design governed AI workflows', 'Integrate tools, data and systems', 'Research local and resilient architectures'].map((title, i) => <article className="path-card" key={title}><p className="pillar-number">0{i + 1}</p><h3>{title}</h3><p>{['Turn ambiguous work into scoped, reviewable systems with clear human authority.', 'Connect agents and applications to operational workflows without hiding failure modes.', 'Evaluate practical approaches to private inference, evidence and infrastructure independence.'][i]}</p></article>)}</div>
    </div></section>
    <section className="proof"><div className="container"><SectionIntro eyebrow="Featured work" title="One body of engineering work, at different stages of maturity." text="Platforms, services, methods and labs are shown together without pretending they are all finished products." /><div className="card-grid three">{featuredPortfolio.map((item) => <PortfolioCard item={item} key={item.id} />)}</div><div className="inline-cta"><p>See the complete, privacy-safe portfolio and maturity register.</p><Link className="text-link" href="/portfolio">Browse all work <span aria-hidden="true">-&gt;</span></Link></div></div></section>
    <section className="trust"><div className="container trust-grid"><SectionIntro eyebrow="Engineering principles" title="Governance is part of the build." text="Least privilege, role separation, provenance, auditability, staged deployment, backup and recovery are treated as engineering concerns—not decorative promises." /><div className="trust-list">{[['Human accountability', 'AI assists the work; people retain responsibility for consequential decisions.'], ['Evidence and provenance', 'Important outputs should be traceable to context, authority and validation.'], ['Sovereignty and continuity', 'Private processing, explicit boundaries and recoverable systems guide design choices.']].map(([title, text]) => <div key={title}><h3>{title}</h3><p>{text}</p></div>)}<Link className="text-link" href="/governance">Read Governance &amp; Security <span aria-hidden="true">-&gt;</span></Link></div></div></section>
    <section className="final-cta"><div className="container cta-panel"><div><p className="eyebrow">Start with context</p><h2>Have a workflow worth engineering?</h2></div><div className="hero-actions"><Link className="button" href="/contact">Discuss a project</Link><Link className="button button-secondary" href="/about">About Raymond</Link></div></div></section>
  </>
}
