import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyWebhookSignature } from '@/lib/security/webhook-signature'
import { consumeRateLimit } from '@/lib/security/rate-limit'
import type { Database } from '@/types/database'

const payloadSchema = z
  .object({
    assetId: z.string().uuid(),
    externalAlertId: z.string().max(200),
    severity: z.enum(['info', 'warning', 'high', 'critical']),
    title: z.string().min(3).max(160),
    description: z.string().min(3).max(5000),
    occurredAt: z.iso.datetime(),
  })
  .strict()
export async function POST(request: Request) {
  const rate = consumeRateLimit(
    `monitoring:${request.headers.get('x-forwarded-for') ?? 'unknown'}`,
    120,
    60_000,
  )
  if (!rate.allowed)
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  const body = await request.text()
  const secret = process.env.MONITORING_WEBHOOK_SECRET ?? ''
  if (
    !verifyWebhookSignature(
      body,
      request.headers.get('x-itgo-signature'),
      secret,
    )
  )
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  const parsed = payloadSchema.safeParse(JSON.parse(body))
  if (!parsed.success)
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey)
    return NextResponse.json({ error: 'service_unavailable' }, { status: 503 })
  const supabase = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const value = parsed.data
  const { data: alert, error } = await supabase
    .from('monitoring_alerts')
    .upsert(
      {
        asset_id: value.assetId,
        external_alert_id: value.externalAlertId,
        severity: value.severity,
        title: value.title,
        description: value.description,
        occurred_at: value.occurredAt,
      },
      { onConflict: 'asset_id,external_alert_id' },
    )
    .select('id,ticket_id')
    .single()
  if (error)
    return NextResponse.json({ error: 'persistence_failed' }, { status: 500 })
  let ticketId = alert.ticket_id
  if (value.severity === 'critical' && !ticketId) {
    const result = await supabase.rpc('create_ticket_from_critical_alert', {
      p_alert_id: alert.id,
    })
    if (result.error)
      return NextResponse.json(
        { error: 'ticket_creation_failed' },
        { status: 500 },
      )
    ticketId = result.data
  }
  return NextResponse.json(
    { status: 'accepted', alertId: alert.id, ticketId },
    { status: 202 },
  )
}
