import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">FrankAI</p>
          <p className="footer-copy">Intelligence that moves work forward.</p>
        </div>
        <div className="footer-links">
          <Link href="/solutions">Solutions</Link>
          <Link href="/platform">Platform</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
      <p className="copyright">&copy; {new Date().getFullYear()} FrankAI. Built with control, clarity and accountability.</p>
    </footer>
  )
}
