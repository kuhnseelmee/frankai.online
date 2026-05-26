import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms' }

export default function TermsPage() {
  return (
    <section className="legal-page">
      <div className="container prose">
        <h1>Terms</h1>
        <p>This website provides information about FrankAI and its developing products and services.</p>
        <h2>No automated commitments</h2>
        <p>Information presented on this site does not create a service agreement, guarantee availability or authorise automated action on a visitor&apos;s behalf.</p>
        <h2>Product availability</h2>
        <p>Some products and integration capabilities are under active development or limited deployment. Availability and suitable use will be confirmed directly before reliance on them.</p>
        <h2>Responsible use</h2>
        <p>Visitors should not use any linked workflow for unlawful, harmful or unauthorised purposes.</p>
        <p className="legal-date">Last updated: 26 May 2026</p>
      </div>
    </section>
  )
}
