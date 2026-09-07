import Image from 'next/image'
import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-row">
        <Link className="brand" href="/" aria-label="FrankAI home">
          <Image className="brand-logo" src="/images/logo_frankai.png" alt="FrankAI" width={225} height={96} priority />
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/services/ai-consulting">Services</Link>
          <Link href="/solutions">Solutions</Link>
          <Link href="/proof">Proof</Link>
          <Link href="/platform">Platform</Link>
          <Link href="/governance">Governance</Link>
          <Link href="/trust">Trust</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/admin/login">Admin</Link>
        </nav>
        <Link className="button button-small" href="/start">
          Start with Frank
        </Link>
      </div>
    </header>
  )
}
