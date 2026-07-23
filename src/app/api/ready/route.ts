import { NextResponse } from 'next/server'
import { platformStatus } from '@/lib/operations/health'

export const dynamic = 'force-dynamic'
export function GET() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
  return NextResponse.json(platformStatus(configured ? 'ok' : 'degraded'), {
    status: configured ? 200 : 503,
  })
}
