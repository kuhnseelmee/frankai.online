import Image from 'next/image'
import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Image className="footer-logo" src="/images/logo_frankai.png" alt="FrankAI" width={150} height={64} />
          <p className="footer-copy">Intelligence that moves work forward.</p>
        </div>
        <div className="footer-links">
          <Link href="/solutions">Solutions</Link>
          <Link href="/proof">Proof</Link>
          <Link href="/platform">Platform</Link>
          <Link href="/governance">Governance</Link>
          <Link href="/rollout">Rollout</Link>
          <Link href="/memory">Memory</Link>
          <Link href="/docs">Docs</Link>
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
