import Image from 'next/image'
import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-identity">
          <Image className="footer-logo" src="/images/logo_frankai.png" alt="FrankAI" width={225} height={96} />
          <p className="footer-copy">Applied AI engineering, governed systems and consulting.</p>
          <p className="footer-principal">Founded and directed by Raymond Wooler.</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/services/ai-consulting">AI Consulting</Link>
          <Link href="/agents">Agents</Link>
          <Link href="/methods">Methods</Link>
          <Link href="/labs">Labs</Link>
          <Link href="/now">Current Development</Link>
          <Link href="/about">About</Link>
          <Link href="/governance">Governance</Link>
          <Link href="/proof">Evidence</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
      <p className="copyright">&copy; {new Date().getFullYear()} FrankAI. Human-directed. Evidence-led. Built to remain accountable.</p>
    </footer>
  )
}
