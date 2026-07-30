import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/http'
export default async function AdminInvitationsPage() { const auth = await requireAdmin(new Request('https://frankai.online/admin/invitations', { headers: await headers() })); if (auth.response) redirect('/admin/login'); return <main className="page-shell"><section className="content-section"><p className="eyebrow">Administrator control</p><h1>Invitations.</h1><p>Invitation creation, resend, and revocation are protected by recent MFA.</p><p><Link href="/admin">Back to dashboard</Link></p></section></main> }
