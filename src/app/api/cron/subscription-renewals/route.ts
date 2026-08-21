import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET
  const header = request.headers.get('authorization')
  if (!secret || !header?.startsWith('Bearer ')) return false
  const supplied = Buffer.from(header.slice('Bearer '.length))
  const expected = Buffer.from(secret)
  return (
    supplied.length === expected.length && timingSafeEqual(supplied, expected)
  )
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase.rpc('process_subscription_renewals')
  if (error) {
    console.error('subscription_renewal_cron_failed', {
      code: error.code,
      message: error.message,
    })
    return NextResponse.json(
      { error: 'renewal_processing_failed' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, result: data })
}
