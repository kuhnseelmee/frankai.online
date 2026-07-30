import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/http'

export default async function AdminUsersPage() { const auth = await requireAdmin(new Request('https://frankai.online/admin/users', { headers: await headers() })); if (auth.response) redirect('/admin/login'); return <main className="page-shell"><section className="content-section"><p className="eyebrow">Administrator control</p><h1>Users.</h1><p>Search, inspect, and manage accounts through the protected administrator API.</p><p><Link href="/admin">Back to dashboard</Link></p><p>Use the API-backed staging console for status, role, session, MFA, and audit actions.</p></section></main> }
