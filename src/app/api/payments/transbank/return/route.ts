import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { commitWebpayTransaction } from '@/services/transbank.service'

async function finishWebpayReturn(input: {
  request: NextRequest
  token: string
  cancelled: boolean
}) {
  const { request, token, cancelled } = input
  const destination = new URL('/app/billing', request.url)
  const admin = createSupabaseAdminClient()
  const { data: payment } = await admin
    .from('payments')
    .select('id,status,provider_buy_order,subscription_id')
    .eq('provider', 'transbank')
    .eq('provider_reference', token)
    .maybeSingle()
  if (!payment) {
    destination.searchParams.set('payment', 'verification_error')
    return NextResponse.redirect(destination, 303)
  }
  if (cancelled) {
    await admin
      .from('payments')
      .update({ status: 'cancelled' })
      .eq('id', payment.id)
    destination.searchParams.set(
      payment.subscription_id ? 'subscription' : 'payment',
      'cancelled',
    )
    return NextResponse.redirect(destination, 303)
  }
  if (payment.status === 'captured') {
    destination.searchParams.set(
      payment.subscription_id ? 'subscription' : 'payment',
      'success',
    )
    return NextResponse.redirect(destination, 303)
  }
  try {
    const result = await commitWebpayTransaction(token)
    const rpcName = payment.subscription_id
      ? 'finalize_transbank_subscription_payment'
      : 'finalize_transbank_ticket_payment'
    const { error } = await admin.rpc(rpcName, {
      p_payment_id: payment.id,
      p_provider_reference: token,
      p_buy_order: result.buy_order,
      p_amount: result.amount,
      p_provider_status: result.status,
      p_response_code: result.response_code,
    })
    if (error) throw error
    const success = result.status === 'AUTHORIZED' && result.response_code === 0
    destination.searchParams.set(
      payment.subscription_id ? 'subscription' : 'payment',
      success ? 'success' : 'failed',
    )
  } catch (commitError) {
    console.error('[transbank:return] verification failed', {
      paymentId: payment.id,
      error:
        commitError instanceof Error ? commitError.message : 'unknown_error',
    })
    destination.searchParams.set(
      payment.subscription_id ? 'subscription' : 'payment',
      'transbank_verification_error',
    )
  }
  return NextResponse.redirect(destination, 303)
}

export async function POST(request: NextRequest) {
  const form = await request.formData()
  const approvedToken = String(form.get('token_ws') ?? '')
  const token = approvedToken || String(form.get('TBK_TOKEN') ?? '')
  if (!token)
    return NextResponse.redirect(
      new URL('/app/billing?payment=cancelled', request.url),
      303,
    )
  return finishWebpayReturn({
    request,
    token,
    cancelled: !approvedToken,
  })
}

export async function GET(request: NextRequest) {
  const approvedToken = request.nextUrl.searchParams.get('token_ws') ?? ''
  const cancelledToken = request.nextUrl.searchParams.get('TBK_TOKEN') ?? ''
  let token = approvedToken || cancelledToken
  const paymentId = request.nextUrl.searchParams.get('paymentId') ?? ''

  if (!token && /^[0-9a-f-]{36}$/i.test(paymentId)) {
    const admin = createSupabaseAdminClient()
    const { data } = await admin
      .from('payments')
      .select('provider_reference')
      .eq('id', paymentId)
      .eq('provider', 'transbank')
      .maybeSingle()
    token = data?.provider_reference ?? ''
  }

  if (!token)
    return NextResponse.redirect(
      new URL('/app/billing?payment=cancelled', request.url),
      303,
    )

  return finishWebpayReturn({
    request,
    token,
    cancelled: Boolean(cancelledToken),
  })
}
