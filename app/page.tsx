import Link from 'next/link'
import { SectionIntro } from '@/components/SectionIntro'

const pathways = [
  {
    title: 'Use FrankAI',
    text: 'A strategic assistant for clear thinking, planning and practical execution support.',
    href: '/start',
    label: 'Start a conversation'
  },
  {
    title: 'Deploy Solutions',
    text: 'AI-enabled workflows for service delivery, operations and controlled automation.',
    href: '/solutions',
    label: 'Explore solutions'
  },
  {
    title: 'Partner With Us',
    text: 'Understand the platform direction, integrations and commercial opportunity.',
    href: '/platform',
    label: 'View platform'
  }
]

const proof = [
  {
    title: 'Frank ServiceDesk',
    status: 'Live',
    text: 'A service workflow product covering intake, booking, job handling, quotes and customer tracking.',
    href: 'https://servicedesk.frankai.online'
  },
  {
    title: 'Messaging integration',
    status: 'Operating',
    text: 'A signed messaging bridge supporting controlled assistant events and operational integration.',
    href: 'https://openwa.frankai.online'
  },
  {
    title: 'Governed assistance',
    status: 'Core principle',
    text: 'External actions remain deliberate: approvals, boundaries and auditability matter more than spectacle.',
    href: '/platform'
  }
]

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Strategic AI and operational systems</p>
            <h1>
              Intelligence that <span>moves work forward.</span>
            </h1>
            <p className="hero-lead">
              FrankAI combines strategic assistance, operational workflows and controlled automation
              for people and organisations building what comes next.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/start">Talk to Frank</Link>
              <Link className="button button-secondary" href="/solutions">Explore solutions</Link>
            </div>
          </div>
          <div className="control-panel" aria-label="FrankAI operating principles">
            <p className="panel-label">Operating model</p>
            <div className="flow-row"><span>01</span><div><strong>Understand</strong><p>Clarify intent, context and constraints.</p></div></div>
            <div className="flow-row"><span>02</span><div><strong>Plan</strong><p>Shape the strongest practical path.</p></div></div>
            <div className="flow-row"><span>03</span><div><strong>Act with control</strong><p>Execute carefully, keeping consequential actions governed.</p></div></div>
            <p className="panel-note">Privacy, accountability and human judgment are design requirements.</p>
          </div>
        </div>
      </section>

      <section className="band audience">
        <div className="container">
          <SectionIntro
            eyebrow="Choose your path"
            title="One platform, three ways in."
            text="FrankAI serves individuals, operating teams and strategic partners without collapsing their needs into one vague promise."
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
          <SectionIntro
            eyebrow="Already real"
            title="Proof before promises."
            text="FrankAI is being built through working systems and controlled integrations, not a fictional product demonstration."
          />
          <div className="card-grid three">
            {proof.map((item) => (
              <article className="proof-card" key={item.title}>
                <div className="proof-head">
                  <h3>{item.title}</h3>
                  <span>{item.status}</span>
                </div>
                <p>{item.text}</p>
                <Link className="text-link" href={item.href}>Learn more <span aria-hidden="true">-&gt;</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="trust">
        <div className="container trust-grid">
          <SectionIntro
            eyebrow="Built on trust"
            title="Control is not a feature added later."
            text="Useful intelligence must respect the person or organisation relying on it. FrankAI is designed around boundaries that make action trustworthy."
          />
          <div className="trust-list">
            <div><h3>Your data remains entrusted territory.</h3><p>Privacy and ownership are treated as obligations, not marketing decoration.</p></div>
            <div><h3>Consequential actions stay deliberate.</h3><p>External communication, access and irreversible steps require appropriate control.</p></div>
            <div><h3>Systems should leave evidence.</h3><p>Operational workflows are built to be inspectable, accountable and maintainable.</p></div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container cta-panel">
          <div>
            <p className="eyebrow">Begin deliberately</p>
            <h2>Find the right path into FrankAI.</h2>
          </div>
          <div className="hero-actions">
            <Link className="button" href="/start">Start with Frank</Link>
            <Link className="button button-secondary" href="/contact">Discuss a workflow</Link>
          </div>
        </div>
      </section>
    </>
  )
}
