import type { Metadata } from 'next'
import { SectionIntro } from '@/components/SectionIntro'
import { PortfolioDirectory } from '@/components/PortfolioDirectory'
import { portfolio } from '@/lib/portfolio'

export const metadata: Metadata = { title: 'Portfolio', description: 'A maturity-aware portfolio of FrankAI platforms, services, methods and research labs.' }

export default function PortfolioPage() { return <section className="page-section"><div className="container"><SectionIntro eyebrow="Portfolio register" title="Practical systems, clearly scoped." text="FrankAI work spans platforms, professional services, reusable methods and research labs. Status and visibility are part of the description." /><PortfolioDirectory items={portfolio} /></div></section> }
