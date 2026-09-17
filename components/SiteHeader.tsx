import Image from 'next/image'
import Link from 'next/link'

export function SiteHeader() {
  const links = [
    ['/services/ai-consulting', 'AI Consulting'],
    ['/portfolio', 'Portfolio'],
    ['/agents', 'Agents'],
    ['/methods', 'Methods'],
    ['/labs', 'Labs'],
    ['/governance', 'Governance'],
    ['/about', 'About'],
    ['/now', 'Now']
  ]
  return (
    <header className="site-header">
      <div className="container nav-row">
        <Link className="brand" href="/" aria-label="FrankAI home">
          <Image className="brand-logo" src="/images/logo_frankai.png" alt="FrankAI" width={225} height={96} priority />
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          {links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
        </nav>
        <details className="mobile-nav">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            {links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
            <Link href="/contact">Contact</Link>
            <Link href="/login">Sign in</Link>
          </nav>
        </details>
        <Link className="button button-small" href="/start">
          Start with Frank
        </Link>
      </div>
    </header>
  )
}
