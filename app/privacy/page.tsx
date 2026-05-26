import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy' }

export default function PrivacyPage() {
  return (
    <section className="legal-page">
      <div className="container prose">
        <h1>Privacy</h1>
        <p>FrankAI is being built around a simple rule: entrusted information should be handled with precision and restraint.</p>
        <h2>Website data</h2>
        <p>This public site is designed as an informational website and does not currently expose a public account, contact submission form or analytics tracker.</p>
        <h2>Connected products</h2>
        <p>Products or services linked from this website may handle operational information under their own controls and disclosures. Do not submit sensitive information unless the relevant workflow clearly permits it.</p>
        <h2>Changes</h2>
        <p>This notice will be expanded before broader public account or enquiry functionality is launched.</p>
        <p className="legal-date">Last updated: 26 May 2026</p>
      </div>
    </section>
  )
}
