import type { Metadata } from 'next'
import { SectionIntro } from '@/components/SectionIntro'
import { PortfolioCard } from '@/components/PortfolioCard'
import { portfolio } from '@/lib/portfolio'

export const metadata: Metadata = { title: 'Current Development', description: 'A concise view of what FrankAI is building, validating, operating and researching now.' }
const lanes = ['Building', 'Validating', 'Operating', 'Researching'] as const
export default function NowPage() { return <section className="page-section"><div className="container"><SectionIntro eyebrow="Current development" title="What is happening now." text="A maintainable snapshot of FrankAI activity, derived from the public portfolio register rather than a daily-update feed." /><div className="now-grid">{lanes.map((lane) => <section className="now-lane" key={lane}><p className="eyebrow">{lane}</p><div className="now-items">{portfolio.filter((item) => item.nowLane === lane).map((item) => <PortfolioCard item={item} key={item.id} />)}</div></section>)}</div><p className="notice">Current status is a public summary of development maturity. It is not a promise of certification, customer deployment or independent system accountability.</p></div></section> }
