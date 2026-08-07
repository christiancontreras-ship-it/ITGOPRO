import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getMercadoPagoSubscription } from '@/services/mercadopago.service'

export async function GET(request: NextRequest) {
  const providerId =
    request.nextUrl.searchParams.get('preapproval_id') ??
    request.nextUrl.searchParams.get('id')
  const destination = new URL('/app/billing', request.url)
  if (!providerId) {
    destination.searchParams.set('subscription', 'cancelled')
    return NextResponse.redirect(destination)
  }
  try {
    const subscription = await getMercadoPagoSubscription(providerId)
    if (!/^[0-9a-f-]{36}$/i.test(subscription.external_reference))
      throw new Error('invalid_external_reference')
    const admin = createSupabaseAdminClient()
    const { error } = await admin.rpc('sync_company_subscription', {
      p_subscription_id: subscription.external_reference,
      p_provider_subscription_id: subscription.id,
      p_status: subscription.status,
      p_checkout_url: subscription.init_point,
    })
    if (error) throw error
    destination.searchParams.set(
      'subscription',
      subscription.status === 'authorized' ? 'success' : subscription.status,
    )
  } catch (error) {
    console.error('[mercadopago:subscription:return] failed', {
      providerId,
      error: error instanceof Error ? error.message : 'unknown_error',
    })
    destination.searchParams.set('subscription', 'verification_error')
  }
  return NextResponse.redirect(destination)
}
