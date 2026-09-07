import type { Metadata } from 'next'
import Link from 'next/link'
import { aiConsulting } from '@/lib/ai-consulting'
import styles from './service.module.css'

export const metadata: Metadata = {
  title: aiConsulting.title,
  description: aiConsulting.subtitle,
  alternates: { canonical: aiConsulting.href },
  openGraph: {
    title: `${aiConsulting.title} | FrankAI`,
    description: aiConsulting.subtitle,
    url: aiConsulting.href,
    siteName: 'FrankAI',
    type: 'website',
    images: [{ url: '/images/logo_frankai.png', width: 1536, height: 1024 }]
  }
}

export default function AIConsultingPage() {
  return (
    <div className="page-section">
      <div className="container">
        <header>
          <p className="eyebrow">{aiConsulting.classification}</p>
          <h1 className="page-title">{aiConsulting.title}</h1>
          <p className="page-lead">{aiConsulting.subtitle}</p>
        </header>
        <div className="section-intro">
          <h2>{aiConsulting.proposition}</h2>
          <p className="section-lead">
            Move from AI experimentation to practical delivery. We design and implement governed AI
            solutions around your industry, people and existing systems—from focused workflow
            automation to reusable multi-agent platforms.
          </p>
        </div>
        <section aria-labelledby="commercial-offer" className={styles.section}>
          <div className="section-intro">
            <p className="eyebrow">How we work with you</p>
            <h2 id="commercial-offer">Advisory → Implementation → Platform Engineering</h2>
            <p className="section-lead">
              Start with the support you need. Each engagement has an agreed scope, clear outcomes
              and a practical handover to your team.
            </p>
          </div>
          <ol className={`card-grid three ${styles.list}`}>
            {aiConsulting.stages.map((stage, index) => (
              <li className="path-card" key={stage.title}>
                <p className="pillar-number">0{index + 1}</p>
                <h3>{stage.title}</h3>
                <p>{stage.text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="service-areas" className={styles.section}>
          <div className="section-intro">
            <p className="eyebrow">Built around your operations</p>
            <h2 id="service-areas">Service areas</h2>
            <p className="section-lead">
              Choose a focused implementation or combine capabilities into a wider operational platform.
            </p>
          </div>
          <ul className={`feature-grid ${styles.list}`}>
            {aiConsulting.areas.map((area) => (
              <li className="feature-card" key={area}>{area}</li>
            ))}
          </ul>
        </section>
        <div className="inline-cta">
          <p>Tell us about your workflow, your constraints and the outcome you need.</p>
          <Link className="text-link" href="/contact">
            Discuss your AI project <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
