import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { verifyMercadoPagoWebhook } from '@/lib/security/mercadopago-webhook'
import {
  getMercadoPagoPayment,
  getMercadoPagoSubscription,
} from '@/services/mercadopago.service'

const notificationSchema = z
  .object({
    type: z.string().optional(),
    action: z.string().optional(),
    data: z.object({ id: z.union([z.string(), z.number()]) }).optional(),
  })
  .passthrough()

export async function POST(request: Request) {
  const requestId = request.headers.get('x-request-id')
  const signature = request.headers.get('x-signature')
  const url = new URL(request.url)
  const queryDataId = url.searchParams.get('data.id')
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? ''

  if (
    !verifyMercadoPagoWebhook({
      dataId: queryDataId,
      requestId,
      signature,
      secret,
    })
  ) {
    return NextResponse.json({ received: false }, { status: 401 })
  }

  const parsed = notificationSchema.safeParse(
    await request.json().catch(() => ({})),
  )
  if (!parsed.success || !requestId) {
    return NextResponse.json({ received: false }, { status: 400 })
  }

  const resourceId =
    queryDataId ?? (parsed.data.data?.id ? String(parsed.data.data.id) : null)
  const admin = createSupabaseAdminClient()
  const { error: eventError } = await admin
    .from('payment_webhook_events')
    .upsert(
      {
        provider: 'mercado_pago',
        request_id: requestId,
        provider_resource_id: resourceId,
        event_type: parsed.data.type ?? null,
        action: parsed.data.action ?? null,
        signature_valid: true,
        payload: {
          type: parsed.data.type ?? null,
          action: parsed.data.action ?? null,
          data_id: resourceId,
        },
      },
      { onConflict: 'provider,request_id', ignoreDuplicates: true },
    )

  if (eventError) {
    console.error('[mercadopago:webhook] event_store_failed', {
      requestId,
      code: eventError.code,
    })
    return NextResponse.json({ received: false }, { status: 500 })
  }
  const { data: event, error: lookupError } = await admin
    .from('payment_webhook_events')
    .select('id,status')
    .eq('provider', 'mercado_pago')
    .eq('request_id', requestId)
    .single()
  if (lookupError) {
    console.error('[mercadopago:webhook] event_lookup_failed', {
      requestId,
      code: lookupError.code,
    })
    return NextResponse.json({ received: false }, { status: 500 })
  }
  if (event.status === 'processed' || event.status === 'ignored')
    return NextResponse.json({ received: true })

  const isSubscriptionEvent =
    parsed.data.type?.includes('subscription') ||
    parsed.data.action?.includes('subscription') ||
    parsed.data.action?.includes('preapproval')
  if (isSubscriptionEvent && resourceId) {
    try {
      const subscription = await getMercadoPagoSubscription(resourceId)
      let localSubscriptionId = subscription.external_reference
      if (
        !localSubscriptionId ||
        !/^[0-9a-f-]{36}$/i.test(localSubscriptionId)
      ) {
        const { data: existing, error: existingError } = await admin
          .from('company_subscriptions')
          .select('id')
          .eq('provider_subscription_id', subscription.id)
          .maybeSingle()
        if (existingError || !existing)
          throw new Error('subscription_not_mapped')
        localSubscriptionId = existing.id
      }
      const { error } = await admin.rpc('sync_company_subscription', {
        p_subscription_id: localSubscriptionId,
        p_provider_subscription_id: subscription.id,
        p_status: subscription.status,
        p_checkout_url: subscription.init_point,
      })
      if (error) throw error
      await admin
        .from('payment_webhook_events')
        .update({ status: 'processed', processed_at: new Date().toISOString() })
        .eq('id', event.id)
      return NextResponse.json({ received: true })
    } catch (error) {
      console.error('[mercadopago:webhook] subscription_failed', {
        requestId,
        error: error instanceof Error ? error.message : 'unknown_error',
      })
      await admin
        .from('payment_webhook_events')
        .update({
          status: 'failed',
          error_code: 'subscription_sync_failed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', event.id)
      return NextResponse.json({ received: false }, { status: 500 })
    }
  }

  if (parsed.data.type !== 'payment' || !resourceId) {
    await admin
      .from('payment_webhook_events')
      .update({ status: 'ignored', processed_at: new Date().toISOString() })
      .eq('id', event.id)
    return NextResponse.json({ received: true })
  }

  try {
    const providerPayment = await getMercadoPagoPayment(resourceId)
    if (
      !providerPayment.external_reference ||
      !/^[0-9a-f-]{36}$/i.test(providerPayment.external_reference)
    ) {
      await admin
        .from('payment_webhook_events')
        .update({
          status: 'ignored',
          error_code: 'unknown_external_reference',
          processed_at: new Date().toISOString(),
        })
        .eq('id', event.id)
      return NextResponse.json({ received: true })
    }
    const { error } = await admin.rpc('finalize_mercadopago_ticket_payment', {
      p_payment_id: providerPayment.external_reference,
      p_provider_reference: String(providerPayment.id),
      p_amount: providerPayment.transaction_amount,
      p_provider_status: providerPayment.status,
    })
    if (error) throw error
    await admin
      .from('payment_webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('id', event.id)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[mercadopago:webhook] processing_failed', {
      requestId,
      error: error instanceof Error ? error.message : 'unknown_error',
    })
    await admin
      .from('payment_webhook_events')
      .update({
        status: 'failed',
        error_code: 'processing_failed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', event.id)
    return NextResponse.json({ received: false }, { status: 500 })
  }
}
