import Image from 'next/image'
import Link from 'next/link'

const navigation = [
  ['/portfolio', 'Portfolio'],
  ['/services/ai-consulting', 'Consulting'],
  ['/agents', 'Agents'],
  ['/methods', 'Methods'],
  ['/labs', 'Labs'],
  ['/now', 'Now'],
  ['/about', 'About']
] as const

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-row">
        <Link className="brand" href="/" aria-label="FrankAI home">
          <Image className="brand-logo" src="/images/logo_frankai.png" alt="FrankAI" width={225} height={96} priority />
        </Link>
        <nav className="nav-links desktop-nav" aria-label="Main navigation">
          {navigation.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
        </nav>
        <Link className="button button-small header-cta" href="/contact">Discuss a project</Link>
        <details className="mobile-nav">
          <summary>Menu</summary>
          <nav className="mobile-nav-panel" aria-label="Mobile navigation">
            {navigation.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
            <Link href="/governance">Governance</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/login">Sign in</Link>
          </nav>
        </details>
      </div>
    </header>
  )
}
