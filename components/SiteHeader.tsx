import Image from 'next/image'
import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-row">
        <Link className="brand" href="/" aria-label="FrankAI home">
          <Image src="/frank-mark.svg" alt="" width={42} height={42} />
          <span>FrankAI</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/solutions">Solutions</Link>
          <Link href="/platform">Platform</Link>
          <Link href="/trust">Trust</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <Link className="button button-small" href="/start">
          Start with Frank
        </Link>
      </div>
    </header>
  )
}
