import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/http'
export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) { const auth = await requireAdmin(new Request('https://frankai.online/admin/users', { headers: await headers() })); if (auth.response) redirect('/admin/login'); const { id } = await params; return <main className="page-shell"><section className="content-section"><p className="eyebrow">Administrator control</p><h1>User detail.</h1><p>Selected account: <code>{id}</code></p><p>State-changing actions require recent MFA and explicit confirmation.</p><p><Link href="/admin/users">Back to users</Link></p></section></main> }
