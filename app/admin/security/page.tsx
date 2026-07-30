import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/http'
export default async function AdminSecurityPage() { const auth = await requireAdmin(new Request('https://frankai.online/admin/security', { headers: await headers() })); if (auth.response) redirect('/admin/login'); return <main className="page-shell"><section className="content-section"><p className="eyebrow">Administrator security</p><h1>Security.</h1><p>MFA, recovery, session, email, and voice-disabled status are managed through protected controls.</p><p><Link href="/admin/mfa">MFA setup</Link> · <Link href="/admin">Back to dashboard</Link></p></section></main> }
