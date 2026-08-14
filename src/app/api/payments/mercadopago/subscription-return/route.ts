import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
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
    let localSubscriptionId = subscription.external_reference
    if (!localSubscriptionId || !/^[0-9a-f-]{36}$/i.test(localSubscriptionId)) {
      const supabase = await createSupabaseServerClient()
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) throw new Error('authentication_required')
      const { data: pending, error: pendingError } = await supabase
        .from('company_subscriptions')
        .select('id')
        .eq('status', 'pending')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (pendingError || !pending)
        throw new Error('pending_subscription_not_found')
      localSubscriptionId = pending.id
    }
    const admin = createSupabaseAdminClient()
    const { error } = await admin.rpc('sync_company_subscription', {
      p_subscription_id: localSubscriptionId,
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
