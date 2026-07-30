import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/http'
export default async function AdminAuditPage() { const auth = await requireAdmin(new Request('https://frankai.online/admin/audit', { headers: await headers() })); if (auth.response) redirect('/admin/login'); return <main className="page-shell"><section className="content-section"><p className="eyebrow">Administrator control</p><h1>Audit.</h1><p>Security actions are recorded server-side with sanitized metadata.</p><p><Link href="/admin">Back to dashboard</Link></p></section></main> }
