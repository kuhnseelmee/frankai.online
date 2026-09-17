import type { Metadata } from 'next'
import { SectionIntro } from '@/components/SectionIntro'
import { PortfolioDirectory } from '@/components/PortfolioDirectory'
import { portfolio } from '@/lib/portfolio'

export const metadata: Metadata = { title: 'Labs', description: 'FrankAI research, pilots and emerging technology work.' }
export default function LabsPage() { return <section className="page-section"><div className="container"><SectionIntro eyebrow="Labs" title="Research with a boundary around it." text="Labs are where FrankAI tests emerging approaches. They are presented as pilots or research until repository evidence supports a stronger maturity claim." /><PortfolioDirectory items={portfolio.filter((item) => item.category === 'Lab')} categories={['Lab']} /></div></section> }
