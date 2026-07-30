import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/http'
export default async function AdminPage(){const auth=await requireAdmin(new Request('https://frankai.online/admin',{headers:await headers()}));if(auth.response)redirect('/admin/login');return <main className="page-shell"><section className="content-section"><p className="eyebrow">FrankAI administration</p><h1>Operator control.</h1><p>This area is protected by backend administrator authorisation.</p><p><Link href="/admin/platform">Open platform console</Link></p></section></main>}
