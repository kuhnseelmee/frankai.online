import type { Metadata } from 'next'
import { ContactForm } from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact FrankAI about access, solutions or partnership.'
}

export default function ContactPage() {
  return (
    <section className="page-section narrow">
      <div className="container">
        <p className="eyebrow">Contact</p>
        <h1 className="page-title">Start with context, consent and a controlled path.</h1>
        <p className="page-lead">
          Use this first-party enquiry route for personal access, operational workflows,
          partnerships or investment discussions. The form is deliberately narrow: enough context
          to route the request, not a place to disclose secrets.
        </p>
        <div className="contact-grid">
          <article>
            <h2>Use FrankAI</h2>
            <p>Personal assistance, strategic thinking and early user access.</p>
          </article>
          <article>
            <h2>Deploy a solution</h2>
            <p>Operational workflow needs, service platforms and integration discussions.</p>
          </article>
          <article>
            <h2>Partner or invest</h2>
            <p>Platform direction, commercial alignment and technical collaboration.</p>
          </article>
        </div>
        <p className="notice">
          Do not include passwords, banking details, private keys or confidential customer records.
          Enquiries are stored in a protected local operations log for review.
        </p>
        <ContactForm />
      </div>
    </section>
  )
}
