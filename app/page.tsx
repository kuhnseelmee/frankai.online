import type { Metadata } from 'next'
import Link from 'next/link'
import { AIConsultingTeaser } from '@/components/AIConsultingTeaser'
import { CurrentDevelopment } from '@/components/CurrentDevelopment'
import { PortfolioCard } from '@/components/PortfolioCard'
import { SectionIntro } from '@/components/SectionIntro'
import { featuredPortfolioEntries } from '@/lib/portfolio'

export const metadata: Metadata = {
  alternates: { canonical: '/' }
}

const pathways = [
  {
    title: 'Engage FrankAI',
    text: 'Advisory, implementation and platform engineering grounded in your real operating constraints.',
    href: '/services/ai-consulting',
    label: 'Explore AI consulting'
  },
  {
    title: 'Inspect the work',
    text: 'Review evidence-backed platforms, services, methods and research at their stated maturity.',
    href: '/portfolio',
    label: 'Open the portfolio'
  },
  {
    title: 'Understand the method',
    text: 'See how context, evidence, authority and validation shape the work before automation begins.',
    href: '/methods',
    label: 'Review the methods'
  }
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'FrankAI',
  url: 'https://frankai.online',
  description: 'Applied AI engineering, governed systems and consulting led by Raymond Wooler.',
  founder: {
    '@type': 'Person',
    name: 'Raymond Wooler'
  },
  sameAs: [
    'https://raywooler.online',
    'https://jobs.frankai.online',
    'https://servicedesk.frankai.online',
    'https://openwa.frankai.online',
    'https://multistream.hnrhardhouse.online'
  ]
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Applied AI engineering, governed systems &amp; consulting</p>
            <h1>
              Intelligence built for <span>accountable action.</span>
            </h1>
            <p className="hero-lead">
              FrankAI is Raymond Wooler&apos;s applied engineering practice: designing AI-enabled
              platforms, workflows and methods that preserve human authority, evidence and control.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/services/ai-consulting">Discuss a real workflow</Link>
              <Link className="button button-secondary" href="/portfolio">Inspect the portfolio</Link>
            </div>
          </div>
          <div className="control-panel" aria-label="FrankAI operating model">
            <p className="panel-label">Human-directed, AI-augmented</p>
            <div className="flow-row"><span>01</span><div><strong>Raymond sets intent</strong><p>Purpose, authority, constraints and accountability remain human-owned.</p></div></div>
            <div className="flow-row"><span>02</span><div><strong>Frank augments the work</strong><p>AI supports research, analysis, architecture, implementation and challenge.</p></div></div>
            <div className="flow-row"><span>03</span><div><strong>Evidence governs release</strong><p>Claims and deployments advance only when their controls and results can be inspected.</p></div></div>
            <p className="panel-note">The objective is dependable capability—not simulated autonomy.</p>
          </div>
        </div>
      </section>

      <section className="band audience">
        <div className="container">
          <SectionIntro
            eyebrow="Choose your path"
            title="One coherent engineering practice."
            text="Start with the professional service, inspect what has been built, or examine the methods that hold the work together."
          />
          <div className="card-grid three">
            {pathways.map((path) => (
              <article className="path-card" key={path.title}>
                <h3>{path.title}</h3>
                <p>{path.text}</p>
                <Link className="text-link" href={path.href}>{path.label} <span aria-hidden="true">-&gt;</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="proof">
        <div className="container">
          <AIConsultingTeaser />
          <SectionIntro
            eyebrow="Selected work"
            title="Maturity is part of the evidence."
            text="Every entry is classified as operational, available, active development, pilot or research. Private case studies remain anonymised."
          />
          <div className="portfolio-grid">
            {featuredPortfolioEntries.map((entry) => (
              <PortfolioCard entry={entry} headingLevel="h3" key={entry.slug} />
            ))}
          </div>
          <Link className="button button-secondary proof-button" href="/portfolio">View the complete portfolio</Link>
        </div>
      </section>

      <section className="band audience">
        <div className="container">
          <SectionIntro
            eyebrow="Current development"
            title="What FrankAI is actively working on now."
            text="This view is derived from the same canonical portfolio registry, so public status does not drift between pages."
          />
          <CurrentDevelopment />
          <Link className="text-link" href="/now">Open Current Development <span aria-hidden="true">-&gt;</span></Link>
        </div>
      </section>

      <section className="trust">
        <div className="container trust-grid">
          <SectionIntro
            eyebrow="Governed by design"
            title="Control is an engineering property."
            text="FrankAI turns governance into concrete boundaries: named authority, least-privilege access, evidence lineage, staged releases and recoverable operations."
          />
          <div className="trust-list">
            <div><h3>Claims follow evidence.</h3><p>Research is not labelled operational, and a deployed page is not mistaken for a complete product.</p></div>
            <div><h3>Consequential actions stay deliberate.</h3><p>Access, communication and irreversible change require appropriate human authority.</p></div>
            <div><h3>Ownership includes recovery.</h3><p>Export, rollback, preservation and provider dependence are considered before they become crises.</p></div>
            <Link className="text-link" href="/governance">See the governance model <span aria-hidden="true">-&gt;</span></Link>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container cta-panel">
          <div>
            <p className="eyebrow">Begin with the real problem</p>
            <h2>What work needs to become clearer, safer or more reliable?</h2>
          </div>
          <div className="hero-actions">
            <Link className="button" href="/contact">Discuss the work</Link>
            <Link className="button button-secondary" href="/about">About Raymond</Link>
          </div>
        </div>
      </section>
    </>
  )
}
