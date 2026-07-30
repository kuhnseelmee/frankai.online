import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/http'
export const runtime = 'nodejs'
export async function GET(request: Request) { const auth = await requireUser(request); if (auth.response) return auth.response; return NextResponse.json({ enabled: process.env.VOICE_ENABLED === 'true', microphoneDisclosureRequired: true, audioRetention: false, transcriptRetention: false }) }
