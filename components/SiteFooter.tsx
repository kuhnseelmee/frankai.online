import Image from 'next/image'
import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Image className="footer-logo" src="/images/logo_frankai.png" alt="FrankAI" width={225} height={96} />
          <p className="footer-copy">Applied AI engineering, governed systems and consulting.</p>
        </div>
        <div className="footer-links">
          <Link href="/services/ai-consulting">AI Consulting &amp; Agentic Systems</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/agents">Agents</Link>
          <Link href="/methods">Methods</Link>
          <Link href="/labs">Labs</Link>
          <Link href="/now">Current development</Link>
          <Link href="/governance">Governance</Link>
          <Link href="/trust">Trust</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/admin/login">Admin</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
      <p className="copyright">&copy; {new Date().getFullYear()} FrankAI. Built with control, clarity and accountability.</p>
    </footer>
  )
}
