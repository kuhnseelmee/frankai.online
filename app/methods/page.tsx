import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionIntro } from '@/components/SectionIntro'

export const metadata: Metadata = { title: 'Methods', description: 'FrankAI context engineering and evidence-led development methods.' }
const steps = ['Reconstruct context', 'Establish the objective', 'Define constraints', 'Identify authoritative evidence', 'Fact-check important claims', 'Structure the task', 'Iterate deliberately', 'Preserve continuity', 'Validate the output', 'Finish professionally']

export default function MethodsPage() { return <section className="page-section"><div className="container"><SectionIntro eyebrow="FrankAI Context Engineering Method" title="Prompting is disciplined specification." text="The method developed through FrankAI work treats context as an engineering input. It turns an ambiguous request into a traceable, maintainable and validated result." /><div className="method-grid">{steps.map((step, i) => <article className="path-card" key={step}><p className="pillar-number">{String(i + 1).padStart(2, '0')}</p><h3>{step}</h3><p>{['Recover what matters before proposing an answer.', 'Name the result that would make the work useful.', 'Make scope, risk and boundaries explicit.', 'Separate evidence from assumption.'][i % 4]}</p></article>)}</div><div className="inline-cta"><p>Methods are applied in consulting and platform work.</p><Link className="button" href="/services/ai-consulting">Explore AI Consulting</Link></div></div></section> }
