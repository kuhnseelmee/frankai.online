import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/http'
import { publicUser } from '@/lib/auth/store'
export const runtime = 'nodejs'
export async function GET(request: Request) { const auth = await requireUser(request); return auth.response || NextResponse.json({ user: publicUser(auth.user!) }) }
