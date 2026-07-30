import Link from 'next/link'
export default function AccountPage() { return <main className="page-shell"><section className="content-section"><p className="eyebrow">Account</p><h1>Your FrankAI account.</h1><p>Manage your active sessions and security settings.</p><p><Link href="/account/sessions">Review active sessions</Link></p></section></main> }
