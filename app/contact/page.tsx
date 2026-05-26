import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact FrankAI about access, solutions or partnership.'
}

export default function ContactPage() {
  return (
    <section className="page-section narrow">
      <div className="container">
        <p className="eyebrow">Contact</p>
        <h1 className="page-title">A direct conversation begins with the right context.</h1>
        <p className="page-lead">
          The first-party enquiry channel is being commissioned alongside this site. For now,
          identify your interest through the person or channel that introduced you to FrankAI.
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
          No contact form has been exposed until its privacy handling and delivery path are fully controlled.
        </p>
      </div>
    </section>
  )
}
