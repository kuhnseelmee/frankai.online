import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionIntro } from '@/components/SectionIntro'
import { PortfolioDirectory } from '@/components/PortfolioDirectory'
import { portfolio } from '@/lib/portfolio'

export const metadata: Metadata = { title: 'Portfolio evidence', description: 'Evidence-aware portfolio descriptions and maturity boundaries for FrankAI work.' }

const workflow = [
  ['01', 'Context and constraints are gathered without requesting unnecessary private material.'],
  ['02', 'The objective, authority boundary and failure modes are made explicit.'],
  ['03', 'Implementation is tested, reviewed and connected to an appropriate recovery path.'],
  ['04', 'The resulting status is represented honestly: operational, active, pilot, research or private.']
]

export default function ProofPage() { return <section className="page-section"><div className="container"><SectionIntro eyebrow="Evidence-aware portfolio" title="Proof means knowing what is real, what is gated and what is still research." text="FrankAI publishes capability at the level supported by the repository and operating evidence. Private systems are described by architecture only; experiments are not presented as finished products." /><PortfolioDirectory items={portfolio.filter((item) => item.category === 'Platform')} categories={['Platform']} /><div className="proof-workflow"><div><p className="eyebrow">Evidence pattern</p><h2>From intent to accountable work.</h2><p>Systems are more useful when their boundaries, decisions and outcomes can be inspected by the people responsible for them.</p></div><div className="timeline">{workflow.map(([number, text]) => <div className="timeline-item compact" key={number}><span className="pillar-number">{number}</span><p>{text}</p></div>)}</div></div><div className="inline-cta"><p>Want the broader portfolio taxonomy?</p><Link className="text-link" href="/portfolio">View Portfolio <span aria-hidden="true">-&gt;</span></Link></div></div></section> }
